# Enterprise Project & Task Management System (RNM AUTH)

![Node.js](https://img.shields.io/badge/Node.js-20+-68a063?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479a1?style=for-the-badge&logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Ready-3448c5?style=for-the-badge&logo=cloudinary&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

ระบบบริหารจัดการโครงการและติดตามภารกิจในองค์กรแบบครบวงจร (Production-Ready Enterprise Solution) พัฒนาด้วยสถาปัตยกรรม **Modern Modular Frontend & High-Performance RESTful Backend** ภายใต้ระบบดีไซน์ **Multi-Accent Theme & Solid Contrast Design System** ที่ทันสมัย ลื่นไหล ปลอดภัย พร้อมระบบคำนวณความคืบหน้าโครงการอัตโนมัติ การจัดการสิทธิ์ผู้ใช้งานตามบทบาท (RBAC) ปฏิทินกำหนดส่งงานแบบลากวางสองทิศทาง (Bidirectional Drag & Drop) ระบบ Personal Kanban Board ระบบนำเข้าข้อมูลผู้ใช้พร้อมหน้าต่างพรีวิวตรวจสอบข้อมูลล่วงหน้า (Import Preview Modal) ระบบแคชความเร็วสูง (In-Memory Caching) การจัดเก็บไฟล์ขึ้น Cloudinary และระบบแจ้งเตือนงานเกินกำหนดอัตโนมัติผ่านอีเมลและ In-App WebSockets

---

## 📑 สารบัญ (Table of Contents)

- [ฟีเจอร์เด่นของระบบ (Key Features)](#-ฟีเจอร์เด่นของระบบ-key-features)
- [เทคโนโลยีที่ใช้ (Tech Stack)](#-เทคโนโลยีที่ใช้-tech-stack)
- [โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์-project-structure)
- [การติดตั้งและรันในเครื่อง (Local Development)](#-การติดตั้งและรันในเครื่อง-local-development)
- [การตั้งค่า Environment Variables](#-การตั้งค่า-environment-variables)
- [บัญชีผู้ใช้เริ่มต้นสำหรับทดสอบ (Default Credentials)](#-บัญชีผู้ใช้เริ่มต้นสำหรับทดสอบ-default-credentials)
- [สถาปัตยกรรมความปลอดภัยและประสิทธิภาพ (Security & Performance)](#-สถาปัตยกรรมความปลอดภัยและประสิทธิภาพ-security--performance)
- [การนำขึ้นระบบจริง (Production Deployment)](#-การนำขึ้นระบบจริง-production-deployment)
- [รายการ API Endpoints สำคัญ](#-รายการ-api-endpoints-สำคัญ)

---

## 🚀 ฟีเจอร์เด่นของระบบ (Key Features)

### 1. ระบบยืนยันตัวตนและความปลอดภัย (Authentication & Security)

- **JWT & bcrypt Authentication**: ล็อกอินปลอดภัย เข้ารหัสรหัสผ่านด้วย `bcrypt` และออก Session Token ด้วย `jsonwebtoken` (อายุ Token 40 นาที พร้อมระบบ Auto-Refresh)
- **Zero-Leak OTP Verification**: ระบบกู้คืนรหัสผ่านด้วยรหัส OTP 6 หลัก ส่งตรงผ่าน Email Service ปลอดภัย ไม่มีการส่งรหัส OTP หลุดใน API Response หรือ Server Log
- **First-Time Password Change**: บังคับให้ผู้ใช้งานเปลี่ยนรหัสผ่านทันทีเมื่อเข้าสู่ระบบครั้งแรกเพื่อความปลอดภัยสูงสุด
- **User Suspension & Timezone-Aware Validity**: รองรับการระงับบัญชี (Suspend) และกำหนดวันเริ่มใช้งาน (Start Date) รวมถึงวันหมดอายุ (Expire Date) โดยคำนวณตาม Timezone ประเทศไทย (`Asia/Bangkok`, UTC+7) อย่างเที่ยงตรง
- **Brute-Force Protection**: ติดตั้ง Rate Limiting ดักจับการพยายามล็อกอินซ้ำ (`loginLimiter`: 10 ครั้ง/นาที) และการขอรหัส OTP (`otpLimiter`: 3 ครั้ง/นาที)
- **Security Headers & CORS**: ป้องกันช่องโหว่เว็บด้วย `helmet` และกำหนดค่า CORS ยืดหยุ่น รองรับทั้ง Vercel, Localhost และ Custom Domain

### 2. การจัดการผู้ใช้และสิทธิ์การเข้าถึง (User & RBAC Management)

- **ระบบสิทธิ์ตามบทบาทหน้าที่ (Role-Based Access Control - 6 บทบาท)**:
  1. **Admin** (`admin`) - สิทธิ์สูงสุด จัดการผู้ใช้งาน โครงการ งานทั้งหมด กิจกรรมระบบ และดูรายงานสถิติระดับบริหาร
  2. **Project Manager** (`manager`) - สร้างและบริหารโครงการ มอบหมาย Team Leader และติดตามงานในความดูแล
  3. **Storyboard** (`storyboard`) - วางแผนสตอรี่บอร์ด บท และดำเนินงานที่ได้รับมอบหมาย
  4. **Animation** (`animation`) - แอนิเมเตอร์และโมชันดีไซเนอร์ ดำเนินงานด้านภาพเคลื่อนไหว
  5. **Designer** (`designer`) - กราฟิกและ UI/UX ดีไซเนอร์ ออกแบบสื่อและชิ้นงาน
  6. **Programmer** (`programmer`) - นักพัฒนาซอฟต์แวร์ ดำเนินงานด้านระบบและโค้ด
     _(ทุกบทบาทสามารถได้รับแต่งตั้งเป็น **Team Leader** ในแต่ละโครงการเพื่อกำกับดูแลงานในทีมได้)_
- **Direct Leader Binding**: สมาชิกสามารถเลือกหัวหน้าสายตรง (Leader) ได้ในหน้าโปรไฟล์เพื่อการส่งต่อและอนุมัติงาน
- **Interactive Excel / CSV Import with Preview**:
  - รองรับการดาวน์โหลดเทมเพลตและนำเข้าไฟล์ `.xlsx` และ `.csv`
  - มี **หน้าต่างพรีวิวตรวจสอบข้อมูลล่วงหน้า (Import Preview Modal)** แสดงจำนวนผู้ใช้ที่จะเพิ่มใหม่ (Create), อัปเดตข้อมูลเดิม (Update), และแจ้งเตือนข้อมูลที่ไม่สมบูรณ์ก่อนกดยืนยันบันทึกจริง
- **User Export**: ส่งออกรายชื่อผู้ใช้ทั้งหมดเป็นไฟล์ Excel ครบถ้วนทุกฟิลด์
- **Avatar & Profile Management**: อัปโหลดเปลี่ยนรูปโปรไฟล์ รองรับทั้งบันทึกลง **Cloudinary** หรือ Local Disk พร้อมระบบลบรูปเดิมอัตโนมัติ

### 3. การบริหารโครงการ (Project Management)

- **Smart Progress & Status Automation**:
  - คำนวณเปอร์เซ็นต์ความคืบหน้า (Progress 0-100%) อัตโนมัติจากสัดส่วนของงานที่เสร็จสิ้น
  - **Auto In-Progress**: ปรับสถานะโครงการเป็น `In Progress` ทันทีที่มีการสร้างงานในโครงการ
  - **Auto Complete**: ปรับสถานะโครงการเป็น `Completed` อัตโนมัติเมื่อทุกงานในโครงการเสร็จสมบูรณ์
- **Team Leader Assignment**: มอบหมายหัวหน้าทีมผู้รับผิดชอบโครงการ พร้อมกำหนดวันส่ง (End Date) และระดับความสำคัญ (Priority)
- **Dual View Modes**: สลับมุมมองแสดงผลโครงการได้ทั้งแบบ **Grid Cards** และ **Kanban Board View** จัดกลุ่มตามสถานะ

### 4. การจัดการงานในโครงการ (Project Tasks)

- **Task Assignment & Priority**: สร้างงาน มอบหมายผู้รับผิดชอบ ระบุประเภทงาน และระดับความสำคัญ (`High`, `Medium`, `Low`)
- **Status History Timeline**: บันทึกประวัติการเปลี่ยนสถานะงานอย่างละเอียด ย้อนดูได้ว่าใครเป็นผู้เปลี่ยนสถานะและเวลาใด
- **Task Comments & Attachments**: แสดงความคิดเห็นแบบ Real-time และอัปโหลดไฟล์แนบเข้างาน (รองรับ Cloudinary Storage และไฟล์แนบขนาดสูงสุด 25MB) พร้อม Global Error Handling คืนค่า JSON เสมอ

### 5. ระบบงานส่วนตัว (Personal Tasks - Kanban & Calendar)

- **Personal Kanban Board**: จัดการงานส่วนตัวด้วยบอร์ดลากวางสถานะ `ต้องทำ (To Do)`, `กำลังทำ (In Progress)`, `เสร็จสิ้น (Completed)` บันทึกลำดับตำแหน่ง (Position) ลงฐานข้อมูลอัตโนมัติ
- **Interactive FullCalendar with Bidirectional Tray**:
  - ลากงานจากถาดงานค้างขึ้นปฏิทินเพื่อกำหนดวันส่ง (`task_date`)
  - ลากงานจากปฏิทินลงถาดเพื่อยกเลิกวันส่ง (Unschedule) ได้สองทิศทาง
  - มีป้ายแจ้งเตือนสถานะวันส่ง: ⚠️ **เกินกำหนด (Overdue)**, ⏰ **ใกล้ครบกำหนด (Due Soon)**, 📅 **ปกติ** ปลอดภัยจากปัญหา Timezone Shift ด้วย Local Date Parsing

### 6. ระบบแจ้งเตือน & ระบบเบื้องหลัง (Real-time Notifications & Scheduler)

- **Real-time WebSockets (`socket.io`)**: อัปเดตสถานะงาน, คอมเมนต์ใหม่, ไฟล์แนบใหม่ และแจ้งเตือนกระดิ่งแบบ Real-time ทันทีโดยไม่ต้องกดรีเฟรชหน้าจอ
- **Automated Overdue Task Monitor**: ระบบ Cron Scheduler ตรวจสอบงานเกินกำหนดส่งอัตโนมัติ และส่งอีเมลแจ้งเตือนไปยัง Team Leader
- **Multi-Provider Email Service**: รองรับการส่งอีเมล 3 ช่องทาง:
  1. **Brevo HTTP API** (แนะนำสำหรับ Cloud Hosting เช่น Railway/Render - ฟรี 300 ฉบับ/วัน ไม่ต้องเปิดพอร์ต SMTP)
  2. **Resend HTTP API** (ส่งผ่าน HTTPS Port 443 ปลอดภัยจากปัญหาการบล็อกพอร์ต SMTP)
  3. **Standard SMTP** (เช่น Gmail App Password)

### 7. ระบบธีม ดีไซน์คอนทราสต์ และสองภาษา (Design System & i18n)

- **Theme Modes**: รองรับทั้ง **โหมดมืด (Dark Mode)** และ **โหมดสว่าง (Light Mode)**
- **Solid Accent Colors**: ปรับแต่งสีไฮไลต์ของระบบได้ 10 โทนสี (Blue, Purple, Pink, Violet, Indigo, Orange, Teal, Bronze, Mint, Gold)
- **Bilingual Support (i18n)**: รองรับการสลับระหว่าง **ภาษาไทย (TH)** และ **ภาษาอังกฤษ (EN)** ได้ทันที ครอบคลุมทุกหน้าและตารางสถิติ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**

- **Core**: React 19, Vite, React Router DOM v7
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System Tokens
- **Icons & Animation**: Bootstrap Icons, Ionicons, Framer Motion, GSAP
- **Components & Libraries**: `@fullcalendar/react`, `@hello-pangea/dnd`, `sweetalert2`, `exceljs`, `xlsx`, `axios`, `socket.io-client`, `recharts`

### **Backend**

- **Runtime**: Node.js (v20+), Express.js (ES Modules)
- **Real-time**: Socket.io
- **Database Driver**: `mysql2/promise` (Connection Pooling พร้อม `dateStrings: true`)
- **Cloud Storage**: Cloudinary (`multer-storage-cloudinary`) สำหรับรูปโปรไฟล์และไฟล์แนบ
- **Email Service**: Brevo HTTP API, Resend HTTP API, Nodemailer
- **Security & Performance**: `helmet`, `express-rate-limit`, `compression`, `bcrypt`, `jsonwebtoken`, `multer`

### **Database**

- **RDBMS**: MySQL 8.0+ / MariaDB / Cloud MySQL (TiDB Cloud, Railway, Aiven, Supabase)
- **Database Migration**: ตรวจสอบและสร้างตาราง 13 ตาราง พร้อม Performance Composite Indexes อัตโนมัติใน [server/lib/initDb.js](server/lib/initDb.js) รองรับทั้ง Database เดี่ยวและ Railway URL

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
RNM AUTH/
├── frontend/                   # Client-side Application (React 19 + Vite)
│   ├── public/                 # Favicons, Web Manifest, Assets
│   ├── src/
│   │   ├── assets/             # รูปภาพ โลโก้แบรนด์ (LogoB, LogoW)
│   │   ├── components/         # คอมโพเนนต์ส่วนกลาง (Header, Footer, NotificationBell, Modals)
│   │   ├── lib/                # Contexts & Utilities (LanguageContext, ThemeContext, auth, dateUtils)
│   │   ├── pages/              # หน้าการทำงานหลัก
│   │   │   ├── About/          # หน้าเกี่ยวกับระบบ
│   │   │   ├── Activity/       # หน้าประวัติกิจกรรมระบบทั้งหมด (Admin)
│   │   │   ├── AllTasks/       # หน้าภาพรวมงานทั้งหมดในระบบ
│   │   │   ├── Contract/       # หน้าฟอร์มติดต่อสอบถาม
│   │   │   ├── Dashboard/      # หน้าแดชบอร์ดสรุปผลสถิติและกราฟ
│   │   │   ├── Home/           # หน้า Landing Page
│   │   │   ├── Login/          # หน้าเข้าสู่ระบบ
│   │   │   ├── ManageProject/  # หน้าบริหารโครงการ (Grid & Kanban View)
│   │   │   ├── ManageUser/     # หน้าจัดการผู้ใช้ & Import Preview Modal
│   │   │   ├── MyActivity/     # หน้าประวัติกิจกรรมส่วนบุคคล
│   │   │   ├── MyTasks/        # หน้างานที่ตนเองรับผิดชอบ
│   │   │   ├── PersonalTask/   # หน้างานส่วนตัว (Kanban & FullCalendar Tray)
│   │   │   ├── Profile/        # หน้าโปรไฟล์และการตั้งค่า
│   │   │   ├── Reports/        # หน้ารายงานสถิติตามระดับสิทธิ์ (Admin, Manager, Leader, User)
│   │   │   ├── ResetPassword/  # หน้ารีเซ็ตรหัสผ่านด้วย OTP
│   │   │   └── ResetPasswordFirstTime/ # หน้าบังคับเปลี่ยนรหัสผ่านครั้งแรก
│   │   ├── App.jsx             # จัดการเส้นทาง Routing ทั้งหมด
│   │   ├── config.js           # กำหนด Base API URL (VITE_API_URL)
│   │   ├── index.css           # Global Design Tokens & Styles
│   │   └── main.jsx            # React Entry Point & Axios Interceptors
│   ├── .env.example            # ตัวอย่างค่าตัวแปรสภาพแวดล้อม Frontend
│   ├── index.html
│   ├── vercel.json             # Vercel Client-side Routing Rewrite
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend RESTful API & WebSocket Server
│   ├── controllers/
│   │   ├── authController.js   # ควบคุม Logic หลัก (Auth, Projects, Tasks, Users, OTP)
│   │   └── notificationController.js # ควบคุมระบบแจ้งเตือน In-App
│   ├── lib/
│   │   ├── cloudinary.js       # จัดการ Cloud Storage สำหรับไฟล์แนบและ Avatar
│   │   ├── db.js               # เชื่อมต่อ MySQL Connection Pool
│   │   ├── initDb.js           # Schema Auto-Setup, Default Roles, Admin Seed & Indexes
│   │   └── socket.js           # จัดการ Realtime WebSockets Push Event
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT Verification, Rate Limiters, Multer Upload
│   ├── routes/
│   │   └── authRoutes.js       # เส้นทาง API Endpoints ทั้งหมด
│   ├── utils/
│   │   ├── cacheService.js     # In-Memory Cache ช่วยลดภาระ Query
│   │   ├── emailService.js     # ส่งอีเมลผ่าน Brevo, Resend หรือ SMTP
│   │   └── taskScheduler.js    # Cron Job ตรวจสอบงานเกินกำหนดส่งอัตโนมัติ
│   ├── uploads/                # Local Uploads Storage (สร้างอัตโนมัติเมื่อรัน)
│   ├── .env.example            # ตัวอย่างค่าตัวแปรสภาพแวดล้อม Backend
│   ├── index.js                # Server Entry Point, Helmet, Compression & Error Handler
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md         # คู่มือแนะนำการ Deploy บน Vercel + Render / Railway
├── package.json                # Root Workspace Scripts
└── README.md                   # เอกสารประกอบโปรเจกต์
```

---

## ⚡ การติดตั้งและรันในเครื่อง (Local Development)

### 1. ความต้องการของระบบ (Prerequisites)

- **Node.js**: เวอร์ชัน 20.0.0 ขึ้นไป
- **MySQL Database**: เช่น MySQL 8.0+ บน XAMPP หรือ Standalone MySQL Server (สร้าง Database เปล่า เช่น `myapp_db`)

### 2. การติดตั้ง Dependencies

คุณสามารถติดตั้ง dependencies ได้โดยตรงผ่าน terminal:

```bash
# ติดตั้ง Backend Dependencies
cd server && npm install && cd ..

# ติดตั้ง Frontend Dependencies
cd frontend && npm install && cd ..
```

### 3. การรันระบบ (Run Application)

สามารถสั่งรันจาก Root Directory ได้สะดวก:

```bash
# รัน Frontend Development Server (พอร์ต 5173)
npm run dev:frontend

# รัน Backend Development Server (พอร์ต 3000 พร้อม nodemon)
npm run dev:server
```

_(หรือเข้าโฟลเดอร์ `server` แล้วสั่ง `npm run dev` และเข้าโฟลเดอร์ `frontend` สั่ง `npm run dev`)_

เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

---

## ⚙️ การตั้งค่า Environment Variables

### 1. ฝั่ง Backend (`server/.env`)

สร้างไฟล์ `server/.env` โดยคัดลอกตัวอย่างจาก `server/.env.example`:

| ตัวแปร                  | ตัวอย่างค่า              | คำอธิบาย                                     |
| :---------------------- | :----------------------- | :------------------------------------------- |
| `PORT`                  | `3000`                   | พอร์ตของ Backend Server                      |
| `DB_HOST`               | `localhost`              | ที่อยู่ของฐานข้อมูล MySQL                    |
| `DB_USER`               | `root`                   | ชื่อผู้ใช้ MySQL                             |
| `DB_PASSWORD`           | `""`                     | รหัสผ่าน MySQL                               |
| `DB_NAME`               | `myapp_db`               | ชื่อฐานข้อมูล (สร้างเปล่าไว้ใน MySQL)        |
| `DB_PORT`               | `3306`                   | พอร์ต MySQL                                  |
| `JWT_KEY`               | `random_secret_string`   | คีย์เข้ารหัส JWT Session Token               |
| `FRONTEND_URL`          | `http://localhost:5173`  | โดเมนของ Frontend (สำหรับ CORS)              |
| `BASE_URL`              | `http://localhost:3000`  | โดเมนของ Backend Server                      |
| `RESEND_API_KEY`        | `re_...`                 | API Key จาก Resend                           |
| `RESEND_FROM`           | `support@yourdomain.com` | อีเมลผู้ส่งผ่าน Resend                       |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name`        | Cloudinary Name สำหรับบันทึกไฟล์ถาวรบนคลาวด์ |
| `CLOUDINARY_API_KEY`    | `your_api_key`           | Cloudinary API Key                           |
| `CLOUDINARY_API_SECRET` | `your_api_secret`        | Cloudinary API Secret                        |

### 2. ฝั่ง Frontend (`frontend/.env`)

สร้างไฟล์ `frontend/.env` โดยคัดลอกตัวอย่างจาก `frontend/.env.example`:

| ตัวแปร         | ตัวอย่างค่า             | คำอธิบาย                                                                            |
| :------------- | :---------------------- | :---------------------------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | ที่อยู่ของ Backend API (เมื่อขึ้น Production ให้เปลี่ยนเป็น URL ของ Render/Railway) |

---

## 🔑 บัญชีผู้ใช้เริ่มต้นสำหรับทดสอบ (Default Credentials)

เมื่อรัน Backend ครั้งแรก ระบบจะสร้างบทบาทเริ่มต้นและบัญชีผู้ดูแลระบบให้อัตโนมัติ:

- **Email**: `admin@example.com`
- **Password**: `Admin@1234`
- **Role**: `admin` (ผู้ดูแลระบบสูงสุด)

> [!NOTE]
> **ระบบรักษาความปลอดภัยของรหัสผ่านแอดมิน**: เมื่อแอดมินเปลี่ยนรหัสผ่านใหม่ในระบบ รหัสผ่านใหม่จะถูกบันทึกไว้อย่างถาวร และระบบจะไม่รีเซ็ตกลับเป็นรหัสผ่านเริ่มต้นเมื่อ Server รีสตาร์ต

---

## 🛡️ สถาปัตยกรรมความปลอดภัยและประสิทธิภาพ (Security & Performance)

1. **Zero-Leak OTP Architecture**:
   - การเรียกใช้ `POST /auth/send-otp` จะไม่ส่งรหัส OTP กลับไปใน JSON Response และไม่แสดงรหัส OTP เป็น Plain Text บน Server Console Log
2. **Persistent Cloud Storage Fallback**:
   - เมื่อตั้งค่า Cloudinary ครบถ้วน ระบบจะอัปโหลดรูปโปรไฟล์และไฟล์แนบขึ้น Cloudinary ทันที
   - หากยังไม่ได้ตั้งค่า Cloudinary ระบบจะบันทึกลงโฟลเดอร์ `server/uploads/` ให้อัตโนมัติโดยไม่เกิดข้อผิดพลาดโฟลเดอร์สูญหาย (`ENOENT`)
3. **Robust Multer Error Handling**:
   - เมื่ออัปโหลดไฟล์ที่มีขนาดเกินโควตา (25MB) หรือประเภทไฟล์ไม่ถูกต้อง Express Error Handling Middleware จะตอบกลับเป็น JSON Format (`400 Bad Request`) แทนการแสดง HTML Error Page
4. **Timezone Accuracy (`Asia/Bangkok`)**:
   - การตรวจสอบวันเริ่มงานและวันหมดอายุของบัญชีผู้ใช้จะคำนวณตามเวลาท้องถิ่นประเทศไทยอย่างแม่นยำ ป้องกันปัญหาผู้ใช้เข้าใช้งานไม่ได้ก่อนเวลาอันควร
5. **In-Memory Caching (`cacheService`)**:
   - เพิ่มประสิทธิภาพการตอบสนองของระบบด้วย In-Memory Cache ในส่วนของ Users, Projects, Tasks และ Personal Tasks พร้อมระบบ Invalidate Cache อัตโนมัติเมื่อเกิดการแก้ไขข้อมูล

---

## 🌐 การนำขึ้นระบบจริง (Production Deployment)

ดูคำแนะนำเพิ่มเติมได้ที่ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### 1. Frontend (Deploy บน Vercel)

- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://your-backend.onrender.com`
- ระบบมีไฟล์ [frontend/vercel.json](frontend/vercel.json) ตั้งค่า Client-side rewrite ไว้เรียบร้อยแล้ว รองรับการกด Refresh ทุกหน้าโดยไม่ติดปัญหา 404

### 2. Backend (Deploy บน Render หรือ Railway)

- **Root Directory**: `server`
- **Environment**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start` (รันคำสั่ง `node index.js`)
- **Environment Variables**: ตั้งค่าตามตารางใน [server/.env.example](server/.env.example)

---

## 📑 รายการ API Endpoints สำคัญ

| Method   | Endpoint                          | สิทธิ์การเข้าถึง (Auth) | คำอธิบาย                                              |
| :------- | :-------------------------------- | :---------------------: | :---------------------------------------------------- |
| `POST`   | `/auth/login`                     |  Public (Rate Limited)  | เข้าสู่ระบบ และรับ JWT Session Token                  |
| `POST`   | `/auth/refresh`                   |         Public          | ต่ออายุ JWT Token เมื่อใกล้หมดอายุ                    |
| `POST`   | `/auth/logout`                    |         Public          | ออกจากระบบ และบันทึกประวัติ Logout                    |
| `POST`   | `/auth/send-otp`                  |  Public (Rate Limited)  | ส่งรหัส OTP ไปยังอีเมลเพื่อกู้คืนรหัสผ่าน (Zero-Leak) |
| `POST`   | `/auth/reset-password`            |         Public          | ตั้งรหัสผ่านใหม่ด้วยรหัส OTP                          |
| `POST`   | `/auth/reset-password-first-time` |         Public          | บังคับเปลี่ยนรหัสผ่านเมื่อเข้าใช้งานครั้งแรก          |
| `GET`    | `/auth/users`                     |     Token Required      | ดึงรายชื่อผู้ใช้งานทั้งหมด (รองรับ Cache)             |
| `POST`   | `/auth/users`                     | Token Required (Admin)  | สร้างผู้ใช้งานใหม่ พร้อมอัปโหลด Avatar                |
| `PUT`    | `/auth/users/:id`                 |     Token Required      | แก้ไขข้อมูลผู้ใช้ / เปลี่ยนบทบาท                      |
| `DELETE` | `/auth/users/:id`                 | Token Required (Admin)  | ลบผู้ใช้แบบ Soft Delete                               |
| `POST`   | `/auth/users/import`              | Token Required (Admin)  | นำเข้าผู้ใช้งานแบบ Batch จาก Excel/CSV                |
| `GET`    | `/auth/projects`                  |     Token Required      | ดึงรายการโครงการทั้งหมด พร้อม Progress คำนวณอัตโนมัติ |
| `POST`   | `/auth/projects`                  |     Token Required      | สร้างโครงการใหม่และมอบหมาย Team Leader                |
| `PUT`    | `/auth/projects/:id`              |     Token Required      | แก้ไขข้อมูลโครงการ                                    |
| `DELETE` | `/auth/projects/:id`              |     Token Required      | ลบโครงการพร้อมงานทั้งหมด                              |
| `POST`   | `/auth/tasks`                     |     Token Required      | สร้างงานใหม่ภายใต้โครงการ                             |
| `PUT`    | `/auth/tasks/:id/status`          |     Token Required      | อัปเดตสถานะงาน (Sync เรียลไทม์ผ่าน WebSockets)        |
| `GET`    | `/auth/tasks/:id/status-history`  |     Token Required      | ดึงประวัติ Timeline การเปลี่ยนสถานะงาน                |
| `GET`    | `/auth/tasks/:id/comments`        |     Token Required      | ดึงรายการความคิดเห็นในงาน                             |
| `POST`   | `/auth/tasks/:id/comments`        |     Token Required      | ส่งความคิดเห็นใหม่ในงาน                               |
| `GET`    | `/auth/tasks/:id/files`           |     Token Required      | ดึงรายการไฟล์แนบของงาน                                |
| `POST`   | `/auth/tasks/:id/files`           |     Token Required      | อัปโหลดไฟล์แนบเข้าสู่งาน (รองรับ Cloudinary)          |
| `GET`    | `/auth/personal-tasks`            |     Token Required      | ดึงรายการงานส่วนตัวของผู้ใช้งาน                       |
| `POST`   | `/auth/personal-tasks`            |     Token Required      | สร้างงานส่วนตัวใหม่                                   |
| `PUT`    | `/auth/personal-tasks/reorder`    |     Token Required      | อัปเดตลำดับและสถานะการลากวางบน Kanban                 |
| `DELETE` | `/auth/personal-tasks/:id`        |     Token Required      | ลบงานส่วนตัวออกจากบอร์ดและปฏิทิน                      |
| `GET`    | `/auth/notifications`             |     Token Required      | ดึงรายการแจ้งเตือน In-App ของตนเอง                    |
| `PUT`    | `/auth/notifications/read-all`    |     Token Required      | ทำเครื่องหมายว่าอ่านแจ้งเตือนแล้วทั้งหมด              |
| `GET`    | `/auth/dashboard-stats`           |     Token Required      | ดึงข้อมูลสถิติและผลรวมสำหรับแดชบอร์ด                  |
| `GET`    | `/auth/activity-logs`             |     Token Required      | ดึงบันทึกประวัติกิจกรรมในระบบ                         |

---

## 📄 License & Maintainers

พัฒนาและดูแลระบบโดยทีมงาน **Enterprise Project & Task Management System (RNM AUTH)**
