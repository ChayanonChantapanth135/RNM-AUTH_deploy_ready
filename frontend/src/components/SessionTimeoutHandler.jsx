import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/LanguageContext";
import { signOut, renewToken } from "../lib/auth";

/**
 * คอมโพเนนต์ตรวจสอบและแจ้งเตือนการหมดอายุเซสชันการเข้าสู่ระบบ (SessionTimeoutHandler Component)
 * - รันตัวนับเวลาถอยหลัง 1 วินาทีเพื่อคอยตรวจสอบว่าโทเค็นหมดอายุเมื่อไร
 * - หากเหลือเวลาน้อยกว่า 60 วินาที จะแสดงหน้าต่างแจ้งเตือน (Modal Alert) พร้อมปุ่มต่ออายุหรือออกจากระบบ
 * - ทำการล็อกเอาต์ผู้ใช้อัตโนมัติเมื่อหมดเวลาเพื่อความปลอดภัยสูงสุด
 */
const SessionTimeoutHandler = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    /**
     * ฟังก์ชันตรวจสอบเวลาที่เหลืออยู่ของโทเค็นจาก localStorage
     */
    const checkSession = () => {
      const token = localStorage.getItem("userToken");
      const expiresAtStr = localStorage.getItem("userTokenExpiresAt");

      if (!token || !expiresAtStr) {
        // No active session, make sure modal is closed
        if (showModal) {
          setShowModal(false);
          clearInterval(countdownIntervalRef.current);
        }
        return;
      }

      const expiresAt = Number(expiresAtStr);
      const now = Date.now();
      const timeLeft = expiresAt - now;

      // If already expired, log out immediately
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        handleLogout();
        return;
      }

      // Show warning modal when 60 seconds (60000 ms) or less remain
      if (timeLeft <= 60000) {
        if (!showModal) {
          setShowModal(true);
          const initialSecs = Math.max(0, Math.floor(timeLeft / 1000));
          setSecondsRemaining(initialSecs);
        }
      } else {
        // If renewed or token changed and time left is > 60s, close modal
        if (showModal) {
          setShowModal(false);
        }
      }
    };

    // Run check every 1 second
    const checkInterval = setInterval(checkSession, 1000);

    // Initial check
    checkSession();

    // Listen to storage, auth, visibility, or focus events
    window.addEventListener("authChanged", checkSession);
    window.addEventListener("storage", checkSession);
    window.addEventListener("focus", checkSession);
    document.addEventListener("visibilitychange", checkSession);

    return () => {
      clearInterval(checkInterval);
      clearInterval(countdownIntervalRef.current);
      window.removeEventListener("authChanged", checkSession);
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("focus", checkSession);
      document.removeEventListener("visibilitychange", checkSession);
    };
  }, [showModal]);

  // Modal countdown tick
  useEffect(() => {
    if (showModal) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [showModal]);

  /**
   * ฟังก์ชันดำเนินการล็อกเอาต์เมื่อกดยกเลิกหรือเวลาถอยหลังหมดลง
   */
  const handleLogout = async () => {
    setShowModal(false);
    await signOut();
    navigate("/Home");
  };

  /**
   * ฟังก์ชันขอต่ออายุเซสชัน (Renew Token) ผ่านการยิง API ไปหาฝั่ง Backend
   * - หากการต่ออายุสำเร็จ จะปิด Modal เตือนความจำ
   * - หากล้มเหลว จะส่งต่อไปยังกระบวนการล็อกเอาต์ผู้ใช้
   */
  const handleExtend = async () => {
    const success = await renewToken();
    if (success) {
      setShowModal(false);
    } else {
      // If token renewal failed (e.g. server down or already invalidated), logout
      handleLogout();
    }
  };

  return (
    <Modal
      show={showModal}
      onHide={handleLogout}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="text-center mb-4">
          <span className="fs-1">🚨</span>
          <h5 className="fw-bold mt-2 text-danger">
            {t("sessionTimeoutTitle")}
          </h5>
          <div className="text-muted mt-2 small">
            {t("sessionTimeoutDesc").replace(
              "{seconds}",
              String(secondsRemaining),
            )}
          </div>
        </div>

        {/* Dynamic Countdown Bar */}
        <div
          className="progress mb-4"
          style={{ height: "6px", borderRadius: "10px" }}
        >
          <div
            className={`progress-bar progress-bar-striped progress-bar-animated bg-danger`}
            style={{
              width: `${(secondsRemaining / 60) * 100}%`,
              transition: "width 1s linear",
            }}
          ></div>
        </div>

        <div className="d-flex gap-2 justify-content-center">
          <button
            type="button"
            className="btn btn-light border px-4 py-2 rounded-lg w-50"
            onClick={handleLogout}
          >
            {t("sessionTimeoutExitBtn")}
          </button>
          <button
            type="button"
            className="btn btn-danger px-4 py-2 rounded-lg w-50"
            onClick={handleExtend}
          >
            {t("sessionTimeoutStayBtn")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SessionTimeoutHandler;
