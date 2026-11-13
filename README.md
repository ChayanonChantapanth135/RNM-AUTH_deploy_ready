# Project & Task Management System

เว็บแอปพลิเคชันสำหรับบริหารจัดการโครงการ มอบหมายงาน และติดตามความคืบหน้าของทีมงานแบบเรียลไทม์ พัฒนาด้วย React, Node.js (Express), Socket.io และฐานข้อมูล MySQL / TiDB Cloud

- **Live Demo:** [https://www.chayanonlab.link](https://www.chayanonlab.link)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ความสามารถหลักของระบบ

### 1. การยืนยันตัวตนและความปลอดภัย
- **เข้าสู่ระบบด้วย JWT & bcrypt**: เข้ารหัสรหัสผ่านด้วย `bcrypt` และออก Token อายุ 40 นาที (มีระบบต่ออายุอัตโนมัติ)
- **รีเซ็ตรหัสผ่านผ่าน OTP**: ส่งรหัส OTP 6 หลักไปยังอีเมลผู้ใช้งาน โดยไม่ส่งรหัสผ่าน API Response หรือแสดงใน Log
- **บังคับเปลี่ยนรหัสผ่านครั้งแรก**: ผู้ใช้ที่ถูกสร้างใหม่จะต้องเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก
- **จำกัดอายุบัญชี & Rate Limit**: กำหนดวันเริ่มใช้งาน วันหมดอายุ (อ้างอิงเวลา `Asia/Bangkok`) และจำกัดความถี่ในการล็อกอิน (10 ครั้ง/นาที) รวมถึงการขอ OTP (3 ครั้ง/นาที)

### 2. การจัดการผู้ใช้และสิทธิ์ตามบทบาท (RBAC)
แบ่งสิทธิ์การใช้งานออกเป็น 6 บทบาท ตามสายงาน ได้แก่ `admin`, `manager`, `storyboard`, `animation`, `designer` และ `programmer` โดยผู้ดูแลระบบสามารถกำหนด Team Leader ประจำโครงการ หรือผูกหัวหน้าสายตรงให้สมาชิกแต่ละคนได้

| ความสามารถ | Admin | Project Manager | Team Leader | Member |
| :--- | :---: | :---: | :---: | :---: |
| จัดการบัญชีผู้ใช้ / นำเข้า-ส่งออก Excel | ✅ | ❌ | ❌ | ❌ |
| สร้าง / แก้ไข / ลบ โครงการ | ✅ | ✅ | ❌ | ❌ |
| สร้างงานและมอบหมายงาน | ✅ | ✅ | ✅ (ในโครงการที่ดูแล) | ❌ |
| อัปเดตสถานะงาน | ✅ | ✅ | ✅ (ในโครงการที่ดูแล) | ✅ (งานของตนเอง) |
| แนบไฟล์และแสดงความคิดเห็น | ✅ | ✅ | ✅ | ✅ |
| กระดานงานส่วนตัว & ปฏิทิน | ✅ | ✅ | ✅ | ✅ |
| ดูรายงานสรุปผล (Reports) | ทั้งระบบ | โครงการที่ดูแล | ทีมในโครงการ | สถิติตนเอง |
| ดูประวัติกิจกรรมระบบ (Activity Logs) | ✅ | ❌ | ❌ | ❌ |

- **นำเข้า/ส่งออกผู้ใช้แบบกลุ่ม (Excel / CSV)**: มีหน้าต่างพรีวิวสำหรับตรวจสอบรายการที่เพิ่มใหม่หรืออัปเดตก่อนบันทึกจริง พร้อมสุ่มรหัสผ่านชั่วคราว 6 หลักและจัดส่งอีเมลต้อนรับแบบคิวหน่วงเวลา (600ms) เพื่อลดปัญหาติด Rate Limit ของผู้ให้บริการอีเมล

### 3. การจัดการโครงการและงาน (Projects & Tasks)
- **คำนวณความคืบหน้าและปรับสถานะอัตโนมัติ**: คิดเปอร์เซ็นต์ความคืบหน้าจากสัดส่วนงานที่เสร็จสมบูรณ์ พร้อมปรับสถานะโครงการเป็น `In Progress` เมื่อเริ่มมีงาน และ `Completed` เมื่องานทั้งหมดเสร็จสิ้น
- **มุมมองโครงการ**: สลับดูได้ทั้งแบบตาราง (Table/Grid) และแบบกระดานสถานะ (Board View)
- **รายละเอียดงาน**: แนบไฟล์ได้สูงสุด 25MB ต่อไฟล์ (รองรับ Cloudinary และ fallback ลงโฟลเดอร์เครื่อง), แสดงความคิดเห็นแบบเรียลไทม์ และเก็บประวัติการเปลี่ยนสถานะย้อนหลัง

### 4. งานส่วนตัวและปฏิทิน (Personal Tasks)
- **Personal Kanban Board**: บอร์ดลากวางจัดการงานส่วนตัว 3 สถานะ (`To Do`, `In Progress`, `Completed`) บันทึกลำดับลงฐานข้อมูล
- **FullCalendar**: ลากงานจากถาดงานค้างมาวางบนปฏิทินเพื่อกำหนดวันส่ง หรือลากกลับเพื่อยกเลิกกำหนดการ พร้อมป้ายเตือนสถานะใกล้ครบกำหนดและเกินกำหนด

### 5. การแจ้งเตือนและส่วนติดต่อผู้ใช้
- **แจ้งเตือนแบบเรียลไทม์**: ใช้ `socket.io` อัปเดตสถานะงาน ความคิดเห็น ไฟล์แนบ และการแจ้งเตือนกระดิ่งโดยไม่ต้องรีเฟรชหน้า
- **ตรวจงานเกินกำหนดอัตโนมัติ**: มี Cron Job คอยตรวจงานที่เลยกำหนดส่งและแจ้งเตือนไปยังผู้รับผิดชอบและหัวหน้าทีม
- **รองรับอีเมลหลายช่องทาง**: ใช้ได้ทั้ง Brevo HTTP API, Resend HTTP API และ SMTP (เช่น Gmail)
- **ธีมและภาษา**: รองรับ Dark / Light Mode, ปรับสีหลักได้ 10 โทน และสลับภาษาไทย–อังกฤษ (TH/EN)

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Tailwind CSS v4, FullCalendar, `@hello-pangea/dnd`, Recharts, Axios, Socket.io Client, ExcelJS / XLSX, SweetAlert2
- **Backend**: Node.js 20+, Express 4, Socket.io, `mysql2/promise`, Multer (`multer-storage-cloudinary`), bcrypt, jsonwebtoken, helmet, express-rate-limit, Nodemailer
- **Database**: MySQL 8.0+ / TiDB Cloud Serverless (สร้างตารางและ Index อัตโนมัติผ่าน `server/lib/initDb.js`)
- **Hosting / Storage**: Vercel (Frontend), Railway / Render (Backend), Cloudinary (Files & Avatars)

---

## โครงสร้างโปรเจกต์

```text
RNM AUTH_deploy_ready/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/              # Dashboard, ManageProject, AllTasks, PersonalTask, ManageUser, Reports ฯลฯ
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
├── server/
│   ├── controllers/            # authController.js, notificationController.js
│   ├── lib/                    # db.js, initDb.js, cloudinary.js, socket.js
│   ├── middleware/             # authMiddleware.js
│   ├── routes/                 # authRoutes.js
│   ├── utils/                  # cacheService.js, emailService.js, taskScheduler.js
│   ├── uploads/
│   ├── index.js
│   └── package.json
├── DEPLOYMENT_GUIDE.md
├── package.json
└── README.md
```

---

## การติดตั้งและรันในเครื่อง (Local Development)

### สิ่งที่ต้องเตรียม
- Node.js เวอร์ชัน 20 ขึ้นไป
- MySQL 8.0+ หรือ TiDB Cloud (สร้างฐานข้อมูลเปล่าเตรียมไว้ เช่น `myapp_db`)

### 1. ติดตั้ง Dependencies

```bash
cd server && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. ตั้งค่า Environment Variables

**ฝั่ง Backend (`server/.env`)** — คัดลอกมาจาก `server/.env.example`

| ตัวแปร | ตัวอย่าง | คำอธิบาย |
| :--- | :--- | :--- |
| `PORT` | `3000` | พอร์ตของ Backend |
| `DB_HOST` | `localhost` | Host ของ MySQL / TiDB |
| `DB_USER` | `root` | ชื่อผู้ใช้ฐานข้อมูล |
| `DB_PASSWORD` | `""` | รหัสผ่านฐานข้อมูล |
| `DB_NAME` | `myapp_db` | ชื่อฐานข้อมูล |
| `DB_PORT` | `3306` หรือ `4000` | พอร์ตฐานข้อมูล (TiDB ใช้ `4000`) |
| `DB_SSL` | `true` | เปิดใช้ SSL (จำเป็นสำหรับ TiDB Cloud) |
| `JWT_KEY` | `your_secret_key` | Secret Key สำหรับสร้าง JWT |
| `FRONTEND_URL` | `http://localhost:5173` | URL ของ Frontend สำหรับ CORS |
| `BASE_URL` | `http://localhost:3000` | URL ของ Backend |
| `RESEND_API_KEY` | `re_...` | API Key ของ Resend (กรณีใช้ Resend) |
| `RESEND_FROM` | `support@yourdomain.com` | อีเมลผู้ส่งสำหรับ Resend |
| `EMAIL_USER` | `your_email@gmail.com` | อีเมล SMTP (กรณีใช้ Gmail) |
| `EMAIL_PASS` | `xxxx xxxx xxxx xxxx` | App Password สำหรับ SMTP |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloud Name (ถ้าไม่ใส่จะเก็บลง `server/uploads/`) |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API Secret |

**ฝั่ง Frontend (`frontend/.env`)** — คัดลอกมาจาก `frontend/.env.example`

| ตัวแปร | ตัวอย่าง | คำอธิบาย |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:3000` | URL ของ Backend API |

### 3. สั่งรันโปรเจกต์

รันจากโฟลเดอร์หลัก:

```bash
# รัน Frontend (พอร์ต 5173)
npm run dev:frontend

# รัน Backend (พอร์ต 3000)
npm run dev:server
```

จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

---

## การ Deploy ขึ้น Production

ดูขั้นตอนโดยละเอียดได้ที่ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

- **Frontend (Vercel)**: ตั้ง Root Directory เป็น `frontend`, Framework เป็น `Vite`, Build Command `npm run build`, Output `dist` และตั้งค่า `VITE_API_URL` ชี้ไปยัง URL ของ Backend (มี `vercel.json` รองรับ SPA rewrite แล้ว)
- **Backend (Railway / Render)**: ตั้ง Root Directory เป็น `server`, Build Command `npm install`, Start Command `npm start` และใส่ Environment Variables ตาม `server/.env.example`

---

## รายการ API Endpoints หลัก

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/login` | Public | เข้าสู่ระบบและรับ JWT |
| `POST` | `/auth/refresh` | Public | ต่ออายุ JWT |
| `POST` | `/auth/logout` | Public | ออกจากระบบและบันทึก Log |
| `POST` | `/auth/send-otp` | Public | ส่ง OTP ไปยังอีเมลเพื่อรีเซ็ตรหัสผ่าน |
| `POST` | `/auth/reset-password` | Public | ตั้งรหัสผ่านใหม่ด้วย OTP |
| `POST` | `/auth/reset-password-first-time` | Public | เปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก |
| `POST` | `/auth/change-password` | User | เปลี่ยนรหัสผ่านในหน้า Profile |
| `POST` | `/auth/contact` | Public | ส่งข้อความจากหน้าติดต่อสอบถาม |
| `GET` | `/auth/users` | User | ดึงรายชื่อผู้ใช้ |
| `POST` | `/auth/users` | Admin | สร้างผู้ใช้ใหม่ |
| `PUT` | `/auth/users/:id` | User | แก้ไขข้อมูลผู้ใช้ / เปลี่ยนบทบาท |
| `DELETE` | `/auth/users/:id` | Admin | ลบผู้ใช้ (Soft Delete) |
| `POST` | `/auth/users/:id/restore` | Admin | กู้คืนผู้ใช้ที่ถูกลบ |
| `POST` | `/auth/users/import` | Admin | นำเข้าผู้ใช้จาก Excel/CSV |
| `GET` | `/auth/team-leaders` | User | ดึงรายชื่อผู้ใช้สำหรับแต่งตั้งเป็น Team Leader |
| `GET` | `/auth/projects` | User | ดึงรายการโครงการทั้งหมด |
| `POST` | `/auth/projects` | User | สร้างโครงการใหม่ |
| `PUT` | `/auth/projects/:id` | User | แก้ไขโครงการ |
| `DELETE` | `/auth/projects/:id` | User | ลบโครงการและงานที่เกี่ยวข้อง |
| `POST` | `/auth/tasks` | User | สร้างงานใหม่ในโครงการ |
| `PUT` | `/auth/tasks/:id` | User | แก้ไขรายละเอียดงาน |
| `PUT` | `/auth/tasks/:id/status` | User | อัปเดตสถานะงาน |
| `DELETE` | `/auth/tasks/:id` | User | ลบงาน |
| `GET` | `/auth/tasks/:id/status-history` | User | ดูประวัติการเปลี่ยนสถานะงาน |
| `GET` | `/auth/tasks/:id/comments` | User | ดูความคิดเห็นของงาน |
| `POST` | `/auth/tasks/:id/comments` | User | เพิ่มความคิดเห็นในงาน |
| `GET` | `/auth/tasks/:id/files` | User | ดูรายการไฟล์แนบของงาน |
| `POST` | `/auth/tasks/:id/files` | User | อัปโหลดไฟล์แนบ |
| `GET` | `/auth/personal-tasks` | User | ดึงรายการงานส่วนตัว |
| `POST` | `/auth/personal-tasks` | User | สร้างงานส่วนตัว |
| `PUT` | `/auth/personal-tasks/reorder` | User | อัปเดตสถานะและลำดับบนบอร์ด |
| `PUT` | `/auth/personal-tasks/:id` | User | แก้ไขงานส่วนตัว |
| `DELETE` | `/auth/personal-tasks/:id` | User | ลบงานส่วนตัว |
| `GET` | `/auth/calendar-events` | User | ดึงกำหนดการแสดงบนปฏิทิน |
| `GET` | `/auth/notifications` | User | ดึงรายการแจ้งเตือนของตนเอง |
| `PUT` | `/auth/notifications/read-all` | User | อ่านแจ้งเตือนทั้งหมด |
| `PUT` | `/auth/notifications/:id/read` | User | อ่านแจ้งเตือนรายรายการ |
| `DELETE` | `/auth/notifications/:id` | User | ลบแจ้งเตือน |
| `GET` | `/auth/dashboard-stats` | User | ดึงสถิติสำหรับหน้า Dashboard |
| `GET` | `/auth/activity-logs` | Admin | ดึงประวัติกิจกรรมทั้งหมดในระบบ |

---

## ผู้พัฒนา

- **Website:** [chayanonlab.link](https://www.chayanonlab.link/)
- **GitHub:** [@ChayanonChantapanth135](https://github.com/ChayanonChantapanth135)
- **Repository:** [RNM-AUTH_deploy_ready](https://github.com/ChayanonChantapanth135/RNM-AUTH_deploy_ready)
