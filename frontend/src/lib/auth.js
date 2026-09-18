// lib/auth.js
import { API_URL } from '../config';

/**
 * ดึงข้อมูลผู้ใช้งานปัจจุบันที่ล็อกอินอยู่
 * - ดึง Token, ข้อมูลผู้ใช้ และเวลาหมดอายุจาก localStorage
 * - ตรวจสอบว่า Token หมดอายุหรือไม่ ถ้าหมดอายุจะทำการเรียก signOut()
 * @returns {Promise<Object|null>} ออบเจกต์ข้อมูลผู้ใช้ หรือ null หากไม่ได้ล็อกอิน/หมดอายุ
 */
export const getCurrentUser = async () => {
    // ตัวอย่าง: ดึงจาก localStorage หรือ API
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const expiresAt = Number(localStorage.getItem('userTokenExpiresAt'));
    
    if (!userToken || !userData) {
        return null;
    }

    if (expiresAt && Date.now() >= expiresAt) {
        await signOut();
        return null;
    }

    try {
        // return parsed user data
        return JSON.parse(userData);
        // ตัวอย่าง return: { id: 1, name: 'John', email: 'john@example.com', role: 'user', profilePic: '...' }
    } catch (error) {
        return null;
    }
};

/**
 * บันทึกข้อมูลการล็อกอินลงใน localStorage และแจ้งเตือนหน้าระบบว่าสถานะการเข้าสู่ระบบเปลี่ยนไป
 * @param {Object} params - ข้อมูล Token, ข้อมูลผู้ใช้งาน และวินาทีก่อนหมดอายุ
 */
export const signIn = async ({ token, user, expiresInSeconds = 2400 }) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userTokenExpiresAt', String(Date.now() + expiresInSeconds * 1000));
    window.dispatchEvent(new Event('authChanged'));
};

/**
 * ส่งคำขอไปยัง Backend เพื่อยืดอายุหรือต่ออายุ Token (Refresh Token) 
 * @returns {Promise<boolean>} สำเร็จ (true) หรือล้มเหลว (false)
 */
export const renewToken = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    try {
        const axios = (await import('axios')).default;
        const response = await axios.post(`${API_URL}/auth/refresh`, { token });
        const { token: newToken, user, expiresInSeconds } = response.data;
        await signIn({ token: newToken, user, expiresInSeconds });
        return true;
    } catch (e) {
        console.error("Token renewal failed:", e);
        return false;
    }
};

let isLoggingOut = false;

/**
 * ออกจากระบบ (Sign Out)
 * - ส่งคำขอแจ้งฝั่งเซิร์ฟเวอร์เพื่อเก็บประวัติกิจกรรมการ Logout
 * - ล้างค่า Token และข้อมูลผู้ใช้ทั้งหมดออกจาก localStorage
 * - แจ้งเตือนแอปพลิเคชันให้ทำการเปลี่ยนเส้นทางหรือเปลี่ยนหน้าการแสดงผล
 */
export const signOut = async () => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    try {
        const userData = localStorage.getItem('userData');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userTokenExpiresAt');

        if (userData) {
            const user = JSON.parse(userData);
            const axios = (await import('axios')).default;
            await axios.post(`${API_URL}/auth/logout`, { userId: user.id });
        }
    } catch (e) {
        console.error("Logout log failed:", e);
    } finally {
        isLoggingOut = false;
        window.dispatchEvent(new Event('authChanged'));
    }
};
