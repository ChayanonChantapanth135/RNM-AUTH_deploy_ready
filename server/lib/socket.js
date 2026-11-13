import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

const getJwtSecret = () => {
  const secret = process.env.JWT_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_KEY or JWT_SECRET environment variable is required');
  }
  return secret;
};

/**
 * กำหนดค่าและเริ่มต้นการทำงานของ Socket.io Server
 * @param {import('http').Server} httpServer 
 * @param {string[]} allowedOrigins
 */
export const initSocket = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https:\/\/(?:[a-zA-Z0-9-_]+\.)?chayanonlab\.link$/.test(origin)) return callback(null, true);
        if (/^https:\/\/[a-zA-Z0-9-_]+\.vercel\.app$/.test(origin)) return callback(null, true);
        if (/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware ยืนยันตัวตนสำหรับ Socket Connection (ต้องมี JWT ที่ถูกต้อง)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1] || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, getJwtSecret());
      socket.userId = decoded.id || decoded.userId;
      if (!socket.userId) {
        return next(new Error('Authentication error: Invalid token payload'));
      }
      next();
    } catch (err) {
      console.warn('[Socket.io] Authentication token invalid:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join('authenticated');
    if (socket.userId) {
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      console.log(`[Socket.io] User ${socket.userId} joined room ${userRoom} (Socket ID: ${socket.id})`);
    }

    // รองรับกรณี Client ขอ authenticate ใหม่ (เช่น หลัง refresh token)
    socket.on('authenticate', (token) => {
      if (!token) return;
      try {
        const decoded = jwt.verify(token, getJwtSecret());
        const userId = decoded.id || decoded.userId;
        if (userId) {
          socket.userId = userId;
          socket.join('authenticated');
          const userRoom = `user_${userId}`;
          socket.join(userRoom);
          console.log(`[Socket.io] Authenticated User ${userId} joined room ${userRoom}`);
        }
      } catch (err) {
        console.warn('[Socket.io] Dynamic authentication failed:', err.message);
      }
    });

    socket.on('disconnect', (reason) => {
      // disconnected
    });
  });

  return io;
};

/**
 * ดึง instance ของ Socket.io ปัจจุบัน
 */
export const getIO = () => {
  return io;
};

/**
 * ดันข้อมูลแจ้งเตือนไปยังผู้ใช้คนเดียวหรือหลายคนแบบ Real-time
 * @param {number|number[]} userId - ID ของผู้ใช้เป้าหมาย
 * @param {object} notification - ข้อมูลการแจ้งเตือน
 */
export const emitNotificationToUser = (userId, notification) => {
  if (!io) return;

  const targetIds = Array.isArray(userId) ? userId : [userId];
  targetIds.forEach((id) => {
    if (!id) return;
    const userRoom = `user_${id}`;
    io.to(userRoom).emit('notification:new', {
      ...notification,
      is_read: 0,
      read_status: 0,
      created_at: notification.created_at || new Date().toISOString(),
    });
  });
};

/**
 * ส่ง Event ที่เกี่ยวข้องกับ Task (เช่น สถานะเปลี่ยน, มีคอมเมนต์ใหม่, อัปโหลดไฟล์) ไปยังทุกคนแบบ Real-time
 * @param {string} eventName - ชื่อ Event เช่น 'task:comment:new', 'task:status:updated', 'task:updated'
 * @param {object} payload - ข้อมูลที่ต้องการส่ง
 */
export const emitTaskEvent = (eventName, payload) => {
  if (!io) return;
  io.to('authenticated').emit(eventName, payload);
};


