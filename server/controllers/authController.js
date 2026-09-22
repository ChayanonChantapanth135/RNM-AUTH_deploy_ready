import { connectToDatabase } from '../lib/db.js';
import { emitNotificationToUser, emitTaskEvent } from '../lib/socket.js';
import { deleteFromCloudinary } from '../lib/cloudinary.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendProjectCreationEmail, sendWelcomeUserEmail, sendOtpEmail, sendContactFormEmail } from '../utils/emailService.js';
import { memoryCache } from '../utils/cacheService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 🛠️ HELPER FUNCTIONS (ฟังก์ชันช่วยเหลือทั่วไป)
// ==========================================

/**
 * Helper ดึง URL ของไฟล์ที่อัปโหลด (รองรับทั้ง Cloudinary URL และ Local Path)
 */
function getUploadedFileUrl(file) {
    if (!file) return null;
    // ถ้าใช้ Cloudinary: file.path จะเป็น Full HTTPS URL (เช่น https://res.cloudinary.com/...)
    if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
        return file.path;
    }
    // ถ้าใช้ Local Disk Storage ให้ใช้ path relative /uploads/
    return `/uploads/${file.filename}`;
}

/**
 * ลบไฟล์รูปโปรไฟล์ (Avatar) เก่าออกจาก Cloudinary หรือโฟลเดอร์ uploads เมื่อมีการอัปโหลดรูปใหม่
 * @param {string} avatarPath - พาธหรือ URL ของรูปเดิม
 */
async function deleteOldAvatar(avatarPath) {
    if (!avatarPath) return;
    try {
        // หากเป็นรูปบน Cloudinary
        if (avatarPath.includes('cloudinary.com')) {
            await deleteFromCloudinary(avatarPath);
            return;
        }

        // หากเป็นรูป Local file
        let fileName = '';
        if (avatarPath.startsWith('http')) {
            const parts = avatarPath.split('/uploads/');
            if (parts.length > 1) {
                fileName = parts[1];
            }
        } else if (avatarPath.startsWith('/uploads/')) {
            fileName = avatarPath.replace('/uploads/', '');
        }

        if (fileName) {
            const filePath = path.join(__dirname, '../uploads', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[Avatar Cleanup] Deleted old local file: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old avatar file:', error.message);
    }
}

/**
 * บันทึกประวัติกิจกรรมการทำงานของผู้ใช้ลงตาราง activity_logs (ป้องกันการบันทึกซ้ำซ้อนภายใน 10 วินาที)
 * @param {object} db - Database connection
 * @param {number|null} userId - รหัสผู้ใช้งานที่ทำรายการ
 * @param {string} action - ชื่อกิจกรรม เช่น 'Login', 'Create Task'
 * @param {string} details - รายละเอียดของกิจกรรม
 */
async function logActivity(db, userId, action, details) {
    try {
        // Prevent duplicate inserts from concurrent/race requests within 10 seconds
        let recentLog = [];
        if (userId) {
            [recentLog] = await db.query(
                "SELECT id FROM activity_logs WHERE user_id = ? AND action = ? AND details = ? AND created_at >= NOW() - INTERVAL 10 SECOND LIMIT 1",
                [userId, action, details]
            );
        } else {
            [recentLog] = await db.query(
                "SELECT id FROM activity_logs WHERE user_id IS NULL AND action = ? AND details = ? AND created_at >= NOW() - INTERVAL 10 SECOND LIMIT 1",
                [action, details]
            );
        }

        if (recentLog.length > 0) {
            await db.query(
                "UPDATE activity_logs SET created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [recentLog[0].id]
            );
            return;
        }

        let lastLog = [];
        if (userId) {
            [lastLog] = await db.query(
                "SELECT id, action, details FROM activity_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                [userId]
            );
        } else {
            [lastLog] = await db.query(
                "SELECT id, action, details FROM activity_logs WHERE user_id IS NULL ORDER BY id DESC LIMIT 1"
            );
        }

        if (lastLog.length > 0 && lastLog[0].action === action && lastLog[0].details === details) {
            await db.query(
                "UPDATE activity_logs SET created_at = CURRENT_TIMESTAMP WHERE id = ?",
                [lastLog[0].id]
            );
        } else {
            await db.query(
                "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
                [userId, action, details]
            );
        }
    } catch (error) {
        console.error("Error writing activity log:", error.message);
    }
}

/**
 * แปลงรูปแบบเบอร์โทรศัพท์ให้อยู่ในมาตรฐานสากล (+66...)
 * @param {string} phone - เบอร์โทรศัพท์ที่ผู้ใช้กรอก
 * @returns {string|null}
 */
function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).trim().replace(/[\s-]/g, '');
    if (cleaned === '' || cleaned === '+66') return null;
    if (cleaned.startsWith('0')) {
        return '+66' + cleaned.slice(1);
    }
    return cleaned;
}

/**
 * ส่งการแจ้งเตือน (In-App Notification) ไปยังสมาชิกทั้งหมดในโปรเจกต์ (ผู้สร้าง, Team Leader, ผู้รับผิดชอบงาน)
 */
async function notifyProjectMembers({ db, projectId, taskId = null, title, message, type = 'project', link = null, excludeUserId = null }) {
  try {
    if (!projectId) return;

    // 1. ผู้สร้างโปรเจกต์
    const [projRows] = await db.query('SELECT created_by FROM projects WHERE id = ?', [projectId]);
    const creatorId = projRows[0]?.created_by;

    // 2. หัวหน้าทีม (Team Leaders)
    const [tlRows] = await db.query('SELECT user_id FROM project_team_leaders WHERE project_id = ?', [projectId]);
    const teamLeaderIds = tlRows.map(r => r.user_id);

    // 3. สมาชิกที่มีงานในโปรเจกต์นี้
    const [taskAssigneeRows] = await db.query('SELECT DISTINCT assigned_to FROM tasks WHERE project_id = ? AND assigned_to IS NOT NULL', [projectId]);
    const assigneeIds = taskAssigneeRows.map(r => r.assigned_to);

    // รวบรวม ID ผู้เกี่ยวข้องทั้งหมดโดยไม่ซ้ำกัน
    const memberIds = new Set();
    if (creatorId) memberIds.add(Number(creatorId));
    teamLeaderIds.forEach(id => { if (id) memberIds.add(Number(id)); });
    assigneeIds.forEach(id => { if (id) memberIds.add(Number(id)); });

    // ยกเว้นผู้ที่ระบุไว้ (เช่น คนที่กดเปลี่ยนสถานะหรือส่งคอมเมนต์เอง)
    if (excludeUserId !== null && excludeUserId !== undefined) {
      if (Array.isArray(excludeUserId)) {
        excludeUserId.forEach(id => {
          if (id) memberIds.delete(Number(id));
        });
      } else {
        memberIds.delete(Number(excludeUserId));
      }
    }

    if (memberIds.size === 0) return;

    // ตรวจสอบและกรองคนที่มีการแจ้งเตือนเรื่องเดียวกันภายใน 30 วินาที
    const memberArray = Array.from(memberIds);
    const placeholders = memberArray.map(() => '?').join(',');
    const checkParams = [...memberArray, taskId || null, taskId || null, title, message];
    
    const [recentNotifs] = await db.query(
      `SELECT user_id FROM notifications 
       WHERE user_id IN (${placeholders}) 
         AND (task_id = ? OR (task_id IS NULL AND ? IS NULL)) 
         AND title = ? AND message = ? 
         AND created_at >= NOW() - INTERVAL 30 SECOND`,
      checkParams
    );
    
    const recentUserSet = new Set(recentNotifs.map(r => r.user_id));
    const targetMembers = memberArray.filter(uid => !recentUserSet.has(uid));

    if (targetMembers.length === 0) return;

    // เตรียม Batch Insert สำหรับผู้ใช้ที่ยังไม่ได้รับการแจ้งเตือนซ้ำ
    const insertValues = [];
    const insertParams = [];
    for (const targetUserId of targetMembers) {
      insertValues.push('(?, ?, ?, ?, ?, ?, 0, 0)');
      insertParams.push(targetUserId, taskId || null, title, message, type, link);
    }

    const [insertRes] = await db.query(
      `INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) 
       VALUES ${insertValues.join(', ')}`,
      insertParams
    );

    let firstInsertId = insertRes.insertId;
    targetMembers.forEach((targetUserId, idx) => {
      emitNotificationToUser(targetUserId, {
        id: firstInsertId ? (firstInsertId + idx) : null,
        user_id: targetUserId,
        task_id: taskId || null,
        project_id: projectId || null,
        title,
        message,
        type,
        link,
      });
    });
  } catch (error) {
    console.error("Error notifying project members:", error.message);
  }
}

// ==========================================
// 🔐 AUTHENTICATION CONTROLLERS (ระบบล็อกอินและสมาชิก)
// ==========================================

/**
 * เข้าสู่ระบบ (Login)
 * - ตรวจสอบอีเมล, รหัสผ่าน
 * - ตรวจสอบสถานะบัญชี (suspended)
 * - ออก JWT Token มีอายุ 40 นาที
 * - บันทึก Activity Log และแจ้งเตือนหากต้องบังคับเปลี่ยนรหัสผ่านครั้งแรก
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received:', { email });
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not existed' });
        }

        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (rows[0].status === 'suspended') {
            return res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
        }

        const today = new Date().toISOString().split('T')[0];
        if (rows[0].start_date) {
            const startDateStr = new Date(rows[0].start_date).toISOString().split('T')[0];
            if (startDateStr > today) {
                return res.status(403).json({ code: 'ACCOUNT_NOT_STARTED', startDate: startDateStr, message: `บัญชีนี้จะเริ่มใช้งานได้ตั้งแต่วันที่ ${startDateStr}` });
            }
        }
        if (rows[0].expire_date) {
            const expireDateStr = new Date(rows[0].expire_date).toISOString().split('T')[0];
            if (expireDateStr < today) {
                return res.status(403).json({ code: 'ACCOUNT_EXPIRED', message: 'บัญชีของคุณหมดอายุการใช้งานแล้ว กรุณาติดต่อผู้ดูแลระบบ' });
            }
        }
        const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'jwt-secret-key-rnm';
        const tokenExpiresIn = '40m';
        const tokenExpiresInSeconds = 40 * 60;
        const token = jwt.sign({ id: rows[0].id }, jwtSecret, { expiresIn: tokenExpiresIn });

        await logActivity(db, rows[0].id, 'Login', `User logged in: ${rows[0].fullname}`);

        if (rows[0].is_force_reset === 1) {
            return res.status(201).json({
                requirePasswordReset: true,
                message: "กรุณาเปลี่ยนรหัสผ่านก่อนเข้าใช้งานครั้งแรก",
                token: token,
                expiresIn: tokenExpiresIn,
                expiresInSeconds: tokenExpiresInSeconds,
                user: {
                    id: rows[0].id,
                    fullname: rows[0].fullname,
                    name: rows[0].fullname,
                    email: rows[0].email,
                    role: rows[0].role || 'user',
                    avatar: rows[0].avatar || null,
                    is_force_reset: 1
                }
            });
        }

        return res.status(201).json({
            token: token,
            expiresIn: tokenExpiresIn,
            expiresInSeconds: tokenExpiresInSeconds,
            user: {
                id: rows[0].id,
                fullname: rows[0].fullname,
                name: rows[0].fullname,
                email: rows[0].email,
                role: rows[0].role || 'user',
                avatar: rows[0].avatar || null,
                is_force_reset: 0
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ต่ออายุ Token (Refresh JWT Token) เมื่อใกล้หมดอายุ
 */
export const refresh = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });
    try {
        const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'jwt-secret-key-rnm';
        const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [decoded.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (rows[0].status === 'suspended') {
            return res.status(403).json({ message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
        }
        const today = new Date().toISOString().split('T')[0];
        if (rows[0].start_date) {
            const startDateStr = new Date(rows[0].start_date).toISOString().split('T')[0];
            if (startDateStr > today) {
                return res.status(403).json({ message: `บัญชีนี้จะเริ่มใช้งานได้ตั้งแต่วันที่ ${startDateStr}` });
            }
        }
        if (rows[0].expire_date) {
            const expireDateStr = new Date(rows[0].expire_date).toISOString().split('T')[0];
            if (expireDateStr < today) {
                return res.status(403).json({ message: 'บัญชีของคุณหมดอายุการใช้งานแล้ว กรุณาติดต่อผู้ดูแลระบบ' });
            }
        }
        const tokenExpiresIn = '40m';
        const tokenExpiresInSeconds = 40 * 60;
        const newToken = jwt.sign({ id: decoded.id }, jwtSecret, { expiresIn: tokenExpiresIn });
        
        return res.status(200).json({
            token: newToken,
            expiresInSeconds: tokenExpiresInSeconds,
            user: {
                id: rows[0].id,
                fullname: rows[0].fullname,
                name: rows[0].fullname,
                email: rows[0].email,
                role: rows[0].role || 'user',
                avatar: rows[0].avatar || null
            }
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * ออกจากระบบ (Logout) และบันทึกประวัติการออกจากระบบ
 */
export const logout = async (req, res) => {
    const { userId } = req.body;
    try {
        const db = await connectToDatabase();
        if (userId) {
            const [userRows] = await db.query('SELECT fullname FROM users WHERE id = ?', [userId]);
            const fullname = userRows[0]?.fullname || `User ID ${userId}`;
            await logActivity(db, userId, 'Logout', `User logged out: ${fullname}`);
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging logout:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 👥 USER MANAGEMENT CONTROLLERS (จัดการผู้ใช้งาน)
// ==========================================

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ (รองรับ Query Parameter includeDeleted=true เพื่อดูผู้ใช้ที่ถูกลบชั่วคราว)
 */
export const getUsers = async (req, res) => {
    const { includeDeleted } = req.query;
    try {
        const db = await connectToDatabase();
        let query = `
            SELECT u.id, u.fullname, u.email, u.phone, u.role, u.avatar, u.status, u.start_date, u.expire_date, u.leader_id, u.created_at, u.deleted_at,
                   l.fullname AS leader_name,
                   (SELECT COUNT(*) FROM users sub WHERE sub.leader_id = u.id AND sub.deleted_at IS NULL) AS leader_count
            FROM users u
            LEFT JOIN users l ON u.leader_id = l.id
            WHERE u.deleted_at IS NULL
        `;
        if (includeDeleted === 'true') {
            query = `
                SELECT u.id, u.fullname, u.email, u.phone, u.role, u.avatar, u.status, u.start_date, u.expire_date, u.leader_id, u.created_at, u.deleted_at,
                       l.fullname AS leader_name,
                       (SELECT COUNT(*) FROM users sub WHERE sub.leader_id = u.id AND sub.deleted_at IS NULL) AS leader_count
                FROM users u
                LEFT JOIN users l ON u.leader_id = l.id
            `;
        }
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึงข้อมูลผู้ใช้งานรายบุคคลตาม ID
 */
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT u.id, u.fullname, u.email, u.phone, u.role, u.avatar, u.status, u.start_date, u.expire_date, u.leader_id, u.created_at, u.deleted_at,
                   l.fullname AS leader_name,
                   (SELECT COUNT(*) FROM users sub WHERE sub.leader_id = u.id AND sub.deleted_at IS NULL) AS leader_count
            FROM users u
            LEFT JOIN users l ON u.leader_id = l.id
            WHERE u.id = ? AND u.deleted_at IS NULL
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ
 * - เข้ารหัสผ่านด้วย bcrypt (Hash)
 * - ส่งอีเมลต้อนรับพร้อมรหัสผ่านชั่วคราวผ่าน emailService
 * - บันทึกประวัติ Activity Log
 */
export const createUser = async (req, res) => {
    const { fullname, email, password, phone, role, status, leader_id, start_date, expire_date } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const formattedPhone = formatPhoneNumber(phone);
        
        let sqlRole = 'storyboard';
        const normRole = (role || '').trim().toLowerCase();
        if (normRole === 'admin') sqlRole = 'admin';
        else if (normRole === 'project manager' || normRole === 'manager' || normRole === 'project_manager') sqlRole = 'manager';
        else if (normRole === 'storyboard') sqlRole = 'storyboard';
        else if (normRole === 'animation') sqlRole = 'animation';
        else if (normRole === 'designer') sqlRole = 'designer';
        else if (normRole === 'programmer') sqlRole = 'programmer';

        const sqlStatus = status === 'suspended' ? 'suspended' : 'active';
        const parsedLeaderId = leader_id && !isNaN(leader_id) ? Number(leader_id) : null;
        const parsedStartDate = start_date && start_date.trim() !== '' ? start_date.trim() : null;
        const parsedExpireDate = expire_date && expire_date.trim() !== '' ? expire_date.trim() : null;

        let avatarUrl = req.file ? getUploadedFileUrl(req.file) : null;

        const [result] = await db.query(
            'INSERT INTO users (fullname, email, password, phone, role, status, avatar, leader_id, start_date, expire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [fullname, email, hashPassword, formattedPhone, sqlRole, sqlStatus, avatarUrl, parsedLeaderId, parsedStartDate, parsedExpireDate]
        );

        // Send welcome email to new user via emailService asynchronously (do not block client response)
        sendWelcomeUserEmail({
            recipientEmail: email,
            recipientName: fullname,
            tempPassword: password
        }).catch(e => console.error('[Background Email Error]:', e.message));

        const { creatorId } = req.body;
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Create User', `Created user: ${fullname} (${email})`);

        // Broadcast real-time user created event
        emitTaskEvent('user:created', {
            userId: result.insertId,
            id: result.insertId,
            fullname,
            email,
            phone: formattedPhone,
            role: sqlRole,
            status: sqlStatus,
            avatar: avatarUrl,
            leader_id: parsedLeaderId,
            start_date: parsedStartDate,
            expire_date: parsedExpireDate,
        });

        memoryCache.del('team_leaders');
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * แก้ไขข้อมูลผู้ใช้งาน (ชื่อ, อีเมล, สิทธิ์/Role, สถานะ, รหัสผ่าน, รูปโปรไฟล์, หัวหน้า)
 */
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { fullname, email, password, phone, role, status, creatorId, currentPassword, leader_id, start_date, expire_date } = req.body;
    try {
        const db = await connectToDatabase();
        
        const [oldUserRows] = await db.query('SELECT password, status, role, leader_id, start_date, expire_date FROM users WHERE id = ?', [id]);
        if (!oldUserRows || oldUserRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
        }
        const oldPasswordHash = oldUserRows[0]?.password;
        const oldStatus = oldUserRows[0]?.status;
        const existingLeaderId = oldUserRows[0]?.leader_id;

        const requesterId = req.userId || (creatorId ? Number(creatorId) : null);
        let isAdmin = false;
        if (requesterId) {
            const [requesterRows] = await db.query('SELECT role FROM users WHERE id = ?', [requesterId]);
            isAdmin = requesterRows[0]?.role === 'admin';
        }

        if (password && String(id) === String(requesterId)) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านปัจจุบัน' });
            }
            const isMatch = await bcrypt.compare(currentPassword, oldPasswordHash);
            if (!isMatch) {
                return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
            }
        }

        if (email) {
            const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL', [email, id]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว' });
            }
        }

        const formattedPhone = formatPhoneNumber(phone);
        
        // If non-admin user is editing their own profile and leader_id is already set, lock it to the existing leader_id
        // But if admin is editing, admin can set or clear (null) leader_id freely
        let parsedLeaderId;
        if (!isAdmin && existingLeaderId && String(id) === String(requesterId)) {
            parsedLeaderId = existingLeaderId;
        } else {
            parsedLeaderId = leader_id !== undefined && leader_id !== "" && leader_id !== null && !isNaN(leader_id) && Number(leader_id) !== Number(id)
                ? Number(leader_id) 
                : null;
        }

        const parsedStartDate = start_date !== undefined ? (start_date && String(start_date).trim() !== '' ? String(start_date).trim() : null) : (oldUserRows[0]?.start_date || null);
        const parsedExpireDate = expire_date !== undefined ? (expire_date && String(expire_date).trim() !== '' ? String(expire_date).trim() : null) : (oldUserRows[0]?.expire_date || null);

        let query = 'UPDATE users SET fullname = ?, email = ?, phone = ?, role = ?, status = ?, leader_id = ?, start_date = ?, expire_date = ?';
        let params = [fullname, email, formattedPhone, role, status || 'active', parsedLeaderId, parsedStartDate, parsedExpireDate];
        
        let sqlRole = 'storyboard';
        const normRole = (role || '').trim().toLowerCase();
        if (normRole === 'admin') sqlRole = 'admin';
        else if (normRole === 'project manager' || normRole === 'manager' || normRole === 'project_manager') sqlRole = 'manager';
        else if (normRole === 'storyboard') sqlRole = 'storyboard';
        else if (normRole === 'animation') sqlRole = 'animation';
        else if (normRole === 'designer') sqlRole = 'designer';
        else if (normRole === 'programmer') sqlRole = 'programmer';
        
        params[3] = sqlRole;

        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashPassword);
        }

        let updatedAvatar = undefined;
        if (req.file) {
            const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [id]);
            if (userRows.length > 0 && userRows[0].avatar) {
                await deleteOldAvatar(userRows[0].avatar);
            }
            const avatarUrl = getUploadedFileUrl(req.file);
            updatedAvatar = avatarUrl;
            query += ', avatar = ?';
            params.push(avatarUrl);
        }
        
        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
        const targetStatus = status || 'active';
        if (targetStatus !== oldStatus) {
            if (targetStatus === 'suspended') {
                await logActivity(db, requesterId, 'Suspend User', `Suspended user: ${fullname} (${email})`);
            } else if (targetStatus === 'active') {
                await logActivity(db, requesterId, 'Activate User', `Activated user: ${fullname} (${email})`);
            } else {
                await logActivity(db, requesterId, 'Edit User', `Edited user ID: ${id} (${fullname})`);
            }
        } else {
            await logActivity(db, requesterId, 'Edit User', `Edited user ID: ${id} (${fullname})`);
        }

        // Broadcast real-time user updated event
        emitTaskEvent('user:updated', {
            userId: Number(id),
            id: Number(id),
            fullname,
            email,
            phone: formattedPhone,
            role: sqlRole,
            status: targetStatus,
            avatar: updatedAvatar,
            leader_id: parsedLeaderId,
            start_date: parsedStartDate,
            expire_date: parsedExpireDate,
            updatedBy: requesterId,
        });

        memoryCache.del('team_leaders');
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ลบผู้ใช้แบบ Soft-delete (ซ่อนโดยตั้งเวลา deleted_at = NOW())
 */
export const softDeleteUser = async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.query;
    try {
        const db = await connectToDatabase();
        const [userRows] = await db.query('SELECT fullname, email FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found or already deleted' });
        }
        const { fullname, email } = userRows[0];
        await db.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Soft Delete User', `Soft deleted user: ${fullname} (${email})`);

        // Broadcast real-time user deleted event
        emitTaskEvent('user:deleted', {
            userId: Number(id),
            id: Number(id),
            deletedBy: creatorId,
        });

        memoryCache.del('team_leaders');
        res.status(200).json({ message: 'User soft-deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * กู้คืนผู้ใช้งานที่ถูก Soft-delete ให้กลับมาใช้งานได้ตามปกติ
 */
export const restoreUser = async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.body;
    try {
        const db = await connectToDatabase();
        const [userRows] = await db.query('SELECT fullname, email FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { fullname, email } = userRows[0];
        await db.query('UPDATE users SET deleted_at = NULL WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Restore User', `Restored user: ${fullname} (${email})`);

        // Broadcast real-time user created/restored event
        emitTaskEvent('user:created', {
            userId: Number(id),
            id: Number(id),
            fullname,
            email,
        });

        memoryCache.del('team_leaders');
        res.status(200).json({ message: 'User restored successfully' });
    } catch (error) {
        console.error('Error restoring user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ลบผู้ใช้งานออกจากฐานข้อมูลอย่างถาวร (Hard Delete) พร้อมลบไฟล์รูปโปรไฟล์
 */
export const permanentDeleteUser = async (req, res) => {
    const { id } = req.params;
    const { creatorId } = req.query;
    try {
        const db = await connectToDatabase();
        const [userRows] = await db.query('SELECT fullname, email, avatar FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { fullname, email, avatar } = userRows[0];
        if (avatar) {
            deleteOldAvatar(avatar);
        }
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        await logActivity(db, creatorId ? Number(creatorId) : null, 'Permanent Delete User', `Permanently deleted user: ${fullname} (${email})`);

        // Broadcast real-time user deleted event
        emitTaskEvent('user:deleted', {
            userId: Number(id),
            id: Number(id),
            deletedBy: creatorId,
        });

        memoryCache.del('team_leaders');
        res.status(200).json({ message: 'User permanently deleted successfully' });
    } catch (error) {
        console.error('Error permanently deleting user:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * อัปโหลดและเปลี่ยนรูปโปรไฟล์ (Avatar) ของผู้ใช้งาน
 */
export const uploadAvatar = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const db = await connectToDatabase();
        
        const [userRows] = await db.query('SELECT avatar FROM users WHERE id = ?', [id]);
        if (userRows.length > 0 && userRows[0].avatar) {
            await deleteOldAvatar(userRows[0].avatar);
        }

        const avatarUrl = getUploadedFileUrl(req.file);
        
        await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id]);
        res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * นำเข้าผู้ใช้งานแบบกลุ่ม (Bulk Import Users จากไฟล์ Excel / CSV)
 */
export const importUsers = async (req, res) => {
    const { users, userId } = req.body;
    if (!users || !Array.isArray(users)) {
        return res.status(400).json({ message: 'Invalid users payload' });
    }

    try {
        const db = await connectToDatabase();
        let importedCount = 0;
        let updatedCount = 0;

        const normalizeRole = (role) => {
            const r = (role || '').trim().toLowerCase();
            if (r === 'admin') return 'admin';
            if (r === 'project manager' || r === 'manager' || r === 'project_manager') return 'manager';
            if (r === 'storyboard') return 'storyboard';
            if (r === 'animation') return 'animation';
            if (r === 'designer') return 'designer';
            if (r === 'programmer') return 'programmer';
            return 'storyboard';
        };

        const normalizeDateStr = (dateVal) => {
            if (!dateVal) return null;
            const str = String(dateVal).trim();
            if (!str || str === '-' || str.toLowerCase() === 'null') return null;

            // DD/MM/YYYY or DD-MM-YYYY
            const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (dmyMatch) {
                const day = dmyMatch[1].padStart(2, '0');
                const month = dmyMatch[2].padStart(2, '0');
                const year = dmyMatch[3];
                return `${year}-${month}-${day}`;
            }

            // ISO String
            if (str.includes('T')) {
                return str.split('T')[0];
            }

            // YYYY-MM-DD
            const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
            if (ymdMatch) {
                const year = ymdMatch[1];
                const month = ymdMatch[2].padStart(2, '0');
                const day = ymdMatch[3].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                return d.toISOString().split('T')[0];
            }
            return null;
        };

        // Cache existing users map for fast leader lookups by email, name, or id
        const [allDbUsers] = await db.query('SELECT id, email, fullname FROM users WHERE deleted_at IS NULL');
        const userByEmail = new Map();
        const userByName = new Map();
        const userById = new Map();

        allDbUsers.forEach((u) => {
            if (u.email) userByEmail.set(u.email.toLowerCase().trim(), u.id);
            if (u.fullname) userByName.set(u.fullname.toLowerCase().trim(), u.id);
            userById.set(Number(u.id), u.id);
        });

        for (const item of users) {
            const fullname = (item.fullname || item.username || item.name || '').trim();
            const email = (item.email || '').trim();
            const password = (item.password || '').trim();
            const role = normalizeRole(item.role);
            const status = (item.status || 'active').trim().toLowerCase() === 'suspended' ? 'suspended' : 'active';
            const phone = formatPhoneNumber(item.phone || item.phonenumber || item.tel || '');
            const startDate = normalizeDateStr(item.start_date || item.startdate || item.startDate);
            const expireDate = normalizeDateStr(item.expire_date || item.expiredate || item.expireDate);

            // Resolve leader_id
            const leaderInput = (item.leader_email || item.leader || item.leader_name || item.leader_id || item.leaderId || '').toString().trim();
            let leaderId = null;
            if (leaderInput && leaderInput !== '-' && leaderInput.toLowerCase() !== 'null') {
                if (!isNaN(leaderInput) && userById.has(Number(leaderInput))) {
                    leaderId = Number(leaderInput);
                } else if (userByEmail.has(leaderInput.toLowerCase())) {
                    leaderId = userByEmail.get(leaderInput.toLowerCase());
                } else if (userByName.has(leaderInput.toLowerCase())) {
                    leaderId = userByName.get(leaderInput.toLowerCase());
                }
            }

            if (!email || !fullname) {
                continue;
            }

            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

            if (existing.length > 0) {
                const userIdToUpdate = existing[0].id;
                let query = 'UPDATE users SET fullname = ?, role = ?, status = ?, phone = ?, start_date = ?, expire_date = ?';
                let params = [fullname, role, status, phone, startDate, expireDate];

                if (leaderId && leaderId !== userIdToUpdate) {
                    query += ', leader_id = ?';
                    params.push(leaderId);
                }

                if (password) {
                    const hashPassword = await bcrypt.hash(password, 10);
                    query += ', password = ?';
                    params.push(hashPassword);
                }

                query += ' WHERE id = ?';
                params.push(userIdToUpdate);

                await db.query(query, params);
                updatedCount++;
            } else {
                const finalPassword = password || '123456';
                const hashPassword = await bcrypt.hash(finalPassword, 10);
                await db.query(
                    'INSERT INTO users (fullname, email, password, role, status, phone, leader_id, start_date, expire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [fullname, email, hashPassword, role, status, phone, leaderId, startDate, expireDate]
                );
                importedCount++;
            }
        }

        memoryCache.del('team_leaders');

        await logActivity(
            db,
            userId || null,
            'Import Users',
            `Bulk imported: ${importedCount} new, updated: ${updatedCount} existing`
        );

        res.status(200).json({
            message: 'Import completed successfully',
            imported: importedCount,
            updated: updatedCount,
        });
    } catch (error) {
        console.error('Error importing users:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 📁 PROJECT & TASK CONTROLLERS (จัดการโปรเจกต์และงาน)
// ==========================================

/**
 * ดึงรายชื่อผู้ใช้ที่สามารถรับหน้าที่เป็น Team Leader (หัวหน้าทีม)
 */
export const getTeamLeaders = async (req, res) => {
    try {
        const cacheKey = 'team_leaders';
        const cached = memoryCache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const db = await connectToDatabase();
        let [rows] = await db.query("SELECT id, fullname, email FROM users WHERE role = 'team_leader' AND deleted_at IS NULL");
        if (rows.length === 0) {
            [rows] = await db.query("SELECT id, fullname, email FROM users WHERE deleted_at IS NULL");
        }
        if (rows.length === 0) {
            rows = [
                { id: 3, fullname: "Somsak Somdee (Simulated)" },
                { id: 4, fullname: "Wichai Jaidee (Simulated)" },
                { id: 5, fullname: "Anong Rakdee (Simulated)" }
            ];
        }
        memoryCache.set(cacheKey, rows, 120); // 2 minutes TTL
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching team leaders:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ส่งแจ้งเตือนเมื่อโปรเจกต์มีสถานะเป็น Reviewing (ส่งให้ Team Leader, Project Manager และ Creator)
 */
async function notifyProjectReviewing({ db, projectId, taskId = null, excludeUserId = null }) {
    try {
        if (!projectId) return;

        // 1. ดึงข้อมูลโปรเจกต์
        const [projRows] = await db.query('SELECT name, created_by FROM projects WHERE id = ? AND deleted_at IS NULL', [projectId]);
        if (projRows.length === 0) return;
        const projectName = projRows[0].name;
        const creatorId = projRows[0].created_by;

        // ดึงงานที่เป็น Reviewing ตัวแรกถ้าไม่มี taskId ส่งมา
        let reviewingTaskId = taskId;
        if (!reviewingTaskId) {
            const [revTasks] = await db.query(
                "SELECT id FROM tasks WHERE project_id = ? AND (status = 'Reviewing' OR status = 'Review') AND deleted_at IS NULL LIMIT 1",
                [projectId]
            );
            if (revTasks.length > 0) {
                reviewingTaskId = revTasks[0].id;
            }
        }

        const targetUserIds = new Set();

        // ส่งเฉพาะ Team Leaders ของโปรเจกต์นี้เท่านั้น
        const [tlRows] = await db.query('SELECT user_id FROM project_team_leaders WHERE project_id = ?', [projectId]);
        tlRows.forEach(tl => targetUserIds.add(Number(tl.user_id)));

        // ยกเว้นผู้ที่ทำการเปลี่ยนสถานะเอง (ถ้ามี)
        if (excludeUserId) {
            targetUserIds.delete(Number(excludeUserId));
        }

        const title = 'โปรเจกต์รอตรวจสอบ';
        const message = `โปรเจกต์ "${projectName}" มีสถานะเป็น Reviewing (รอตรวจสอบ)`;
        const type = 'project';
        const link = reviewingTaskId 
            ? `/Projects?projectId=${projectId}&taskId=${reviewingTaskId}` 
            : `/Projects?projectId=${projectId}`;

        for (const uid of targetUserIds) {
            // ป้องกันการยิงแจ้งเตือนซ้ำซ้อนในเวลาไล่เลี่ยกัน (ภายใน 1 นาที)
            const [recentNotif] = await db.query(
                `SELECT id FROM notifications 
                 WHERE user_id = ? AND title = ? AND message = ? AND created_at >= NOW() - INTERVAL 1 MINUTE`,
                [uid, title, message]
            );
            if (recentNotif.length === 0) {
                const [insertRes] = await db.query(
                    `INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) 
                     VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
                    [uid, reviewingTaskId || null, title, message, type, link]
                );
                emitNotificationToUser(uid, {
                    id: insertRes.insertId,
                    user_id: uid,
                    task_id: reviewingTaskId || null,
                    project_id: projectId,
                    title,
                    message,
                    type,
                    link,
                });
            }
        }
    } catch (err) {
        console.error("Error sending project reviewing notification:", err.message);
    }
}

/**
 * คำนวณเปอร์เซ็นต์ความคืบหน้า (%) และอัปเดตสถานะของโปรเจกต์หลักอัตโนมัติตามงานย่อย
 */
const checkAndUpdateProjectStatus = async (db, projectId, changedByUserId = null, changedTaskId = null) => {
    if (!projectId) return;
    try {
        const [projRows] = await db.query("SELECT status FROM projects WHERE id = ? AND deleted_at IS NULL", [projectId]);
        const oldStatus = projRows[0]?.status;

        const [tasks] = await db.query(
            "SELECT id, status FROM tasks WHERE project_id = ? AND deleted_at IS NULL",
            [projectId]
        );
        if (tasks.length > 0) {
            const reviewingTask = tasks.find(t => t.status && (t.status.toLowerCase() === 'reviewing' || t.status.toLowerCase() === 'review'));
            const hasReviewing = Boolean(reviewingTask);
            const completedCount = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
            const progress = Math.round((completedCount / tasks.length) * 100);

            let newStatus = 'In Progress';
            if (hasReviewing) {
                newStatus = 'Reviewing';
            } else if (progress === 100) {
                newStatus = 'Completed';
            }

            if (newStatus !== oldStatus) {
                await db.query("UPDATE projects SET status = ? WHERE id = ?", [newStatus, projectId]);
                if (newStatus === 'Reviewing') {
                    await notifyProjectReviewing({ 
                        db, 
                        projectId, 
                        taskId: changedTaskId || reviewingTask?.id || null, 
                        excludeUserId: changedByUserId 
                    });
                }
            }
        }
    } catch (err) {
        console.error("Error auto updating project status:", err.message);
    }
};

/**
 * ดึงรายการโปรเจกต์ทั้งหมด พร้อมงานย่อย (Tasks), ผู้จัดการโปรเจกต์, หัวหน้าทีม และคำนวณ Progress
 */
export const getProjects = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const [projects] = await db.query(`
            SELECT p.*, 
                   u.id AS teamLeaderId, u.fullname AS teamLeaderName,
                   creator.id AS projectManagerId, creator.fullname AS projectManagerName
            FROM projects p
            LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
            LEFT JOIN users u ON ptl.user_id = u.id
            LEFT JOIN users creator ON p.created_by = creator.id
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `);

        if (projects.length === 0) {
            return res.status(200).json([]);
        }

        const projectIds = projects.map(p => p.id);
        const [allTasks] = await db.query(`
            SELECT t.id, t.project_id, t.title, t.status, t.due_date, t.assigned_to, t.description, t.task_type, t.priority, u.fullname AS assigned_to_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id IN (?) AND t.deleted_at IS NULL
            ORDER BY t.created_at ASC
        `, [projectIds]);

        // Group tasks by project_id in O(N)
        const tasksByProjectId = {};
        for (const task of allTasks) {
            if (!tasksByProjectId[task.project_id]) tasksByProjectId[task.project_id] = [];
            tasksByProjectId[task.project_id].push(task);
        }

        for (const p of projects) {
            const tasks = tasksByProjectId[p.id] || [];
            p.tasks = tasks;
            if (tasks.length > 0) {
                const hasReviewing = tasks.some(t => t.status && (t.status.toLowerCase() === 'reviewing' || t.status.toLowerCase() === 'review'));
                const completed = tasks.filter(t => t.status && t.status.toLowerCase() === 'completed').length;
                p.progress = Math.round((completed / tasks.length) * 100);

                let targetStatus = hasReviewing ? 'Reviewing' : (p.progress === 100 ? 'Completed' : 'In Progress');
                if (p.status !== targetStatus) {
                    p.status = targetStatus;
                    await db.query("UPDATE projects SET status = ? WHERE id = ?", [targetStatus, p.id]);
                }
            } else {
                p.progress = 0;
            }
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * สร้างโปรเจกต์ใหม่ (บันทึกข้อมูล, มอบหมาย Team Leader, ส่ง Notification และส่ง Email)
 */
export const createProject = async (req, res) => {
    const { name, endDate, priority, teamLeaderId, createdBy } = req.body;
    try {
        const db = await connectToDatabase();
        const [result] = await db.query(
            "INSERT INTO projects (name, status, priority, end_date, created_by) VALUES (?, 'Pending', ?, ?, ?)",
            [name, priority, endDate, createdBy]
        );
        const projectId = result.insertId;

        if (teamLeaderId) {
            await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [projectId, teamLeaderId]);

            // Create in-app notification for Team Leader
            try {
                const title = 'คุณได้รับมอบหมายเป็น Team Leader';
                const message = `คุณได้รับมอบหมายให้เป็นหัวหน้าโปรเจกต์ "${name}"`;
                const link = `/Projects?projectId=${projectId}`;
                const [insertRes] = await db.query(
                    `INSERT INTO notifications (user_id, title, message, type, link, is_read, read_status) 
                     VALUES (?, ?, ?, 'project', ?, 0, 0)`,
                    [teamLeaderId, title, message, link]
                );
                emitNotificationToUser(teamLeaderId, {
                    id: insertRes.insertId,
                    user_id: teamLeaderId,
                    project_id: projectId,
                    title,
                    message,
                    type: 'project',
                    link,
                });
            } catch (notifErr) {
                console.error("[Team Leader In-App Notification Error]", notifErr.message);
            }

            // Send email notification asynchronously to assigned Team Leader
            (async () => {
                try {
                    const [tlRows] = await db.query("SELECT fullname, email FROM users WHERE id = ? AND deleted_at IS NULL", [teamLeaderId]);
                    const [creatorRows] = createdBy ? await db.query("SELECT fullname FROM users WHERE id = ?", [createdBy]) : [[]];

                    if (tlRows.length > 0 && tlRows[0].email) {
                        await sendProjectCreationEmail({
                            recipientEmail: tlRows[0].email,
                            recipientName: tlRows[0].fullname,
                            projectName: name,
                            priority,
                            endDate,
                            creatorName: creatorRows[0]?.fullname || null
                        });
                    }
                } catch (emailErr) {
                    console.error("[Project Email Error]", emailErr.message);
                }
            })();
        }

        await logActivity(db, createdBy, 'Create New Project', `Created project: ${name}`);

        // Broadcast real-time project created event to all clients
        emitTaskEvent('project:created', {
            projectId,
            id: projectId,
            name,
            status: 'Pending',
            priority,
            endDate,
            teamLeaderId: teamLeaderId ? Number(teamLeaderId) : null,
            createdBy,
        });

        res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
        console.error('Error creating project:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * แก้ไขรายละเอียดโปรเจกต์ (ชื่อ, สถานะ, ความสำคัญ, วันครบกำหนด, Team Leader)
 */
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, status, priority, endDate, teamLeaderId, userId } = req.body;
    try {
        const db = await connectToDatabase();
        
        // Check existing Team Leader before updating
        const [oldTlRows] = await db.query("SELECT user_id FROM project_team_leaders WHERE project_id = ?", [id]);
        const oldTeamLeaderId = oldTlRows[0]?.user_id;

        await db.query(
            "UPDATE projects SET name = ?, status = ?, priority = ?, end_date = ? WHERE id = ?",
            [name, status, priority, endDate, id]
        );

        await db.query("DELETE FROM project_team_leaders WHERE project_id = ?", [id]);
        if (teamLeaderId) {
            await db.query("INSERT INTO project_team_leaders (project_id, user_id) VALUES (?, ?)", [id, teamLeaderId]);

            // If a new Team Leader is assigned (or changed)
            if (Number(teamLeaderId) !== Number(oldTeamLeaderId)) {
                try {
                    const title = 'คุณได้รับมอบหมายเป็น Team Leader';
                    const message = `คุณได้รับมอบหมายให้เป็นหัวหน้าโปรเจกต์ "${name}"`;
                    const link = `/Projects?projectId=${id}`;
                    const [insertRes] = await db.query(
                        `INSERT INTO notifications (user_id, title, message, type, link, is_read, read_status) 
                         VALUES (?, ?, ?, 'project', ?, 0, 0)`,
                        [teamLeaderId, title, message, link]
                    );
                    emitNotificationToUser(teamLeaderId, {
                        id: insertRes.insertId,
                        user_id: teamLeaderId,
                        project_id: id,
                        title,
                        message,
                        type: 'project',
                        link,
                    });
                } catch (tlNotifErr) {
                    console.error("[Team Leader In-App Notif Error on Edit]", tlNotifErr.message);
                }

                // Send email notification to new Team Leader
                (async () => {
                    try {
                        const [tlRows] = await db.query("SELECT fullname, email FROM users WHERE id = ? AND deleted_at IS NULL", [teamLeaderId]);
                        const [updaterRows] = userId ? await db.query("SELECT fullname FROM users WHERE id = ?", [userId]) : [[]];

                        if (tlRows.length > 0 && tlRows[0].email) {
                            await sendProjectCreationEmail({
                                recipientEmail: tlRows[0].email,
                                recipientName: tlRows[0].fullname,
                                projectName: name,
                                priority,
                                endDate,
                                creatorName: updaterRows[0]?.fullname || null
                            });
                        }
                    } catch (emailErr) {
                        console.error("[Project Edit Email Error]", emailErr.message);
                    }
                })();
            }
        }

        if (status === 'Reviewing') {
            await notifyProjectReviewing({ db, projectId: id, excludeUserId: userId });
        } else {
            await notifyProjectMembers({
                db,
                projectId: id,
                title: 'อัปเดตข้อมูลโปรเจกต์',
                message: `โปรเจกต์ "${name}" มีการอัปเดตข้อมูลใหม่`,
                type: 'project',
                link: `/Projects?projectId=${id}`,
                excludeUserId: userId
            });
        }

        const [tlUserRows] = teamLeaderId ? await db.query("SELECT fullname FROM users WHERE id = ?", [teamLeaderId]) : [[]];
        const teamLeaderName = tlUserRows[0]?.fullname || null;

        await logActivity(db, userId, 'Edit Project', `Edited project ID: ${id}`);

        // Broadcast real-time project updated event to all clients
        emitTaskEvent('project:updated', {
            projectId: Number(id),
            id: Number(id),
            name,
            status,
            priority,
            endDate,
            teamLeaderId: teamLeaderId ? Number(teamLeaderId) : null,
            teamLeaderName,
            updatedBy: userId,
        });

        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error('Error updating project:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ลบโปรเจกต์แบบ Soft-delete พร้อมทั้ง Soft-delete งานย่อยทั้งหมดที่สังกัดโปรเจกต์นี้
 */
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    try {
        const db = await connectToDatabase();
        const [projRows] = await db.query('SELECT name FROM projects WHERE id = ? AND deleted_at IS NULL', [id]);
        if (projRows.length === 0) {
            return res.status(404).json({ message: 'Project not found or already deleted' });
        }
        const projName = projRows[0]?.name || id;

        // 1. Soft-delete project
        await db.query('UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

        // 2. Soft-delete all tasks associated with this project
        await db.query('UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE project_id = ?', [id]);

        await logActivity(db, userId, 'Delete Project', `Soft deleted project: ${projName}`);

        // Broadcast real-time project deleted event to all clients
        emitTaskEvent('project:deleted', {
            projectId: Number(id),
            id: Number(id),
            deletedBy: userId,
        });

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * แปลงสตริงวันที่ให้อยู่ในรูปแบบ YYYY-MM-DD (รองรับปี พ.ศ. และรูปแบบวันที่หลากหลาย)
 */
const parseDueDate = (dateStr) => {
    if (!dateStr || dateStr === "-" || dateStr === "null" || dateStr === "undefined") return null;
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (str.includes("T")) return str.split("T")[0];
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split("/");
        let yearNum = parseInt(y, 10);
        if (yearNum > 2400) yearNum -= 543;
        return `${yearNum}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
    }
    return null;
};

/**
 * ตรวจสอบและสร้างชื่อ Task ให้ไม่ซ้ำกันในโปรเจกต์เดียวกัน โดยใส่วงเล็บต่อท้าย (1), (2), ... ตามลำดับ
 */
async function resolveUniqueTaskTitle(db, projectId, inputTitle, excludeTaskId = null) {
    const cleanTitle = (inputTitle || '').trim();
    if (!cleanTitle || !projectId) return cleanTitle;

    // หา base name โดยตัดวงเล็บตัวเลขท้ายชื่อออกถ้ามี เช่น "Free (1)" -> baseName "Free"
    const baseMatch = cleanTitle.match(/^(.*?)(?:\s*\((\d+)\))?$/);
    const baseName = baseMatch && baseMatch[1] ? baseMatch[1].trim() : cleanTitle;

    let query = 'SELECT title FROM tasks WHERE project_id = ? AND deleted_at IS NULL';
    const params = [projectId];
    if (excludeTaskId) {
        query += ' AND id != ?';
        params.push(excludeTaskId);
    }

    const [rows] = await db.query(query, params);
    if (!rows || rows.length === 0) return cleanTitle;

    const escapedBase = baseName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp('^' + escapedBase + '(?:\\s*\\((\\d+)\\))?$', 'i');

    const existingNumbers = [];
    let exactBaseExists = false;

    for (const r of rows) {
        const rowTitle = (r.title || '').trim();
        const match = rowTitle.match(regex);
        if (match) {
            if (match[1]) {
                existingNumbers.push(parseInt(match[1], 10));
            } else {
                exactBaseExists = true;
            }
        }
    }

    // หากไม่มีชื่องานที่ซ้ำกับ base name เลย
    if (!exactBaseExists && existingNumbers.length === 0) {
        return cleanTitle;
    }

    // มีชื่องานซ้ำกัน -> หาเลขสูงสุดแล้ว + 1
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNum = Math.max(maxNum + 1, 1);
    return `${baseName} (${nextNum})`;
}

/**
 * สร้างงานใหม่ในโปรเจกต์ (Task)
 * - บันทึกงานลงฐานข้อมูล
 * - ส่ง In-App Notification ให้ผู้รับผิดชอบงาน, Team Leader, Creator
 * - ส่ง Email แจ้งเตือนผู้รับผิดชอบ
 * - บันทึก Task History และอัปเดตสถานะของโปรเจกต์
 */
export const createTask = async (req, res) => {
    const { projectId, title, description, taskType, priority, dueDate, assignedTo, createdBy } = req.body;
    if (!projectId || !title) {
        return res.status(400).json({ message: 'สร้างไม่สำเร็จ: กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    const formattedDueDate = parseDueDate(dueDate);
    try {
        const db = await connectToDatabase();
        const finalTitle = await resolveUniqueTaskTitle(db, projectId, title);

        const [result] = await db.query(
            "INSERT INTO tasks (project_id, title, description, task_type, priority, due_date, assigned_to, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
            [projectId, finalTitle, description || null, taskType || null, priority || 'Medium', formattedDueDate, assignedTo ? Number(assignedTo) : null]
        );
        const taskId = result.insertId;

        // Instant Real-time broadcast task creation to all connected clients immediately
        emitTaskEvent('task:created', {
            taskId: Number(taskId),
            projectId: Number(projectId),
            title: finalTitle,
            assignedTo: assignedTo ? Number(assignedTo) : null,
            createdBy: createdBy ? Number(createdBy) : null,
        });

        // Fast Response to client immediately without blocking UI
        res.status(201).json({ message: 'Create Success', taskId, title: finalTitle });

        // Run notifications, history, and status checks concurrently in background
        (async () => {
            try {
                const [projRows] = await db.query('SELECT name, created_by FROM projects WHERE id = ?', [projectId]);
                const projectName = projRows[0]?.name || `ID ${projectId}`;

                // In-app notification specifically for the assigned user
                if (assignedTo && Number(assignedTo) !== Number(createdBy)) {
                    const assignTitle = 'ได้รับมอบหมายงานใหม่';
                    const assignMsg = `คุณได้รับมอบหมายงานใหม่: "${finalTitle}" ในโปรเจกต์ "${projectName}"`;
                    const assignLink = '/MyTasks';
                    const [insertRes] = await db.query(
                        "INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) VALUES (?, ?, ?, ?, ?, ?, 0, 0)",
                        [Number(assignedTo), taskId, assignTitle, assignMsg, 'task', assignLink]
                    );
                    emitNotificationToUser(Number(assignedTo), {
                        id: insertRes.insertId,
                        user_id: Number(assignedTo),
                        task_id: taskId,
                        project_id: projectId,
                        title: assignTitle,
                        message: assignMsg,
                        type: 'task',
                        link: assignLink,
                    });
                }

                // Notify Project Creator & Team Leaders about the new task
                const [tlRows] = await db.query('SELECT user_id FROM project_team_leaders WHERE project_id = ?', [projectId]);
                const leadersToNotify = new Set();
                if (projRows[0]?.created_by) leadersToNotify.add(Number(projRows[0].created_by));
                tlRows.forEach(r => leadersToNotify.add(Number(r.user_id)));

                if (createdBy) leadersToNotify.delete(Number(createdBy));
                if (assignedTo) leadersToNotify.delete(Number(assignedTo));

                for (const leaderId of leadersToNotify) {
                    const leaderTitle = 'งานใหม่ในโปรเจกต์';
                    const leaderMsg = `มีงานใหม่ "${finalTitle}" ในโปรเจกต์ "${projectName}"`;
                    const leaderLink = `/Projects?projectId=${projectId}`;
                    const [insertRes] = await db.query(
                        "INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) VALUES (?, ?, ?, ?, ?, ?, 0, 0)",
                        [leaderId, taskId, leaderTitle, leaderMsg, 'project', leaderLink]
                    );
                    emitNotificationToUser(leaderId, {
                        id: insertRes.insertId,
                        user_id: leaderId,
                        task_id: taskId,
                        project_id: projectId,
                        title: leaderTitle,
                        message: leaderMsg,
                        type: 'project',
                        link: leaderLink,
                    });
                }

                await db.query(
                    "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'create', ?, ?)",
                    [taskId, `สร้างงาน: "${finalTitle}"`, createdBy || null]
                );

                await checkAndUpdateProjectStatus(db, projectId);
                await logActivity(db, createdBy || null, 'Create Task Success', `Created task: ${finalTitle} under project ID: ${projectId}`);
            } catch (bgErr) {
                console.error('Error in background task creation notifications:', bgErr.message);
            }
        })();
    } catch (error) {
        console.error('Error creating task:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'สร้างไม่สำเร็จ: เกิดข้อผิดพลาดของระบบ' });
        }
    }
};

/**
 * อัปเดตสถานะงาน (Pending -> In Progress -> Reviewing -> Completed)
 * - บันทึกประวัติลง task_history และ task_status_history
 * - อัปเดตสถานะของโปรเจกต์หลัก และส่งการแจ้งเตือน
 */
export const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status, userId } = req.body;
    try {
        const db = await connectToDatabase();
        const [taskRows] = await db.query('SELECT t.title, t.project_id, t.status AS old_status, p.name AS project_name, p.created_by AS project_creator FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?', [id]);
        if (taskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' });
        }
        const { title, project_id, project_name } = taskRows[0];

        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        await checkAndUpdateProjectStatus(db, project_id, userId, id);
        await db.query(
            "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
            [id, `เปลี่ยนสถานะเป็น "${status}"`, userId || null]
        );
        await db.query(
            "INSERT INTO task_status_history (task_id, status, changed_by) VALUES (?, ?, ?)",
            [id, status, userId || null]
        );
        await logActivity(db, userId || null, 'Update Task Status', `Updated task "${title}" status to "${status}"`);

        await notifyProjectMembers({
            db,
            projectId: project_id,
            taskId: id,
            title: 'อัปเดตสถานะงาน',
            message: `งาน "${title}" ในโปรเจกต์ "${project_name}" ถูกอัปเดตสถานะเป็น "${status}"`,
            type: 'task',
            link: `/Projects?projectId=${project_id}`,
            excludeUserId: userId
        });

        // Real-time broadcast task status update to all connected clients
        emitTaskEvent('task:status:updated', {
            taskId: Number(id),
            projectId: project_id,
            status,
            updatedBy: userId,
        });

        res.status(200).json({ message: 'อัปเดตสถานะสำเร็จ / Status updated successfully' });
    } catch (error) {
        console.error('Error updating task status:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * แก้ไขรายละเอียดงาน (ชื่อ, รายละเอียด, ประเภทงาน, ความสำคัญ, วันกำหนดส่ง, ผู้รับผิดชอบ)
 */
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, taskType, priority, dueDate, assignedTo, projectId, status, userId } = req.body;
    try {
        const db = await connectToDatabase();
        const [oldTaskRows] = await db.query('SELECT title, description, task_type, priority, due_date, assigned_to, status FROM tasks WHERE id = ?', [id]);
        if (oldTaskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' });
        }
        const oldTask = oldTaskRows[0];
        const oldAssignee = oldTask.assigned_to;
        const targetProjectId = projectId ? Number(projectId) : oldTask.project_id;
        let finalTitle = title || oldTitle;
        if (title && title.trim() !== oldTitle.trim()) {
            finalTitle = await resolveUniqueTaskTitle(db, targetProjectId, title, id);
        }

        const formattedDueDate = parseDueDate(dueDate) || (oldTask.due_date ? String(oldTask.due_date).split("T")[0] : null);

        await db.query(
            'UPDATE tasks SET title = ?, description = ?, task_type = ?, priority = ?, due_date = ?, assigned_to = ?, project_id = ?, status = ? WHERE id = ?',
            [
                finalTitle,
                description || null,
                taskType || null,
                priority || 'Medium',
                formattedDueDate,
                assignedTo ? Number(assignedTo) : null,
                targetProjectId,
                status || 'Pending',
                id
            ]
        );

        // Log assignee change
        if (Number(assignedTo) !== Number(oldAssignee)) {
            const [oldUserRows] = oldAssignee ? await db.query('SELECT fullname FROM users WHERE id = ?', [oldAssignee]) : [[]];
            const [newUserRows] = assignedTo ? await db.query('SELECT fullname FROM users WHERE id = ?', [assignedTo]) : [[]];
            const oldName = oldUserRows[0]?.fullname || 'ไม่มีผู้รับผิดชอบ';
            const newName = newUserRows[0]?.fullname || 'ไม่มีผู้รับผิดชอบ';
            await db.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'assignee_change', ?, ?)",
                [id, `เปลี่ยนผู้รับผิดชอบจาก "${oldName}" เป็น "${newName}"`, userId || null]
            );
        }

        // Log status change
        if (status && status !== oldStatus) {
            await db.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'status_change', ?, ?)",
                [id, `เปลี่ยนสถานะเป็น "${status}"`, userId || null]
            );
            await db.query(
                "INSERT INTO task_status_history (task_id, status, changed_by) VALUES (?, ?, ?)",
                [id, status, userId || null]
            );
        }

        const oldDueDateStr = oldTask.due_date ? parseDueDate(oldTask.due_date) : null;
        const detailsChanged = (title !== oldTask.title ||
                                (description || null) !== (oldTask.description || null) ||
                                taskType !== oldTask.task_type ||
                                priority !== oldTask.priority ||
                                formattedDueDate !== oldDueDateStr);
        if (detailsChanged) {
            await db.query(
                "INSERT INTO task_history (task_id, action, details, changed_by) VALUES (?, 'edit_details', ?, ?)",
                [id, `แก้ไขรายละเอียดงาน`, userId || null]
            );
        }

        await logActivity(db, userId || null, 'Update Task Details', `Updated task details for "${finalTitle}" (ID: ${id})`);

        if (assignedTo && Number(assignedTo) !== Number(oldAssignee) && Number(assignedTo) !== Number(userId)) {
            const [projRows] = await db.query('SELECT name FROM projects WHERE id = ?', [projectId || oldTask.project_id]);
            const projectName = projRows[0]?.name || `ID ${projectId || oldTask.project_id}`;
            const notifTitle = 'ได้รับมอบหมายงานใหม่';
            const notifMessage = `คุณได้รับมอบหมายงานใหม่: "${finalTitle}" ในโปรเจกต์ "${projectName}"`;
            const notifLink = '/MyTasks';
            const [insertRes] = await db.query(
                "INSERT INTO notifications (user_id, task_id, title, message, type, link, is_read, read_status) VALUES (?, ?, ?, ?, ?, ?, 0, 0)",
                [Number(assignedTo), id, notifTitle, notifMessage, 'task', notifLink]
            );
            emitNotificationToUser(Number(assignedTo), {
                id: insertRes.insertId,
                user_id: Number(assignedTo),
                task_id: id,
                project_id: projectId || oldTask.project_id,
                title: notifTitle,
                message: notifMessage,
                type: 'task',
                link: notifLink,
            });
        }

        await checkAndUpdateProjectStatus(db, projectId || oldTask.project_id);

        // Real-time broadcast task update to all connected clients
        emitTaskEvent('task:updated', {
            taskId: Number(id),
            projectId: projectId || oldTask.project_id,
            status,
            title: finalTitle,
            description,
            priority,
            dueDate: formattedDueDate,
            assignedTo,
            taskType,
            updatedBy: userId,
        });

        res.status(200).json({ message: 'อัปเดตข้อมูลงานสำเร็จ / Task updated successfully', title: finalTitle });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ลบงานแบบ Soft-delete
 */
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    try {
        const db = await connectToDatabase();
        const [taskRows] = await db.query('SELECT title, project_id FROM tasks WHERE id = ?', [id]);
        if (taskRows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลงาน / Task not found' });
        }
        const { title, project_id } = taskRows[0];

        await db.query('UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        await checkAndUpdateProjectStatus(db, project_id);
        await logActivity(db, userId || null, 'Delete Task', `Soft deleted task "${title}" (ID: ${id})`);

        // Real-time broadcast task deletion to all connected clients
        emitTaskEvent('task:deleted', {
            taskId: Number(id),
            projectId: Number(project_id),
            deletedBy: userId ? Number(userId) : null,
        });

        res.status(200).json({ message: 'ลบงานสำเร็จ / Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึงประวัติการแก้ไขงาน (Task History) เช่น การเปลี่ยนผู้รับผิดชอบ, แก้ไขรายละเอียด
 */
export const getTaskHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        
        // 1. Get history logs with usernames
        const [historyRows] = await db.query(`
            SELECT th.id, th.action, th.details, th.changed_at, u.fullname, u.role
            FROM task_history th
            LEFT JOIN users u ON th.changed_by = u.id
            WHERE th.task_id = ?
            ORDER BY th.changed_at DESC
        `, [id]);
        
        // 2. Calculate assignee changes count
        const [assigneeChanges] = await db.query(
            "SELECT COUNT(*) as count FROM task_history WHERE task_id = ? AND action = 'assignee_change'",
            [id]
        );
        
        // 3. Get last editor details
        let lastEditedBy = 'ไม่มีข้อมูล / No data';
        let lastEditedAt = null;
        if (historyRows.length > 0) {
            // Find the latest edit (excluding 'create')
            const latestEdit = historyRows.find(h => h.action !== 'create');
            if (latestEdit) {
                lastEditedBy = latestEdit.fullname ? `${latestEdit.fullname} (${latestEdit.role})` : 'System';
                lastEditedAt = latestEdit.changed_at;
            } else if (historyRows[0]) {
                lastEditedBy = historyRows[0].fullname ? `${historyRows[0].fullname} (${historyRows[0].role})` : 'System';
                lastEditedAt = historyRows[0].changed_at;
            }
        }
        
        res.status(200).json({
            lastEditedBy,
            lastEditedAt,
            assigneeChangesCount: assigneeChanges[0]?.count || 0,
            historyLogs: historyRows
        });
    } catch (error) {
        console.error('Error fetching task history:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึงรายการความคิดเห็น (Comments) ทั้งหมดในงาน
 */
export const getTaskComments = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT c.id, c.comment, c.created_at, u.fullname, u.avatar, u.role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.task_id = ?
            ORDER BY c.created_at DESC
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching comments:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * เพิ่มความคิดเห็นใหม่ลงในงาน พร้อมแจ้งเตือนสมาชิกในโปรเจกต์
 */
export const createTaskComment = async (req, res) => {
    const { id } = req.params;
    const { comment, userId } = req.body;
    if (!comment) {
        return res.status(400).json({ message: 'ความคิดเห็นไม่สามารถว่างได้ / Comment cannot be empty' });
    }
    try {
        const db = await connectToDatabase();
        const [insertResult] = await db.query(
            "INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)",
            [id, userId, comment]
        );

        // Fetch inserted comment with user details for instant live broadcast
        const [commentRows] = await db.query(`
            SELECT c.id, c.comment, c.created_at, u.fullname, u.avatar, u.role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [insertResult.insertId]);

        const newCommentObj = commentRows[0] || {
            id: insertResult.insertId,
            comment,
            created_at: new Date().toISOString(),
        };

        // Real-time broadcast to all clients looking at this task
        emitTaskEvent('task:comment:new', {
            taskId: Number(id),
            comment: newCommentObj,
        });

        const [taskRows] = await db.query(`
            SELECT t.title, t.project_id, p.name AS project_name 
            FROM tasks t 
            JOIN projects p ON t.project_id = p.id 
            WHERE t.id = ?
        `, [id]);
        if (taskRows.length > 0) {
            const { title, project_id, project_name } = taskRows[0];
            await notifyProjectMembers({
                db,
                projectId: project_id,
                taskId: Number(id),
                title: 'ความคิดเห็นใหม่ในงาน',
                message: `มีความคิดเห็นใหม่ในงาน "${title}" ในโปรเจกต์ "${project_name}"`,
                type: 'task',
                link: `/Projects?projectId=${project_id}`,
                excludeUserId: userId
            });
        }

        res.status(201).json({ message: 'บันทึกความคิดเห็นสำเร็จ / Comment created successfully', comment: newCommentObj });
    } catch (error) {
        console.error('Error creating comment:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึงรายการไฟล์แนบทั้งหมดของงาน
 */
export const getTaskFiles = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT f.id, f.filename, f.filepath, f.created_at, u.fullname, u.role
            FROM files f
            JOIN users u ON f.uploaded_by = u.id
            WHERE f.task_id = ?
            ORDER BY f.created_at DESC
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching files:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * อัปโหลดไฟล์แนบเข้าสู่งาน
 */
export const uploadTaskFile = async (req, res) => {
    const { id } = req.params;
    const { uploadedBy } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด / Please select a file' });
    }
    try {
        const db = await connectToDatabase();
        const filename = req.file.originalname;
        const filepath = getUploadedFileUrl(req.file);
        
        const [insertRes] = await db.query(
            "INSERT INTO files (task_id, filename, filepath, uploaded_by) VALUES (?, ?, ?, ?)",
            [id, filename, filepath, uploadedBy || null]
        );

        // Fetch inserted file with user details
        const [fileRows] = await db.query(`
            SELECT f.id, f.filename, f.filepath, f.created_at, u.fullname, u.role
            FROM files f
            LEFT JOIN users u ON f.uploaded_by = u.id
            WHERE f.id = ?
        `, [insertRes.insertId]);

        const newFileObj = fileRows[0] || {
            id: insertRes.insertId,
            filename,
            filepath,
            created_at: new Date().toISOString(),
        };

        // Real-time broadcast to all clients looking at this task
        emitTaskEvent('task:file:new', {
            taskId: Number(id),
            file: newFileObj,
        });

        res.status(201).json({ message: 'อัปโหลดไฟล์สำเร็จ / File uploaded successfully', filepath, file: newFileObj });
    } catch (error) {
        console.error('Error uploading task file:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึง Timeline การเปลี่ยนสถานะงาน (Task Status History)
 */
export const getTaskStatusHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query(`
            SELECT tsh.status, tsh.changed_at, u.fullname, u.role
            FROM task_status_history tsh
            LEFT JOIN users u ON tsh.changed_by = u.id
            WHERE tsh.task_id = ?
            ORDER BY tsh.changed_at ASC
        `, [id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching status history:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 📊 DASHBOARD & LOGS CONTROLLERS (สถิติและประวัติการทำงาน)
// ==========================================

/**
 * ดึงสถิติต่างๆ สำหรับแสดงผลหน้า Dashboard (จำนวนผู้ใช้, โปรเจกต์, งาน, งานที่เกินกำหนด)
 * พร้อม In-Memory Caching (15s) และรันแบบ Parallel ด้วย Promise.all
 */
export const getDashboardStats = async (req, res) => {
    try {
        const role = (req.query.role || '').toLowerCase().trim().replace(/\s+/g, '_');
        const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;
        const isAdmin = role === 'admin';
        const isManager = role === 'manager' || role === 'project_manager';
        const isTeamLeader = role === 'team_leader';

        // 1. Check in-memory cache first
        const cacheKey = `dashboard_stats_${role}_${userId || 'all'}`;
        const cachedData = memoryCache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const db = await connectToDatabase();

        let projectCount = 0;
        let pendingProjects = 0;
        let inProgressProjects = 0;
        let reviewProjects = 0;
        let completedProjects = 0;
        let overdueProjectCount = 0;

        let taskCount = 0;
        let overdueTaskCount = 0;
        let pendingTasks = 0;
        let inProgressTasks = 0;
        let reviewingTasks = 0;
        let completedTasks = 0;

        try {
            // ดึงจำนวนผู้ใช้งานทั้งหมดพร้อมกับสถิติโปรเจกต์และงานแบบ Parallel
            const userCountPromise = db.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
            let pStatsPromise;
            let tStatsPromise;

            if (isAdmin) {
                pStatsPromise = db.query(`
                    SELECT 
                        COUNT(*) AS total,
                        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                        SUM(CASE WHEN LOWER(status) IN ('in progress', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
                        SUM(CASE WHEN LOWER(status) IN ('review', 'reviewing') THEN 1 ELSE 0 END) AS review,
                        SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                        SUM(CASE WHEN end_date < NOW() AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) AS overdue
                    FROM projects 
                    WHERE deleted_at IS NULL
                `);

                tStatsPromise = db.query(`
                    SELECT 
                        COUNT(*) AS total,
                        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                        SUM(CASE WHEN LOWER(status) IN ('in progress', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
                        SUM(CASE WHEN LOWER(status) IN ('review', 'reviewing') THEN 1 ELSE 0 END) AS reviewing,
                        SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                        SUM(CASE WHEN due_date < NOW() AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) AS overdue
                    FROM tasks 
                    WHERE deleted_at IS NULL
                `);
            } else if (isManager) {
                pStatsPromise = db.query(`
                    SELECT 
                        COUNT(*) AS total,
                        SUM(CASE WHEN LOWER(p.status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                        SUM(CASE WHEN LOWER(p.status) IN ('in progress', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
                        SUM(CASE WHEN LOWER(p.status) IN ('review', 'reviewing') THEN 1 ELSE 0 END) AS review,
                        SUM(CASE WHEN LOWER(p.status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                        SUM(CASE WHEN p.end_date < NOW() AND LOWER(p.status) != 'completed' THEN 1 ELSE 0 END) AS overdue
                    FROM projects p 
                    WHERE p.deleted_at IS NULL ${userId ? 'AND (p.created_by = ?)' : ''}
                `, userId ? [userId] : []);

                if (userId) {
                    tStatsPromise = db.query(`
                        SELECT 
                            COUNT(DISTINCT t.id) AS total,
                            SUM(CASE WHEN LOWER(t.status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                            SUM(CASE WHEN LOWER(t.status) IN ('in progress', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
                            SUM(CASE WHEN LOWER(t.status) IN ('review', 'reviewing') THEN 1 ELSE 0 END) AS reviewing,
                            SUM(CASE WHEN LOWER(t.status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                            SUM(CASE WHEN t.due_date < NOW() AND LOWER(t.status) != 'completed' THEN 1 ELSE 0 END) AS overdue
                        FROM tasks t
                        JOIN projects p ON t.project_id = p.id
                        WHERE p.deleted_at IS NULL AND t.deleted_at IS NULL 
                          AND (p.created_by = ? OR t.assigned_to = ?)
                    `, [userId, userId]);
                }
            } else if (isTeamLeader) {
                pStatsPromise = db.query(`
                    SELECT 
                        COUNT(DISTINCT p.id) AS total,
                        COUNT(DISTINCT CASE WHEN LOWER(p.status) = 'pending' THEN p.id END) AS pending,
                        COUNT(DISTINCT CASE WHEN LOWER(p.status) IN ('in progress', 'in_progress') THEN p.id END) AS inProgress,
                        COUNT(DISTINCT CASE WHEN LOWER(p.status) IN ('review', 'reviewing') THEN p.id END) AS review,
                        COUNT(DISTINCT CASE WHEN LOWER(p.status) = 'completed' THEN p.id END) AS completed,
                        COUNT(DISTINCT CASE WHEN p.end_date < NOW() AND LOWER(p.status) != 'completed' THEN p.id END) AS overdue
                    FROM projects p
                    LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
                    WHERE p.deleted_at IS NULL ${userId ? 'AND (ptl.user_id = ? OR p.created_by = ?)' : ''}
                `, userId ? [userId, userId] : []);

                if (userId) {
                    tStatsPromise = db.query(`
                        SELECT 
                            COUNT(DISTINCT t.id) AS total,
                            SUM(CASE WHEN LOWER(t.status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                            SUM(CASE WHEN LOWER(t.status) IN ('in progress', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
                            SUM(CASE WHEN LOWER(t.status) IN ('review', 'reviewing') THEN 1 ELSE 0 END) AS reviewing,
                            SUM(CASE WHEN LOWER(t.status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                            SUM(CASE WHEN t.due_date < NOW() AND LOWER(t.status) != 'completed' THEN 1 ELSE 0 END) AS overdue
                        FROM tasks t
                        JOIN projects p ON t.project_id = p.id
                        LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
                        WHERE p.deleted_at IS NULL AND t.deleted_at IS NULL 
                          AND (ptl.user_id = ? OR p.created_by = ? OR t.assigned_to = ?)
                    `, [userId, userId, userId]);
                }
            } else {
                if (userId) {
                    tStatsPromise = db.query(`
                        SELECT 
                            COUNT(*) AS total,
                            SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) AS pending,
                            SUM(CASE WHEN LOWER(status) IN ('in progress', 'in_progress') THEN 1 ELSE 0 END) AS inProgress,
                            SUM(CASE WHEN LOWER(status) IN ('review', 'reviewing') THEN 1 ELSE 0 END) AS reviewing,
                            SUM(CASE WHEN LOWER(status) = 'completed' THEN 1 ELSE 0 END) AS completed,
                            SUM(CASE WHEN due_date < NOW() AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) AS overdue
                        FROM tasks 
                        WHERE assigned_to = ? AND deleted_at IS NULL
                    `, [userId]);
                }
            }

            // รัน Parallel Queries ทั้งหมดพร้อมกัน
            const [userRowsRes, pStatsRes, tStatsRes] = await Promise.all([
                userCountPromise,
                pStatsPromise ? pStatsPromise : Promise.resolve([[]]),
                tStatsPromise ? tStatsPromise : Promise.resolve([[]])
            ]);

            const userCount = userRowsRes[0][0]?.count || 0;
            const pStats = pStatsRes[0] || [];
            const tStats = tStatsRes[0] || [];

            if (pStats.length > 0) {
                projectCount = Number(pStats[0].total) || 0;
                pendingProjects = Number(pStats[0].pending) || 0;
                inProgressProjects = Number(pStats[0].inProgress) || 0;
                reviewProjects = Number(pStats[0].review) || 0;
                completedProjects = Number(pStats[0].completed) || 0;
                overdueProjectCount = Number(pStats[0].overdue) || 0;
            }

            if (tStats.length > 0) {
                taskCount = Number(tStats[0].total) || 0;
                pendingTasks = Number(tStats[0].pending) || 0;
                inProgressTasks = Number(tStats[0].inProgress) || 0;
                reviewingTasks = Number(tStats[0].reviewing) || 0;
                completedTasks = Number(tStats[0].completed) || 0;
                overdueTaskCount = Number(tStats[0].overdue) || 0;
            }

            const responseData = {
                users: userCount,
                projects: projectCount,
                tasks: taskCount,
                overdueTasks: overdueTaskCount,
                overdueProjects: overdueProjectCount,
                projectStatus: {
                    pending: pendingProjects,
                    inProgress: inProgressProjects,
                    review: reviewProjects,
                    completed: completedProjects
                },
                taskStatus: {
                    pending: pendingTasks,
                    inProgress: inProgressTasks,
                    reviewing: reviewingTasks,
                    completed: completedTasks
                }
            };

            // บันทึกผลลัพธ์ลง In-Memory Cache เป็นเวลา 15 วินาที
            memoryCache.set(cacheKey, responseData, 15);

            return res.status(200).json(responseData);
        } catch (innerError) {
            console.error('Error in stats inner query:', innerError.message);
            return res.status(200).json({
                users: 0,
                projects: 0,
                tasks: 0,
                overdueTasks: 0,
                overdueProjects: 0,
                projectStatus: { pending: 0, inProgress: 0, review: 0, completed: 0 },
                taskStatus: { pending: 0, inProgress: 0, reviewing: 0, completed: 0 }
            });
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึง Event สำหรับแสดงผลบนปฏิทินแบบ Range Filter (Calendar Events Endpoint)
 */
export const getCalendarEvents = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const { start, end, userId, role } = req.query;
        const normRole = (role || '').toLowerCase().trim().replace(/\s+/g, '_');
        const parsedUserId = userId ? parseInt(userId, 10) : null;
        const isAdmin = normRole === 'admin';
        const isManager = normRole === 'manager' || normRole === 'project_manager';
        const isTeamLeader = normRole === 'team_leader';

        const events = [];

        if (isAdmin || isManager || isTeamLeader) {
            let query = `
                SELECT p.id, p.name, p.end_date, p.status, p.priority
                FROM projects p
            `;
            const conditions = ['p.deleted_at IS NULL', 'p.end_date IS NOT NULL'];
            const params = [];

            if (isManager && parsedUserId) {
                conditions.push('(p.created_by = ?)');
                params.push(parsedUserId);
            } else if (isTeamLeader && parsedUserId) {
                query += ` LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id`;
                conditions.push('(ptl.user_id = ? OR p.created_by = ?)');
                params.push(parsedUserId, parsedUserId);
            }

            if (start) {
                conditions.push('p.end_date >= ?');
                params.push(start);
            }
            if (end) {
                conditions.push('p.end_date <= ?');
                params.push(end);
            }

            query += ` WHERE ` + conditions.join(' AND ') + ` ORDER BY p.end_date ASC`;

            const [rows] = await db.query(query, params);
            for (const project of rows) {
                const status = (project.status || '').toLowerCase();
                let color = '#ef4444';
                if (status === 'completed') color = '#10b981';
                else if (status === 'in progress' || status === 'in_progress') color = '#6366f1';
                else if (status === 'review' || status === 'reviewing') color = '#f59e0b';

                events.push({
                    id: `proj-${project.id}`,
                    title: project.name,
                    date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
                    color,
                    extendedProps: {
                        type: 'project',
                        projectId: project.id,
                        projectName: project.name,
                        status: project.status,
                        priority: project.priority,
                    }
                });
            }
        } else {
            // Regular member: tasks assigned to user
            let query = `
                SELECT t.id, t.title, t.due_date, t.status, t.priority, t.project_id, p.name as project_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.deleted_at IS NULL AND t.due_date IS NOT NULL
            `;
            const params = [];

            if (parsedUserId) {
                query += ` AND t.assigned_to = ?`;
                params.push(parsedUserId);
            }
            if (start) {
                query += ` AND t.due_date >= ?`;
                params.push(start);
            }
            if (end) {
                query += ` AND t.due_date <= ?`;
                params.push(end);
            }

            query += ` ORDER BY t.due_date ASC`;

            const [rows] = await db.query(query, params);
            for (const task of rows) {
                const status = (task.status || '').toLowerCase();
                let color = '#ef4444';
                if (status === 'completed') color = '#10b981';
                else if (status === 'in progress' || status === 'in_progress') color = '#6366f1';
                else if (status === 'review' || status === 'reviewing') color = '#f59e0b';

                events.push({
                    id: `task-${task.id}`,
                    title: task.title,
                    date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
                    color,
                    extendedProps: {
                        type: 'task',
                        taskId: task.id,
                        taskTitle: task.title,
                        projectName: task.project_name,
                        projectId: task.project_id,
                        status: task.status,
                        priority: task.priority,
                    }
                });
            }
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching calendar events:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ดึงประวัติกิจกรรม (Activity Logs) ตามสิทธิ์และขอบเขตของผู้ใช้ (Role-based Activity Logs)
 * - Admin: เห็นกิจกรรมทั้งหมดทั้งระบบ
 * - Project Manager: เห็นกิจกรรมในโปรเจกต์ที่ตนเองดูแล/สร้าง และกิจกรรมที่ตนเองทำ
 * - Team Leader: เห็นกิจกรรมในโปรเจกต์ที่ตนเองเป็นหัวหน้าทีม และกิจกรรมที่ตนเองทำ
 * - Staff / User: เห็นกิจกรรมในงานที่ได้รับมอบหมาย และกิจกรรมส่วนตัว
 */
export const getActivityLogs = async (req, res) => {
    try {
        const db = await connectToDatabase();
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const queryUserId = req.query.userId ? parseInt(req.query.userId, 10) : null;
        const targetUserId = queryUserId || req.userId;
        let role = req.query.role ? req.query.role.toLowerCase().trim().replace(/\s+/g, '_') : null;

        // หากไม่ได้ส่ง role มา แต่มี targetUserId ให้ลองหา role จากฐานข้อมูล
        if (!role && targetUserId && !queryUserId) {
            const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [targetUserId]);
            if (userRows.length > 0) {
                role = (userRows[0].role || '').toLowerCase().trim().replace(/\s+/g, '_');
            }
        }

        const isAdmin = role === 'admin';
        const isManager = role === 'manager' || role === 'project_manager';
        const isTeamLeader = role === 'team_leader';

        let query = `
            SELECT al.id, al.action, al.details, al.created_at, al.user_id, u.fullname, u.avatar
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
        `;
        const params = [];
        const conditions = [];

        // 1. กรณีระบุ userId ชัดเจนแบบไม่มี role (เช่น หน้า My Activity) -> ดึงเฉพาะของ user นั้น
        if (queryUserId && !role) {
            conditions.push('al.user_id = ?');
            params.push(queryUserId);
        } 
        // 2. ถ้าไม่ใช่ Admin และมี targetUserId ให้กรองตาม Scope ของ Role
        else if (!isAdmin && targetUserId) {
            if (isManager) {
                // ดึงโปรเจกต์ที่ Manager คนนี้ดูแล
                const [managedProjects] = await db.query(
                    'SELECT id, name FROM projects WHERE created_by = ? AND deleted_at IS NULL',
                    [targetUserId]
                );
                const projIds = managedProjects.map(p => p.id);
                const projNames = managedProjects.map(p => p.name).filter(Boolean);

                let managerCondition = `(al.user_id = ?`;
                params.push(targetUserId);

                if (projIds.length > 0) {
                    const [tasks] = await db.query(
                        'SELECT id, title FROM tasks WHERE project_id IN (?) AND deleted_at IS NULL',
                        [projIds]
                    );
                    const taskIds = tasks.map(t => t.id);
                    const taskTitles = tasks.map(t => t.title).filter(Boolean);

                    const likeClauses = [];
                    // ค้นหาตามชื่อโปรเจกต์
                    for (const name of projNames) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%${name}%`);
                    }
                    // ค้นหาตาม Project ID
                    for (const pid of projIds) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%project ID: ${pid}%`);
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%project ID:${pid}%`);
                    }
                    // ค้นหาตาม Task Title
                    for (const title of taskTitles) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%${title}%`);
                    }
                    // ค้นหาตาม Task ID
                    for (const tid of taskIds) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%(ID: ${tid})%`);
                    }

                    if (likeClauses.length > 0) {
                        managerCondition += ` OR (${likeClauses.join(' OR ')})`;
                    }
                }
                managerCondition += `)`;
                conditions.push(managerCondition);

            } else if (isTeamLeader) {
                // Team Leader: โปรเจกต์ที่ตนเป็น Team Leader หรือเป็นผู้สร้าง
                const [tlProjects] = await db.query(`
                    SELECT DISTINCT p.id, p.name 
                    FROM projects p
                    LEFT JOIN project_team_leaders ptl ON p.id = ptl.project_id
                    WHERE (ptl.user_id = ? OR p.created_by = ?) AND p.deleted_at IS NULL
                `, [targetUserId, targetUserId]);

                const projIds = tlProjects.map(p => p.id);
                const projNames = tlProjects.map(p => p.name).filter(Boolean);

                let tlCondition = `(al.user_id = ?`;
                params.push(targetUserId);

                if (projIds.length > 0) {
                    const [tasks] = await db.query(
                        'SELECT id, title FROM tasks WHERE project_id IN (?) AND deleted_at IS NULL',
                        [projIds]
                    );
                    const taskIds = tasks.map(t => t.id);
                    const taskTitles = tasks.map(t => t.title).filter(Boolean);

                    const likeClauses = [];
                    for (const name of projNames) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%${name}%`);
                    }
                    for (const pid of projIds) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%project ID: ${pid}%`);
                    }
                    for (const title of taskTitles) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%${title}%`);
                    }
                    for (const tid of taskIds) {
                        likeClauses.push('al.details LIKE ?');
                        params.push(`%(ID: ${tid})%`);
                    }

                    if (likeClauses.length > 0) {
                        tlCondition += ` OR (${likeClauses.join(' OR ')})`;
                    }
                }
                tlCondition += `)`;
                conditions.push(tlCondition);

            } else {
                // Regular staff: กิจกรรมในงานที่ได้รับมอบหมาย หรืองานของตัวเอง
                const [userTasks] = await db.query(
                    'SELECT id, title FROM tasks WHERE assigned_to = ? AND deleted_at IS NULL',
                    [targetUserId]
                );
                let userCondition = `(al.user_id = ?`;
                params.push(targetUserId);

                const taskTitles = userTasks.map(t => t.title).filter(Boolean);
                const taskIds = userTasks.map(t => t.id);
                const likeClauses = [];
                for (const title of taskTitles) {
                    likeClauses.push('al.details LIKE ?');
                    params.push(`%${title}%`);
                }
                for (const tid of taskIds) {
                    likeClauses.push('al.details LIKE ?');
                    params.push(`%(ID: ${tid})%`);
                }
                if (likeClauses.length > 0) {
                    userCondition += ` OR (${likeClauses.join(' OR ')})`;
                }
                userCondition += `)`;
                conditions.push(userCondition);
            }
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY al.created_at DESC`;

        if (limit && !isNaN(limit)) {
            query += ` LIMIT ?`;
            params.push(limit);
        }

        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching activity logs:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 🔑 OTP & PASSWORD RESET CONTROLLERS (รีเซ็ตรหัสผ่าน)
// ==========================================

/**
 * ส่งรหัส OTP (6 หลัก) ไปยังอีเมลของผู้ใช้เพื่อใช้รีเซ็ตรหัสผ่าน (มีอายุ 3 นาที)
 */
export const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const db = await connectToDatabase();
        const [users] = await db.query('SELECT id, fullname FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลผู้ใช้ในระบบ / User not found' });
        }

        const userId = users[0].id;
        const fullname = users[0].fullname;
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

        await db.query(
            'INSERT INTO otp_requests (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
            [userId, otpCode, expiresAt]
        );

        console.log(`[OTP Sent] Email: ${email}, Code: ${otpCode}`);

        // Send OTP email via emailService
        await sendOtpEmail({
            recipientEmail: email,
            recipientName: fullname,
            otpCode: otpCode
        });

        res.status(200).json({ 
            message: 'ส่งรหัส OTP เรียบร้อยแล้ว (OTP sent successfully)',
            otpCode: otpCode 
        });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ตั้งรหัสผ่านใหม่โดยใช้รหัส OTP ที่ถูกต้องและยังไม่หมดอายุ
 */
export const resetPassword = async (req, res) => {
    const { email, password, otpCode } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, fullname FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = rows[0].id;

        const [otpRows] = await db.query(`
            SELECT * FROM otp_requests 
            WHERE user_id = ? 
              AND otp_code = ? 
              AND is_used = 0 
              AND expires_at > NOW() 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [userId, otpCode]);

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว (Invalid or expired OTP)' });
        }

        const otpRequestId = otpRows[0].id;
        await db.query('UPDATE otp_requests SET is_used = 1 WHERE id = ?', [otpRequestId]);

        const hashPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword, userId]);

        await logActivity(db, userId, 'Reset Password', `User reset password for: ${email}`);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * บังคับเปลี่ยนรหัสผ่านสำหรับการเข้าใช้งานระบบครั้งแรก (First Login)
 */
export const resetPasswordFirstTime = async (req, res) => {
    const { userId, password } = req.body;
    try {
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT id, email FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await db.query(
            'UPDATE users SET password = ?, is_force_reset = 0 WHERE id = ?',
            [hashPassword, userId]
        );

        await logActivity(db, userId, 'Reset Password First Time', `User reset password on first login for: ${rows[0].email}`);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password on first login:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 📌 PERSONAL TASKS CONTROLLERS (งานส่วนตัว / ปฏิทิน)
// ==========================================

/**
 * ดึงรายการงานส่วนตัวทั้งหมดของผู้ใช้งาน (Personal Tasks)
 */
export const getPersonalTasks = async (req, res) => {
    const { userId } = req.query;
    try {
        const db = await connectToDatabase();
        let query = 'SELECT id, user_id, title, status, position, is_completed, task_date, created_at FROM personal_tasks';
        let params = [];
        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }
        query += ' ORDER BY position ASC, created_at ASC';
        const [rows] = await db.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching personal tasks:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * สร้างงานส่วนตัวใหม่ (Personal Task)
 */
export const createPersonalTask = async (req, res) => {
    const { user_id, title, status, is_completed, task_date } = req.body;
    try {
        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }
        const db = await connectToDatabase();
        
        let validUserId = user_id || null;
        if (validUserId) {
            const [u] = await db.query('SELECT id FROM users WHERE id = ?', [validUserId]);
            if (u.length === 0) validUserId = null;
        }

        const taskStatus = status || (is_completed ? 'completed' : 'todo');
        const completedVal = taskStatus === 'completed' ? 1 : 0;

        // ดึงตำแหน่งสูงสุดในคอลัมน์นั้นมาเพื่อวางไว้ลำดับท้ายสุด
        const [maxPos] = await db.query(
            'SELECT COALESCE(MAX(position), 0) + 1 AS nextPos FROM personal_tasks WHERE status = ? AND (user_id = ? OR (user_id IS NULL AND ? IS NULL))',
            [taskStatus, validUserId, validUserId]
        );
        const position = maxPos[0]?.nextPos || 0;

        const [result] = await db.query(
            'INSERT INTO personal_tasks (user_id, title, status, position, is_completed, task_date) VALUES (?, ?, ?, ?, ?, ?)',
            [validUserId, title, taskStatus, position, completedVal, task_date || null]
        );
        res.status(201).json({ id: result.insertId, user_id: validUserId, title, status: taskStatus, position, is_completed: completedVal, task_date });
    } catch (error) {
        console.error('Error creating personal task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * แก้ไขงานส่วนตัว (ชื่องาน, สถานะ, กำหนดวัน, ลำดับตำแหน่ง)
 */
export const updatePersonalTask = async (req, res) => {
    const { id } = req.params;
    const { title, status, position, is_completed, task_date } = req.body;
    try {
        const db = await connectToDatabase();
        const updates = [];
        const params = [];

        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
            updates.push('is_completed = ?');
            params.push(status === 'completed' ? 1 : 0);
        } else if (is_completed !== undefined) {
            updates.push('is_completed = ?');
            params.push(is_completed ? 1 : 0);
            updates.push('status = ?');
            params.push(is_completed ? 'completed' : 'todo');
        }
        if (position !== undefined) {
            updates.push('position = ?');
            params.push(position);
        }
        if (task_date !== undefined) {
            updates.push('task_date = ?');
            params.push(task_date);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        params.push(id);
        await db.query(`UPDATE personal_tasks SET ${updates.join(', ')} WHERE id = ?`, params);
        res.status(200).json({ message: 'Personal task updated successfully' });
    } catch (error) {
        console.error('Error updating personal task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * จัดเรียงลำดับงานส่วนตัวใหม่หลังการลากและวาง (Drag & Drop Reorder)
 * อัปเดตแบบ Single Batch Query เพื่อลดโหลด I/O ของ Database
 */
export const reorderPersonalTasks = async (req, res) => {
    const { tasks } = req.body; // Array of { id, status, position }
    try {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ message: 'Tasks array is required' });
        }
        const db = await connectToDatabase();

        const validTasks = tasks.filter(t => t && t.id);
        const ids = validTasks.map(t => parseInt(t.id, 10)).filter(Boolean);
        if (ids.length === 0) {
            return res.status(400).json({ message: 'Invalid task IDs' });
        }

        const placeholders = ids.map(() => '?').join(',');

        // สร้าง CASE statements สำหรับ batch update ใน 1 query
        let statusCases = '';
        let positionCases = '';
        let completedCases = '';
        const statusParams = [];
        const positionParams = [];
        const completedParams = [];

        validTasks.forEach(item => {
            const taskId = parseInt(item.id, 10);
            const isCompleted = item.status === 'completed' ? 1 : 0;

            statusCases += 'WHEN id = ? THEN ? ';
            statusParams.push(taskId, item.status);

            positionCases += 'WHEN id = ? THEN ? ';
            positionParams.push(taskId, parseInt(item.position, 10) || 0);

            completedCases += 'WHEN id = ? THEN ? ';
            completedParams.push(taskId, isCompleted);
        });

        const sql = `
            UPDATE personal_tasks 
            SET 
                status = CASE ${statusCases} ELSE status END,
                position = CASE ${positionCases} ELSE position END,
                is_completed = CASE ${completedCases} ELSE is_completed END
            WHERE id IN (${placeholders})
        `;

        const params = [...statusParams, ...positionParams, ...completedParams, ...ids];

        await db.query(sql, params);
        res.status(200).json({ message: 'Tasks reordered successfully' });
    } catch (error) {
        console.error('Error reordering personal tasks:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ลบงานส่วนตัวออกจากปฏิทินและระบบ
 */
export const deletePersonalTask = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectToDatabase();
        await db.query('DELETE FROM personal_tasks WHERE id = ?', [id]);
        res.status(200).json({ message: 'Personal task deleted successfully' });
    } catch (error) {
        console.error('Error deleting personal task:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Trigger manual check for overdue tasks and send notifications to leaders
 */
export const triggerCheckOverdueTasks = async (req, res) => {
    try {
        const { checkOverdueTasksAndNotifyLeaders } = await import('../utils/taskScheduler.js');
        const result = await checkOverdueTasksAndNotifyLeaders();
        res.status(200).json({
            message: 'Overdue tasks check completed',
            data: result
        });
    } catch (error) {
        console.error('Error triggering overdue tasks check:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ส่งข้อความจากแบบฟอร์มติดต่อเรา (Contact Us) ไปยังอีเมลของผู้ดูแลระบบ
 */
export const sendContactMessage = async (req, res) => {
    const { fullName, email, subject, message } = req.body;
    if (!fullName || !email || !message) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (Full Name, Email, Message)' });
    }
    try {
        await sendContactFormEmail({ fullName, email, subject, message });
        res.status(200).json({ message: 'ส่งข้อความสำเร็จแล้ว เราได้รับเรื่องของคุณเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error in sendContactMessage controller:', error.message);
        res.status(500).json({ message: 'ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้งในภายหลัง' });
    }
};



