import { connectToDatabase } from '../lib/db.js'
import { emitNotificationToUser } from '../lib/socket.js'

/**
 * ดึงรายการการแจ้งเตือนของผู้ใช้ที่ล็อกอินอยู่
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    // ดึงการแจ้งเตือน 50 รายการล่าสุด
    const [rows] = await db.query(
      `SELECT id, user_id, task_id, title, message, type, link, COALESCE(is_read, read_status, 0) as is_read, created_at 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    // นับจำนวนที่ยังไม่ได้อ่าน
    const [unreadRows] = await db.query(
      `SELECT COUNT(*) as unreadCount 
       FROM notifications 
       WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL) AND (read_status = 0 OR read_status IS NULL)`,
      [userId]
    );

    return res.status(200).json({
      notifications: rows,
      unreadCount: unreadRows[0]?.unreadCount || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนเดี่ยวว่าอ่านแล้ว
 */
export const markAsRead = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const db = await connectToDatabase();

    // ทำเครื่องหมายอ่านแล้ว
    await db.query(
      `UPDATE notifications 
       SET is_read = 1, read_status = 1 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error updating notification' });
  }
};

/**
 * ทำเครื่องหมายการแจ้งเตือนทั้งหมดว่าอ่านแล้ว
 */
export const markAllAsRead = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const db = await connectToDatabase();

    // ทำเครื่องหมายอ่านทั้งหมด
    await db.query(
      `UPDATE notifications 
       SET is_read = 1, read_status = 1 
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Server error updating notifications' });
  }
};

/**
 * ลบการแจ้งเตือนรายการเดียว
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const db = await connectToDatabase();
    await db.query(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    return res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error deleting notification' });
  }
};

/**
 * ลบการแจ้งเตือนทั้งหมดของผู้ใช้
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const db = await connectToDatabase();
    await db.query(
      `DELETE FROM notifications WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({ message: 'All notifications deleted' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({ message: 'Server error clearing notifications' });
  }
};

/**
 * Helper function สำหรับสร้างการแจ้งเตือนในระบบ (สำหรับเรียกใช้ใน backend controllers)
 */
export const createNotificationHelper = async ({ userId, title, message, type = 'system', link = null, taskId = null, projectId = null }) => {
  try {
    if (!userId || !message) return null;
    const db = await connectToDatabase();
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) 
       VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
      [userId, taskId || null, title || 'System Notification', message, type, link]
    );

    const newNotifId = result.insertId;
    emitNotificationToUser(userId, {
      id: newNotifId,
      user_id: userId,
      task_id: taskId || null,
      project_id: projectId || null,
      title: title || 'System Notification',
      message,
      type,
      link,
    });

    return newNotifId;
  } catch (error) {
    console.error('Error in createNotificationHelper:', error);
    return null;
  }
};
