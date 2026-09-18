import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Import Bootstrap CSS (ต้องมาก่อน index.css เพื่อให้ index.css override ได้)
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import Bootstrap JS (optional - สำหรับ dropdown, modal, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom CSS (ต้องมาหลัง Bootstrap เพื่อ override ได้)
import './index.css';

// กำหนดค่าคอนฟิกเริ่มต้นให้กับ Axios เพื่อให้เรียกเรียกใช้ API แบบ Relative Path ทั่วทั้งแอปพลิเคชันได้สะดวก
import axios from 'axios';
import { API_URL } from './config';
import { signOut } from './lib/auth';

axios.defaults.baseURL = API_URL;

// Request interceptor: แนบ Token อัตโนมัติใน Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: หากได้รับสถานะ 401 (Token หมดอายุหรือไม่ถูกต้อง) ให้เคลียร์เซสชัน
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      await signOut();
    }
    return Promise.reject(error);
  }
);

// จุดเริ่มต้นการทำงานของแอปพลิเคชันฝั่ง Client (React Entry Point)
// - โหลดไฟล์ CSS หลัก, Bootstrap CSS, Bootstrap Icons และ Bootstrap JS Bundle
// - เรนเดอร์คอมโพเนนต์ App ภายใต้ <StrictMode> ลงใน HTML Element ที่มี ID เป็น 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
