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
      setError(
        language === "th"
          ? "กรุณากรอกอีเมลก่อนส่ง OTP"
          : "Please enter your email first."
      );
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

      setMessage(
        language === "th"
          ? "ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว"
          : "OTP sent to your email"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (language === "th" ? "ไม่สามารถส่ง OTP ได้" : "Failed to send OTP.")
      );
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

      setMessage(response.data.message || t("resetSuccess"));
      setValues({ email: "", otpCode: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || t("loginFailed"));
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
