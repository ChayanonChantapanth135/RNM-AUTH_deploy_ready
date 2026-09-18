import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

/**
 * กำหนดค่าและเริ่มต้นการทำงานของ Socket.io Server
 * @param {import('http').Server} httpServer 
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // หรือกำหนดเฉพาะ domain ตามความเหมาะสม
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware ยืนยันตัวตนสำหรับ Socket Connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1] || socket.handshake.query?.token;

    if (!token) {
      // ยอมให้ connect ได้ แต่จะไม่มี room userId จนกว่าจะ authenticate
      return next();
    }

    try {
      const secret = process.env.JWT_KEY || process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret);
      socket.userId = decoded.id || decoded.userId;
      next();
    } catch (err) {
      console.warn('[Socket.io] Authentication token invalid:', err.message);
      // ยอมให้ผ่านแต่ไม่เซ็ต userId
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      console.log(`[Socket.io] User ${socket.userId} joined room ${userRoom} (Socket ID: ${socket.id})`);
    }

    // รองรับกรณี Client ขอ authenticate ภายหลังจาก connect แล้ว
    socket.on('authenticate', (token) => {
      if (!token) return;
      try {
        const secret = process.env.JWT_KEY || process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id || decoded.userId;
        if (userId) {
          socket.userId = userId;
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
  io.emit(eventName, payload);
};


