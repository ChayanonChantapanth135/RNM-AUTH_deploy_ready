import { connectToDatabase } from '../lib/db.js';
import { emitNotificationToUser, emitTaskEvent } from '../lib/socket.js';
import { sendTaskOverdueLeaderEmail, sendProjectOverdueManagerEmail } from './emailService.js';

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
      const targetRecipients = new Map(); // userId -> { email, name, isAssignee }

      // 1. Direct leader of the assignee
      if (task.leader_id && task.leader_email) {
        targetRecipients.set(Number(task.leader_id), {
          email: task.leader_email,
          name: task.leader_name,
          isAssignee: false,
        });
      }

      // 2. Project Team Leaders
      const [ptlRows] = await db.query(
        'SELECT ptl.user_id, u.fullname, u.email FROM project_team_leaders ptl JOIN users u ON ptl.user_id = u.id WHERE ptl.project_id = ? AND u.deleted_at IS NULL',
        [task.project_id]
      );
      for (const row of ptlRows) {
        if (row.email) {
          targetRecipients.set(Number(row.user_id), {
            email: row.email,
            name: row.fullname,
            isAssignee: false,
          });
        }
      }

      // 3. The assigned user (Assignee) themselves
      if (task.assignee_id && task.assignee_email) {
        targetRecipients.set(Number(task.assignee_id), {
          email: task.assignee_email,
          name: task.assignee_name,
          isAssignee: true,
        });
      }

      // If no recipient found at all, continue
      if (targetRecipients.size === 0) {
        continue;
      }

      const formattedDue = formatDate(task.due_date);
      const title = 'แจ้งเตือนงานเกินกำหนดส่ง (Overdue)';
      const link = null;
      const notifType = 'task_overdue';

      for (const [targetUserId, recipientInfo] of targetRecipients.entries()) {
        const message = recipientInfo.isAssignee
          ? `งาน "${task.task_title}" ของคุณในโปรเจกต์ "${task.project_name}" ยังไม่เสร็จและเกินกำหนดส่งแล้ว (กำหนดส่ง: ${formattedDue})`
          : `งาน "${task.task_title}" ของ ${task.assignee_name} ในโปรเจกต์ "${task.project_name}" ยังไม่เสร็จและเกินกำหนดส่งแล้ว (กำหนดส่ง: ${formattedDue})`;

        // Prevent duplicate notification to the same user/leader for this task on the same day
        const [existing] = await db.query(
          `SELECT id FROM notifications 
           WHERE user_id = ? AND task_id = ? AND type = ? AND DATE(created_at) = CURDATE()
           LIMIT 1`,
          [targetUserId, task.task_id, notifType]
        );

        if (existing.length > 0) {
          // Already notified today
          continue;
        }

        // Insert notification
        const [insertRes] = await db.query(
          `INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status)
           VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
          [targetUserId, task.task_id, title, message, notifType, link]
        );

        const notifPayload = {
          id: insertRes.insertId,
          user_id: targetUserId,
          task_id: task.task_id,
          project_id: task.project_id,
          title,
          message,
          type: notifType,
          link,
          created_at: new Date().toISOString()
        };

        // Realtime notification via Socket.io
        emitNotificationToUser(targetUserId, notifPayload);

        notifiedCount++;

        // Send Email to the leader & assignee ONLY when a new daily notification is created (max 1 per task per day)
        if (recipientInfo.email) {
          sendTaskOverdueLeaderEmail({
            taskId: task.task_id,
            recipientEmail: recipientInfo.email,
            recipientName: recipientInfo.name,
            assigneeName: task.assignee_name,
            taskTitle: task.task_title,
            projectName: task.project_name,
            dueDate: task.due_date,
            priority: task.task_priority,
            status: task.task_status,
            isAssignee: recipientInfo.isAssignee
          }).catch(err => {
            console.error('[Task Scheduler Email Error]', err.message);
          });
        }
      }

      // Real-time task overdue event
      emitTaskEvent('task:overdue', {
        taskId: task.task_id,
        projectId: task.project_id,
        assigneeId: task.assignee_id,
        dueDate: task.due_date,
      });
    }

    if (notifiedCount > 0) {
      console.log(`[Task Scheduler] Checked ${tasks.length} overdue tasks. Sent ${notifiedCount} notifications to leaders.`);
    }

    // =========================================================================
    // 2. Check for overdue, uncompleted projects and notify Project Manager (created_by)
    // =========================================================================
    const [overdueProjects] = await db.query(`
      SELECT 
        p.id AS project_id,
        p.name AS project_name,
        p.status AS project_status,
        p.priority AS project_priority,
        p.end_date,
        p.created_by,
        MAX(u_pm.id) AS pm_id,
        MAX(u_pm.fullname) AS pm_name,
        MAX(u_pm.email) AS pm_email,
        GROUP_CONCAT(DISTINCT u_tl.fullname SEPARATOR ', ') AS team_leader_names
      FROM projects p
      LEFT JOIN users u_pm ON p.created_by = u_pm.id AND u_pm.deleted_at IS NULL
      LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
      LEFT JOIN users u_tl ON ptl.user_id = u_tl.id AND u_tl.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
        AND p.status != 'Completed'
        AND p.end_date IS NOT NULL
        AND p.end_date < CURDATE()
      GROUP BY p.id, p.name, p.status, p.priority, p.end_date, p.created_by
    `);

    let projectNotifiedCount = 0;

    for (const proj of overdueProjects) {
      const targetManagers = new Map(); // userId -> { email, name }

      if (proj.pm_id && proj.pm_email) {
        targetManagers.set(Number(proj.pm_id), {
          email: proj.pm_email,
          name: proj.pm_name,
        });
      } else {
        // Fallback: notify active users with role 'manager'
        const [managers] = await db.query(
          `SELECT id, fullname, email FROM users WHERE role = 'manager' AND status = 'active' AND deleted_at IS NULL`
        );
        for (const m of managers) {
          if (m.email) {
            targetManagers.set(Number(m.id), { email: m.email, name: m.fullname });
          }
        }
      }

      if (targetManagers.size === 0) continue;

      const formattedEnd = formatDate(proj.end_date);
      const projTitle = 'แจ้งเตือนโปรเจกต์เกินกำหนดส่ง (Project Overdue)';
      const projMessage = `โปรเจกต์ "${proj.project_name}" ยังไม่เสร็จสิ้นและเลยวันกำหนดส่งแล้ว (กำหนดส่ง: ${formattedEnd})`;
      const projLink = `/Projects?projectId=${proj.project_id}`;
      const projNotifType = 'project_overdue';

      for (const [managerId, managerInfo] of targetManagers.entries()) {
        const [existingProjNotif] = await db.query(
          `SELECT id FROM notifications 
           WHERE user_id = ? AND type = ? AND message = ? AND DATE(created_at) = CURDATE()
           LIMIT 1`,
          [managerId, projNotifType, projMessage]
        );

        if (existingProjNotif.length === 0) {
          const [insertProjRes] = await db.query(
            `INSERT INTO notifications (user_id, title, message, type, link, is_read, read_status)
             VALUES (?, ?, ?, ?, ?, 0, 0)`,
            [managerId, projTitle, projMessage, projNotifType, projLink]
          );

          emitNotificationToUser(managerId, {
            id: insertProjRes.insertId,
            user_id: managerId,
            project_id: proj.project_id,
            title: projTitle,
            message: projMessage,
            type: projNotifType,
            link: projLink,
            created_at: new Date().toISOString(),
          });

          projectNotifiedCount++;

          // Send Overdue Project Email to Project Manager ONLY when a new daily notification is created
          sendProjectOverdueManagerEmail({
            projectId: proj.project_id,
            recipientEmail: managerInfo.email,
            recipientName: managerInfo.name,
            projectName: proj.project_name,
            teamLeaderName: proj.team_leader_names || '-',
            endDate: proj.end_date,
            priority: proj.project_priority,
            status: proj.project_status,
          }).catch((err) => {
            console.error('[Project Scheduler Email Error]', err.message);
          });
        }
      }
    }

    if (projectNotifiedCount > 0) {
      console.log(`[Task Scheduler] Checked ${overdueProjects.length} overdue projects. Sent ${projectNotifiedCount} notifications to Project Managers.`);
    }

    return { checkedCount: tasks.length, notifiedCount: notifiedCount + projectNotifiedCount };
  } catch (error) {
    console.error('[Task Scheduler Error]', error.message);
    return { checkedCount: 0, notifiedCount: 0, error: error.message };
  }
}

/**
 * Start the recurring task scheduler (Runs once a day to conserve DB & Resend email quota)
 */
export function startTaskScheduler() {
  console.log('[Task Scheduler] Starting daily scheduler service for overdue tasks & projects...');

  // Initial check 10 seconds after server startup
  setTimeout(() => {
    checkOverdueTasksAndNotifyLeaders().catch(err => {
      console.error('[Task Scheduler Initial Run Error]', err.message);
    });
  }, 10000);

  // Check periodically once every 24 hours (86,400,000 ms)
  const INTERVAL_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    checkOverdueTasksAndNotifyLeaders().catch(err => {
      console.error('[Task Scheduler Recurring Run Error]', err.message);
    });
  }, INTERVAL_MS);
}
