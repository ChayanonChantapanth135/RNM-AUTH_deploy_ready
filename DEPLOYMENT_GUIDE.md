# Deployment Guide: RNM Task Management

### 1. Database: TiDB Cloud (Serverless) - ฟรีตลอดชีพ
- **Platform**: TiDB Cloud (https://tidbcloud.com)
- **Plan**: Serverless Free Tier (5 GB Storage)
- **Region**: AWS Singapore (`ap-southeast-1`)
- **Compatibility**: MySQL Protocol 100%
- **Environment Variables**:
  - `DB_HOST`: Host จาก TiDB Cloud (เช่น `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
  - `DB_PORT`: `4000`
  - `DB_USER`: User จาก TiDB
  - `DB_PASSWORD`: Password จาก TiDB
  - `DB_NAME`: ชื่อฐานข้อมูล
  - `DB_SSL`: `true` *(สำคัญมาก ต้องเปิดเสมอ)*

### 2. Backend: Deploy on Railway / Render
- **Platform**: Railway (Hobby Plan ~$5/month) หรือ Render.com
- **Root Directory**: `server`
- **Environment**: Node.js 20+
- **Recommended Resource Limits**:
  - CPU: `0.5 vCPU`
  - RAM: `512 MB` (0.5 GB) - ประหยัดและเพียงพอสำหรับระบบ
- **Environment Variables**: ดูตัวอย่างใน `server/.env.example`
- **Features**: มี Task Scheduler (Cron) และ WebSockets ในตัว

### 3. Frontend: Deploy on Vercel
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://your-backend.up.railway.app`
- `vercel.json` ถูกตั้งค่าไว้รองรับ Client-side routing เรียบร้อยแล้ว