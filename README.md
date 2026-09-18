# Enterprise Project & Task Management System (RNM AUTH)

ระบบบริหารจัดการโครงการและติดตามภารกิจในทีมแบบครบวงจร ออกแบบด้วยสถาปัตยกรรม **Modern Modular Frontend & High-Performance RESTful Backend** บนระบบการปรับแต่งธีม **Multi-Accent Theme & Solid Contrast Design System** ที่ทันสมัย สบายตา ลื่นไหล และปลอดภัย พร้อมระบบคำนวณความคืบหน้าอัตโนมัติ การจัดการสิทธิ์ผู้ใช้งานตามบทบาท (RBAC) ปฏิทินกำหนดส่งงานแบบสองทิศทาง (Bidirectional Drag & Drop) ระบบ Personal Kanban Board ระบบนำเข้าข้อมูลผู้ใช้พร้อมหน้าต่างพรีวิวก่อนบันทึกจริง (Import Preview Modal) ระบบแคชความเร็วสูง (In-Memory Caching) และระบบแจ้งเตือนงานเกินกำหนดอัตโนมัติผ่านอีเมล

---

## 🚀 ฟีเจอร์หลักของระบบ (Key Features)

### 1. ระบบยืนยันตัวตนและความปลอดภัย (Authentication & Security)
- **JWT & bcrypt Authentication**: ล็อกอินปลอดภัย เข้ารหัสรหัสผ่านด้วย `bcrypt` และออก Session Token ด้วย `jsonwebtoken`
- **OTP Email Verification & Password Reset**: ระบบกู้คืนรหัสผ่านด้วยรหัส OTP 6 หลัก ส่งตรงผ่าน SMTP (`nodemailer`) พร้อม HTML Email Template ภาษาอังกฤษมาตรฐานสากล
- **First-Time Password Change**: บังคับให้ผู้ใช้งานเปลี่ยนรหัสผ่านทันทีเมื่อเข้าสู่ระบบครั้งแรกเพื่อความปลอดภัยสูงสุด
- **User Suspension Control**: ผู้ดูแลระบบสามารถสั่งระงับ (Suspend) หรือเปิดใช้งานบัญชีผู้ใช้ได้ทันที

### 2. การจัดการผู้ใช้และสิทธิ์การเข้าถึง (User & RBAC Management)
- **ระบบสิทธิ์ตามบทบาทหน้าที่ (Role-Based Access Control)**:
  1. **Admin** (`admin`) - สิทธิ์สูงสุด จัดการผู้ใช้งาน โครงการ งานทั้งหมด กิจกรรมระบบ และดูรายงานสถิติระดับบริหาร
  2. **Project Manager** (`manager`) - สร้างและบริหารโครงการ มอบหมาย Team Leader และติดตามงานในความดูแล
  3. **Storyboard** (`storyboard`) - ผู้สร้างสตอรี่บอร์ด วางแผนภาพ และดำเนินงานที่ได้รับมอบหมาย
  4. **Animation** (`animation`) - แอนิเมเตอร์และโมชันดีไซเนอร์ ดำเนินงานด้านการเคลื่อนไหว
  5. **Designer** (`designer`) - กราฟิกและ UI/UX ดีไซเนอร์ ออกแบบชิ้นงานตามที่ได้รับมอบหมาย
  6. **Programmer** (`programmer`) - นักพัฒนาซอฟต์แวร์ ดำเนินงานด้านระบบและเขียนโปรแกรม
  *(หมายเหตุ: ทุกบทบาทสามารถได้รับมอบหมายให้เป็น **Team Leader** ของแต่ละโครงการเพื่อดูแลโครงการและแจกจ่ายงานในทีมได้)*
- **Direct Leader Binding**: สมาชิกสามารถเลือกหัวหน้าสายตรง (Leader) ได้ในหน้าโปรไฟล์
- **Interactive Excel / CSV Import Preview & Full-Field Template**:
  - รองรับการดาวน์โหลดเทมเพลต Excel (`.xlsx`) และ CSV (`.csv`) ที่รองรับฟิลด์ครบถ้วน: **ชื่อ-นามสกุล (fullname)**, **อีเมล (email)**, **เบอร์โทรศัพท์ (phone)**, **บทบาท (role)**, **อีเมลหัวหน้า (leader_email)**, **สถานะ (status)**, **วันเริ่มใช้งาน (start_date)**, **วันหมดอายุ (expire_date)**, และ **รหัสผ่าน (password)**
  - **หน้าต่างพรีวิวตรวจสอบข้อมูลล่วงหน้า (Import Preview Modal)** แสดงสรุปจำนวนรายการทั้งหมด ผู้ใช้ใหม่ที่จะเพิ่ม (Create), ผู้ใช้เดิมที่จะอัปเดต (Update), และแถวที่มีข้อมูลไม่สมบูรณ์
  - ค้นหาและกรองตรวจสอบรายชื่อในตารางพรีวิวก่อนกดยืนยันบันทึกจริงลงฐานข้อมูล
- **User Export**: ส่งออกรายชื่อผู้ใช้ทั้งหมดเป็นไฟล์ Excel พร้อมข้อมูลบทบาท เบอร์โทรศัพท์ อีเมลหัวหน้า สถานะ และวันหมดอายุ
- **Profile Management**: อัปโหลดเปลี่ยนรูปโปรไฟล์ (Multer Storage) แก้ไขเบอร์โทรศัพท์ และเปลี่ยนรหัสผ่าน

### 3. การบริหารโครงการ (Project Management)
- **Smart Progress & Status Automation**:
  - คำนวณเปอร์เซ็นต์ความคืบหน้า (Progress 0-100%) อัตโนมัติจาก Task ที่เสร็จสิ้น
  - **Auto In-Progress**: เปลี่ยนสถานะโครงการเป็น `In Progress` ทันทีที่มีการสร้างงานในโครงการ
  - **Auto Complete**: ปรับสถานะโครงการเป็น `Completed` อัตโนมัติเมื่อ Task ในโครงการเสร็จครบ 100%
- **Team Leader Assignment**: มอบหมายหัวหน้าทีมผู้รับผิดชอบโครงการ พร้อมระบุกำหนดวันส่ง (End Date) และระดับความสำคัญ (Priority)
- **Dual View Modes (Grid & Board View)**: สลับมุมมองแสดงผลโครงการแบบ Grid การ์ด หรือ Board View จัดกลุ่มตามสถานะได้อย่างยืดหยุ่น

### 4. การจัดการงานในโครงการ (Project Tasks)
- **Task Assignment & Priority**: สร้างงาน มอบหมายผู้รับผิดชอบ ระบุประเภทงาน (เช่น งานแปล, งานตัดต่อ) และระดับความสำคัญ (High, Medium, Low)
- **Flexible Localized Date Picker**: ปฏิทินและกล่องเลือกวันที่รองรับรูปแบบ วัน/เดือน/ปี (`DD/MM/YYYY`) ปลอดภัยจากปัญหา Timezone
- **Status History Timeline**: บันทึกประวัติการเปลี่ยนสถานะงานอย่างละเอียด ย้อนดูได้ว่าใครเป็นผู้เปลี่ยนสถานะและเวลาใด
- **Comments & File Attachments**: แสดงความคิดเห็นแบบเรียลไทม์ และอัปโหลดไฟล์แนบประกอบงาน

### 5. ระบบงานส่วนตัว (Personal Tasks - Kanban & Calendar)
- **Kanban Board Drag & Drop**: จัดการงานส่วนตัวด้วยบอร์ดลากวางสถานะ `ต้องทำ (To Do)`, `กำลังทำ (In Progress)`, `เสร็จสิ้น (Completed)` พร้อมบันทึกลำดับ (Position) ลงฐานข้อมูล
- **Interactive Calendar with Bidirectional Tray**: 
  - ลากงานจากถาดงานค้างด้านล่างขึ้นปฏิทินเพื่อกำหนดวันส่ง (`task_date`)
  - ลากงานจากปฏิทินลงถาดด้านล่างเพื่อยกเลิกวันกำหนดส่ง (Unschedule) ได้ทันที
  - ปรับแต่งการเรนเดอร์ด้วย GPU Acceleration (`will-change`) เพื่อความลื่นไหลสูงสุด
- **Dynamic Status Legend & Localization**: แถบแสดงสีสถานะและหัวคอลัมน์ปรับเปลี่ยนภาษาไทย-อังกฤษตามที่เลือกอัตโนมัติ

### 6. ระบบเบื้องหลังและการแจ้งเตือนงานเกินกำหนด (Automated Task Scheduler)
- **Automated Overdue Task Monitor**: ระบบ Cron Scheduler ตรวจสอบงานที่เกินกำหนดส่ง (`due_date < CURDATE()`) อัตโนมัติทุกวัน
- **Leader Alert Email**: ส่งอีเมลแจ้งเตือนถึงหัวหน้าทีม (Team Leader) พร้อมตารางสรุปงานที่เกินกำหนด ดีไซน์เรียบหรูสากล
- **In-App Realtime Notification**: ยิงการแจ้งเตือน Realtime Socket.io และบันทึกลงฐานข้อมูลแจ้งเตือนผู้ใช้ทันที

### 7. ประสิทธิภาพระดับสูง (High-Performance Optimization)
- **Database Composite Indexing**: ปรับแต่งดัชนี Composite Indexes ครอบคลุมทุกตารางสำคัญ (`tasks`, `projects`, `notifications`, `activity_logs`, `personal_tasks`, `users`, `otp_requests`)
- **In-Memory Cache Layer (`cacheService.js`)**: แคชข้อมูลกึ่งคงที่ (Static Roles, System Configs) ลดภาระการ Query ฐานข้อมูลซ้ำซ้อน พร้อมระบบลบแคชตามรูปแบบ (Pattern Invalidation)
- **HTTP Compression**: บีบอัดข้อมูลฝั่งเซิร์ฟเวอร์ด้วย `compression` middleware ลดขนาด Payload สูงสุดถึง 70%
- **Optimistic UI Updates**: อัปเดต UI ทันทีในฝั่ง Frontend ก่อนที่เซิร์ฟเวอร์จะตอบกลับ มอบประสบการณ์ใช้งานที่ไร้รอยต่อ

### 8. ระบบธีม ดีไซน์คอนทราสต์สูง และหลายภาษา (Design System & i18n)
- **Solid Contrast Action Buttons**: ออกแบบปุ่มแอ็กชัน (View, Edit, Delete, Update Status, Save Changes) ด้วยเฉดสีทึบชัดเจน คมชัด ตัวอักษรสีขาวบริสุทธิ์เพื่อความสบายตาและใช้งานง่ายในทุกสภาพแสง
- **Custom Modern Scrollbars**: ปรับแต่งแถบเลื่อน (Scrollbar) สไตล์ Modern Light Slate สำหรับกล่องป๊อปอัป Modal และ Dark Theme Scrollbar สำหรับบอร์ดและคอนเทนเนอร์หลัก
- **Solid Accent Colors Theme**: เลือกระดับสีหลักของระบบได้หลากหลายเฉด เช่น Blue, Purple, Pink, Violet, Indigo, Orange, Teal, Bronze, Mint และ **Gold (#FFD700)**
- **Dark / Light Mode**: รองรับการสลับโหมดมืดและโหมดสว่างได้อย่างสมบูรณ์แบบ
- **Dynamic Bilingual (i18n)**: สลับระหว่าง **ภาษาไทย (TH)** และ **ภาษาอังกฤษ (EN)** ได้ทันที ครอบคลุม Activity Logs, Kanban Columns, Status Legends, Import Preview Modal และทุก Modals ผ่าน `LanguageContext.jsx`

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend**
- **Core**: React 19, Vite, React Router DOM v7
- **Architecture**: Custom Hooks Pattern (`useDashboard`, `usePersonalTasks`, `useMyTasks`, `useProjectManagement`, `useUserManagement`, `useNotifications`, etc.)
- **Styling & UI**: Tailwind CSS v4, Vanilla CSS Design Tokens, GSAP, Framer Motion
- **Libraries & Plugins**: `@fullcalendar/react`, `@hello-pangea/dnd`, `sweetalert2`, `exceljs`, `xlsx`, `axios`, `socket.io-client`, `lucide-react`

### **Backend**
- **Runtime & Framework**: Node.js (v20+), Express.js (ES Modules), WebSockets (`socket.io`)
- **Database Driver**: `mysql2/promise` (Connection Pooling พร้อม `dateStrings: true`)
- **Performance & Cache**: `compression`, Custom In-Memory TTL Cache (`cacheService.js`)
- **Scheduler & Mail**: `node-cron`, `nodemailer`
- **Security & Utilities**: `bcrypt`, `jsonwebtoken`, `multer`

### **Database**
- **RDBMS**: MySQL 8.0+ / MariaDB (ผ่าน XAMPP หรือ Standalone MySQL Server)

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
RNM AUTH/
├── frontend/                   # ส่วนติดต่อผู้ใช้งาน (React + Vite Client)
│   ├── public/                 # รูปภาพและเทมเพลตไฟล์ Excel
│   ├── src/
│   │   ├── assets/             # รูปภาพ ไอคอน โลโก้
│   │   ├── components/         # คอมโพเนนต์ส่วนกลาง (Header, Footer, CustomDateInput, NotificationBell)
│   │   ├── lib/                # Context & Utilities (LanguageContext, ThemeContext, SocketContext, auth, dateUtils)
│   │   ├── pages/              # หน้าหลักและโมดูลคอมโพเนนต์ย่อย
│   │   │   ├── About/          # หน้าเกี่ยวกับเรา (Features, Tech Stack)
│   │   │   ├── Activity/       # หน้าบันทึกประวัติกิจกรรมทั้งหมดในระบบ
│   │   │   ├── AllTasks/       # หน้าภาพรวมงานทั้งหมดสำหรับ Admin & TaskDetailModal
│   │   │   ├── Contract/       # หน้าติดต่อเราและฟอร์มส่งข้อความ
│   │   │   ├── Dashboard/      # หน้าแดชบอร์ดสรุปผล & useDashboard Hook
│   │   │   ├── Home/           # หน้าแรก (Landing Page)
│   │   │   ├── Login/          # หน้าเข้าสู่ระบบ & useLogin Hook
│   │   │   ├── ManageProject/  # หน้าจัดการโครงการ & Sub-components (ProjectCard, ViewTaskModal, Modals)
│   │   │   ├── ManageUser/     # หน้าจัดการผู้ใช้ (ImportPreviewModal, UserTable, UserFormModal, Modals)
│   │   │   ├── MyActivity/     # หน้าประวัติกิจกรรมส่วนบุคคล
│   │   │   ├── MyTasks/        # หน้างานที่ได้รับมอบหมาย & useMyTasks Hook
│   │   │   ├── PersonalTask/   # หน้างานส่วนตัว (Kanban Board & Calendar Tray)
│   │   │   ├── Profile/        # หน้าโปรไฟล์และตั้งค่าบัญชี
│   │   │   ├── Reports/        # หน้ารายงานและสถิติตามบทบาท
│   │   │   ├── ResetPassword/  # หน้ารีเซ็ตรหัสผ่านด้วย OTP
│   │   │   └── ResetPasswordFirstTime/ # หน้าบังคับเปลี่ยนรหัสผ่านครั้งแรก
│   │   ├── App.jsx
│   │   ├── index.css           # Global Theme Tokens & Custom Scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── mysql-init/                 # สคริปต์ Database Schema / Init Database
│
├── server/                     # ส่วนให้บริการ API (Node.js + Express Server)
│   ├── controllers/
│   │   ├── authController.js   # Logic หลัก: จัดการสิทธิ์ โครงการ งาน ผู้ใช้ และฐานข้อมูล
│   │   └── notificationController.js # Logic การจัดการระบบแจ้งเตือน
│   ├── lib/
│   │   ├── db.js               # เชื่อมต่อ MySQL Connection Pool
│   │   ├── initDb.js           # สร้างตารางและ Performance Composite Indexes อัตโนมัติ
│   │   └── socket.js           # จัดการ Realtime WebSockets
│   ├── middleware/
│   │   └── authMiddleware.js   # ตรวจสอบ JWT Token และ Multer Uploads
│   ├── routes/
│   │   └── authRoutes.js       # กำหนด API Endpoints ทั้งหมด
│   ├── utils/
│   │   ├── cacheService.js     # ระบบ In-Memory Cache พร้อม TTL และ DelPattern
│   │   ├── emailService.js     # จัดการส่งอีเมล OTP, มอบหมายงาน และ Overdue Alert
│   │   └── taskScheduler.js    # Cron Scheduler ตรวจสอบงานเกินกำหนดส่งอัตโนมัติ
│   ├── uploads/                # เก็บรูปโปรไฟล์และไฟล์แนบ
│   ├── index.js                # Entry Point เริ่มต้นเซิร์ฟเวอร์, Socket.io และ Compression
│   └── package.json
│
└── README.md
```

---

## ⚡ วิธีการติดตั้งและรันระบบ (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- **Node.js**: เวอร์ชัน 18.0.0 ขึ้นไป (แนะนำ Node.js v20+)
- **MySQL / XAMPP**: ติดตั้งและเปิดใช้งาน MySQL

### 2. การตั้งค่าฐานข้อมูล (Database Setup)
1. เปิด **XAMPP Control Panel** แล้วกด **Start** ที่โมดูล **MySQL**
2. เข้าสู่ **phpMyAdmin** ที่ `http://localhost/phpmyadmin`
3. สร้างฐานข้อมูลใหม่ชื่อ `myapp_db` (หรือตั้งชื่อตามที่ต้องการใน `.env`)
4. ตั้งค่า Environment Variable ในโฟลเดอร์ `server` (สร้างไฟล์ `server/.env`):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=myapp_db
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```
*(เมื่อเริ่มต้นเซิร์ฟเวอร์ ระบบจะสร้างตารางและดัชนี Index ทั้งหมดให้อัตโนมัติ)*

### 3. การเริ่มต้น Backend Server
```bash
# เข้าสู่โฟลเดอร์ server
cd server

# ติดตั้ง Dependencies
npm install

# เริ่มต้นการทำงานเซิร์ฟเวอร์ (รันบน Port 3000)
npm start
```

### 4. การเริ่มต้น Frontend Client
```bash
# เข้าสู่โฟลเดอร์ frontend
cd frontend

# ติดตั้ง Dependencies
npm install

# เริ่มต้น Development Server (รันบน Port 5173)
npm run dev
```

เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

---

## 📑 สรุป API Endpoints ที่สำคัญ

| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | เข้าสู่ระบบ และรับ JWT Token |
| `POST` | `/auth/send-otp` | ส่งรหัส OTP 6 หลักไปยังอีเมล |
| `POST` | `/auth/reset-password` | รีเซ็ตรหัสผ่านใหม่ด้วย OTP |
| `GET` | `/auth/users` | ดึงรายชื่อผู้ใช้ทั้งหมด |
| `POST` | `/auth/users` | เพิ่มผู้ใช้ใหม่พร้อมอัปโหลดรูปภาพ |
| `POST` | `/auth/users/import` | นำเข้าผู้ใช้งานจำนวนมากแบบ Batch (Excel / CSV) |
| `PUT` | `/auth/users/:id` | แก้ไขข้อมูลผู้ใช้งาน / เปลี่ยนสิทธิ์ |
| `DELETE` | `/auth/users/:id` | ลบผู้ใช้ (Soft Delete) |
| `GET` | `/auth/projects` | ดึงรายการโครงการ (พร้อมคำนวณ Progress อัตโนมัติ) |
| `POST` | `/auth/projects` | สร้างโครงการใหม่และมอบหมาย Team Leader |
| `PUT` | `/auth/projects/:id` | อัปเดตข้อมูลโครงการ |
| `DELETE` | `/auth/projects/:id` | ลบโครงการพร้อมงานทั้งหมดในโครงการ |
| `POST` | `/auth/tasks` | สร้างงานใหม่ภายใต้โครงการ |
| `PUT` | `/auth/tasks/:id/status` | เปลี่ยนสถานะงาน (Sync กับสถานะโครงการ) |
| `GET` | `/auth/tasks/:id/timeline` | ดึงประวัติการเปลี่ยนสถานะงาน (Status History Timeline) |
| `GET` | `/auth/tasks/:id/comments` | ดึงรายการความคิดเห็นในงาน |
| `POST` | `/auth/tasks/:id/comments` | เพิ่มความคิดเห็นใหม่ในงาน |
| `POST` | `/auth/tasks/:id/files` | อัปโหลดไฟล์แนบประกอบงาน |
| `GET` | `/auth/personal-tasks` | ดึงรายการงานส่วนตัวของผู้ใช้ |
| `POST` | `/auth/personal-tasks` | สร้างงานส่วนตัวใหม่ |
| `PUT` | `/auth/personal-tasks/reorder` | อัปเดตลำดับและการย้ายสถานะบน Kanban Board |
| `GET` | `/auth/notifications` | ดึงรายการแจ้งเตือนของผู้ใช้ (Auth required) |
| `PUT` | `/auth/notifications/read-all` | ทำเครื่องหมายว่าอ่านแจ้งเตือนแล้วทั้งหมด |
| `PUT` | `/auth/notifications/:id/read` | ทำเครื่องหมายว่าอ่านแจ้งเตือนตาม ID |
| `DELETE` | `/auth/notifications/clear-all` | ลบประวัติการแจ้งเตือนทั้งหมดของผู้ใช้ |
| `GET` | `/auth/dashboard-stats` | ดึงข้อมูลสถิติภาพรวมสำหรับ Dashboard |
| `GET` | `/auth/activity-logs` | ดึงประวัติกิจกรรมของระบบ |

---

## 📄 License & Maintainers
พัฒนาและดูแลระบบโดยทีมงาน **Project Task Management System (RNM AUTH)**
