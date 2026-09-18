import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';

/**
 * คอมโพเนนต์ป้องกันหน้าเว็บ (ProtectedRoute Component)
 * - ตรวจสอบสถานะการเข้าสู่ระบบของผู้ใช้งานก่อนอนุญาตให้เข้าถึงเนื้อหา (children)
 * - หากยังไม่ได้เข้าสู่ระบบ (หรือเซสชันหมดอายุ) จะทำการนำทางไปยังหน้า Login (/login) ทันที
 * - แสดง Spinner โหลดดิ้งระหว่างรอตรวจสอบสถานะความถูกต้อง
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isForceReset, setIsForceReset] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    /**
     * ฟังก์ชันตรวจสอบสถานะล็อกอินของผู้ใช้งานเพื่อความปลอดภัยฝั่ง Client
     */
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        setAuthenticated(true);
        setIsForceReset(user.is_force_reset === 1);
        setUserRole(user.role ? user.role.toLowerCase().trim().replace(/\s+/g, "_") : null);
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("authChanged", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#1a1a2e' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isForceReset) {
    return <Navigate to="/reset-password-first-time" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
