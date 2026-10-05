import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useResetPassword = (language, t) => {
  const [values, setValues] = useState({
    email: "",
    otpCode: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [otpCooldown, setOtpCooldown] = useState(() => {
    const savedExpiry = localStorage.getItem("otp_expiry");
    if (savedExpiry) {
      const remaining = Math.ceil((parseInt(savedExpiry, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("otp_expiry");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpCooldown]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!values.email) {
      setError(t("otpEnterEmailFirst") || (language === "th" ? "กรุณากรอกอีเมลก่อนส่ง OTP" : "Please enter your email first."));
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post("/auth/send-otp", {
        email: values.email,
      });

      const expiryTime = Date.now() + 180 * 1000;
      localStorage.setItem("otp_expiry", expiryTime.toString());
      setOtpCooldown(180);

      setMessage(t("otpSentSuccess") || (language === "th" ? "ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว" : "OTP sent to your email"));
    } catch (err) {
      const errData = err.response?.data;
      const rawMsg = (errData?.message || "").toLowerCase();
      if (err.response?.status === 404 || rawMsg.includes("not found") || rawMsg.includes("ไม่พบ")) {
        setError(t("userNotFound") || (language === "th" ? "ไม่พบอีเมลผู้ใช้ในระบบ" : "User not found"));
      } else {
        setError(t("otpSendFailed") || (language === "th" ? "ไม่สามารถส่งรหัส OTP ได้" : "Failed to send OTP."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !values.email ||
      !values.otpCode ||
      !values.password ||
      !values.confirmPassword
    ) {
      setError(t("fillAllFields"));
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/reset-password", {
        email: values.email,
        otpCode: values.otpCode,
        password: values.password,
      });

      setMessage(t("resetSuccess") || response.data.message || (language === "th" ? "รีเซ็ตรหัสผ่านสำเร็จ!" : "Password reset successfully!"));
      setValues({ email: "", otpCode: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      const errData = err.response?.data;
      const rawMsg = (errData?.message || "").toLowerCase();

      if (
        errData?.code === "INVALID_OR_EXPIRED_OTP" ||
        rawMsg.includes("otp") ||
        rawMsg.includes("expired")
      ) {
        setError(t("invalidOtp") || (language === "th" ? "รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว" : "Invalid or expired OTP code."));
      } else if (
        err.response?.status === 404 ||
        rawMsg.includes("user not found") ||
        rawMsg.includes("ไม่พบ")
      ) {
        setError(t("userNotFound") || (language === "th" ? "ไม่พบอีเมลผู้ใช้ในระบบ" : "User not found"));
      } else {
        setError(t("loginFailed") || (language === "th" ? "การรีเซ็ตรหัสผ่านล้มเหลว โปรดลองอีกครั้ง" : "Password reset failed. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    message,
    error,
    loading,
    showPassword,
    setShowPassword,
    otpCooldown,
    handleChange,
    handleSendOtp,
    handleSubmit,
  };
};
