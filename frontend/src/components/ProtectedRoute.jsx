import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, syncCurrentUserProfile } from '../lib/auth';

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
    let isMounted = true;
    let hasSynced = false;

    /**
     * ฟังก์ชันตรวจสอบสถานะล็อกอินของผู้ใช้งานเพื่อความปลอดภัยฝั่ง Client
     */
    const checkAuth = async (shouldSyncRole = false) => {
      try {
        let user = await getCurrentUser();
        
        // ถ้ามี allowedRoles และ role ในเครื่องยังไม่ตรง ให้ลอง sync กับเซิร์ฟเวอร์แค่ครั้งเดียว
        if (shouldSyncRole && !hasSynced && user && allowedRoles && allowedRoles.length > 0) {
          const currentLocalRole = user.role ? user.role.toLowerCase().trim().replace(/\s+/g, "_") : null;
          if (!currentLocalRole || !allowedRoles.includes(currentLocalRole)) {
            hasSynced = true;
            const syncedUser = await syncCurrentUserProfile();
            if (syncedUser) {
              user = syncedUser;
            }
          }
        }

        if (!isMounted) return;

        if (user) {
          setAuthenticated(true);
          setIsForceReset(user.is_force_reset === 1);
          setUserRole(user.role ? user.role.toLowerCase().trim().replace(/\s+/g, "_") : null);
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        console.error("ProtectedRoute checkAuth error:", err);
        if (isMounted) setAuthenticated(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // ครั้งแรกที่เปิดหน้า ให้ sync ได้ 1 ครั้ง
    checkAuth(true);

    const onAuthChange = () => {
      // เมื่อเกิด authChanged จากภายนอก ให้อัปเดตสถานะจาก getCurrentUser อย่างเดียว ไม่ sync ซ้ำ
      checkAuth(false);
    };

    window.addEventListener("authChanged", onAuthChange);
    window.addEventListener("storage", onAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("authChanged", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [allowedRoles]);

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
