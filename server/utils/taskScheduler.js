import { connectToDatabase } from '../lib/db.js';
import { emitNotificationToUser, emitTaskEvent } from '../lib/socket.js';
import { sendTaskOverdueLeaderEmail } from './emailService.js';

/**
 * Format date string into YYYY-MM-DD
 */
function formatDate(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toISOString().split('T')[0];
  } catch {
    return String(dateVal);
  }
}

/**
 * Check for overdue, uncompleted tasks and notify the assignee's leader
 * @returns {Promise<{checkedCount: number, notifiedCount: number}>}
 */
export async function checkOverdueTasksAndNotifyLeaders() {
  let db;
  try {
    db = await connectToDatabase();

    // Query tasks that have due_date in the past (< CURDATE()), status not 'Completed', and assigned to a user
    const [tasks] = await db.query(`
      SELECT 
        t.id AS task_id,
        t.title AS task_title,
        t.status AS task_status,
        t.priority AS task_priority,
        t.due_date,
        p.id AS project_id,
        p.name AS project_name,
        p.created_by AS project_creator,
        u_assignee.id AS assignee_id,
        u_assignee.fullname AS assignee_name,
        u_assignee.email AS assignee_email,
        u_assignee.leader_id AS direct_leader_id,
        u_leader.id AS leader_id,
        u_leader.fullname AS leader_name,
        u_leader.email AS leader_email
      FROM tasks t
      JOIN projects p ON t.project_id = p.id AND p.deleted_at IS NULL
      JOIN users u_assignee ON t.assigned_to = u_assignee.id AND u_assignee.deleted_at IS NULL
      LEFT JOIN users u_leader ON u_assignee.leader_id = u_leader.id AND u_leader.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
        AND t.status != 'Completed'
        AND t.due_date IS NOT NULL
        AND t.due_date < CURDATE()
    `);

    let notifiedCount = 0;

    for (const task of tasks) {
      const targetLeaderIds = new Set();
      let leaderEmail = null;
      let leaderName = null;

      // 1. Direct leader of the assignee
      if (task.leader_id) {
        targetLeaderIds.add(Number(task.leader_id));
        leaderEmail = task.leader_email;
        leaderName = task.leader_name;
      }

      // 2. If no direct leader set on the user, fallback to Project Team Leaders
      if (targetLeaderIds.size === 0) {
        const [ptlRows] = await db.query(
          'SELECT ptl.user_id, u.fullname, u.email FROM project_team_leaders ptl JOIN users u ON ptl.user_id = u.id WHERE ptl.project_id = ? AND u.deleted_at IS NULL',
          [task.project_id]
        );
        for (const row of ptlRows) {
          targetLeaderIds.add(Number(row.user_id));
          if (!leaderEmail) {
            leaderEmail = row.email;
            leaderName = row.fullname;
          }
        }
      }

      // If still no leader found, continue
      if (targetLeaderIds.size === 0) {
        continue;
      }

      const formattedDue = formatDate(task.due_date);
      const title = 'แจ้งเตือนงานเกินกำหนดส่ง (Overdue)';
      const message = `งาน "${task.task_title}" ของ ${task.assignee_name} ในโปรเจกต์ "${task.project_name}" ยังไม่เสร็จและเกินกำหนดส่งแล้ว (กำหนดส่ง: ${formattedDue})`;
      const link = null;
      const notifType = 'task_overdue';

      for (const targetLeaderId of targetLeaderIds) {
        // Prevent duplicate notification to the same leader for this task on the same day
        const [existing] = await db.query(
          `SELECT id FROM notifications 
           WHERE user_id = ? AND task_id = ? AND type = ? AND DATE(created_at) = CURDATE()
           LIMIT 1`,
          [targetLeaderId, task.task_id, notifType]
        );

        if (existing.length > 0) {
          // Already notified today
          continue;
        }

        // Insert notification
        const [insertRes] = await db.query(
          `INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status)
           VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
          [targetLeaderId, task.task_id, title, message, notifType, link]
        );

        const notifPayload = {
          id: insertRes.insertId,
          user_id: targetLeaderId,
          task_id: task.task_id,
          project_id: task.project_id,
          title,
          message,
          type: notifType,
          link,
          created_at: new Date().toISOString()
        };

        // Real-time notification via Socket.io
        emitNotificationToUser(targetLeaderId, notifPayload);

        notifiedCount++;
      }

      // Real-time task overdue event
      emitTaskEvent('task:overdue', {
        taskId: task.task_id,
        projectId: task.project_id,
        assigneeId: task.assignee_id,
        dueDate: task.due_date,
      });

      // Send Email to the leader (asynchronously)
      if (leaderEmail) {
        sendTaskOverdueLeaderEmail({
          recipientEmail: leaderEmail,
          recipientName: leaderName,
          assigneeName: task.assignee_name,
          taskTitle: task.task_title,
          projectName: task.project_name,
          dueDate: task.due_date,
          priority: task.task_priority,
          status: task.task_status
        }).catch(err => {
          console.error('[Task Scheduler Email Error]', err.message);
        });
      }
    }

    if (notifiedCount > 0) {
      console.log(`[Task Scheduler] Checked ${tasks.length} overdue tasks. Sent ${notifiedCount} notifications to leaders.`);
    }

    return { checkedCount: tasks.length, notifiedCount };
  } catch (error) {
    console.error('[Task Scheduler Error]', error.message);
    return { checkedCount: 0, notifiedCount: 0, error: error.message };
  }
}

/**
 * Start the recurring task scheduler
 */
export function startTaskScheduler() {
  console.log('[Task Scheduler] Starting task scheduler service for overdue tasks...');

  // Initial check 6 seconds after server startup
  setTimeout(() => {
    checkOverdueTasksAndNotifyLeaders().catch(err => {
      console.error('[Task Scheduler Initial Run Error]', err.message);
    });
  }, 6000);

  // Check periodically every 1 hour (3600000 ms)
  const INTERVAL_MS = 60 * 60 * 1000;
  setInterval(() => {
    checkOverdueTasksAndNotifyLeaders().catch(err => {
      console.error('[Task Scheduler Recurring Run Error]', err.message);
    });
  }, INTERVAL_MS);
}
