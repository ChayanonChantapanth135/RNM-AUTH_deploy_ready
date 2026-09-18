// กำหนด URL ของ API เซิร์ฟเวอร์หลัก โดยดึงจาก Environment Variable (VITE_API_URL) ที่ระบุในไฟล์ .env 
// และมีค่าเริ่มต้นเป็น http://127.0.0.1:3000 กรณีไม่มีการกำหนดค่า env ไว้
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
