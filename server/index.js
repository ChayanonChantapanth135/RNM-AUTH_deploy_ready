import http from 'http'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import { initializeDatabase } from './lib/initDb.js'
import { initSocket } from './lib/socket.js'
import { startTaskScheduler } from './utils/taskScheduler.js'
import path from 'path'
import { fileURLToPath } from 'url'

// กำหนดตัวแปรและตั้งค่าที่อยู่ไฟล์/โฟลเดอร์สำหรับบริการไฟล์ Static (เช่น ไฟล์อัปโหลด Avatar)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import helmet from 'helmet'

const app = express()
const server = http.createServer(app)

// 1. เพิ่ม Security Headers ด้วย Helmet (พร้อมปรับ crossOriginResourcePolicy ให้โหลดรูป avatar ได้)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// เริ่มต้นใช้งาน Socket.io บน HTTP Server
initSocket(server)

// 2. ตั้งค่า CORS ให้รัดกุม รองรับทั้ง localhost และ Network Origin ทั่วไป
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // อนุญาตถ้าไม่มี origin (เช่น mobile app/curl) หรืออยู่ใน allowed list หรืออยู่ใน local subnet
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}))

// เปิดใช้งาน Response Compression เพื่อลดขนาด Payload ของ JSON และไฟล์ Static ผ่าน Network
try {
  const compression = (await import('compression')).default;
  app.use(compression());
} catch (e) {
  // Fallback if compression is optional
}

// ตั้งค่าให้ Express สามารถแปลง body ของ Request ที่เป็น JSON ได้
app.use(express.json())

// บริการไฟล์ Static ในโฟลเดอร์ uploads (สำหรับเข้าถึงรูปภาพโปรไฟล์ผู้ใช้งาน)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// เรียกใช้เราเตอร์จัดการระบบสมาชิกและโครงการภายใต้เส้นทาง /auth
app.use('/auth', authRoutes)

// ทำการตั้งค่าและตรวจสอบฐานข้อมูลเบื้องต้นขณะรันเซิร์ฟเวอร์ (แบบ non-blocking)
initializeDatabase().then(() => {
    // เริ่มการทำงานของ Task Scheduler เพื่อตรวจสอบงานเกินกำหนดส่งและแจ้งเตือน Leader
    startTaskScheduler()
}).catch(err => {
    console.error('Database initialization failed, proceeding anyway:', err.message)
    startTaskScheduler()
})

// กำหนด Port และเริ่มต้นการทำงานของ Express Server พร้อม WebSockets
const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'
server.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT} with WebSocket support`)
})