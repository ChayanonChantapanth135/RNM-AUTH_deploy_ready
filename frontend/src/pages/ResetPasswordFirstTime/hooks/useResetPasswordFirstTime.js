import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUser, signOut, signIn } from "../../../lib/auth";

export const useResetPasswordFirstTime = (t) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate("/login");
      } else if (user.is_force_reset === 0 || user.is_force_reset !== 1) {
        navigate("/Dashboard");
      } else {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!values.password || !values.confirmPassword) {
      setError(t("fillAllFields"));
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError(t("passwordsMismatch") || "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/reset-password-first-time", {
        userId: currentUser.id,
        password: values.password,
      });

      setMessage(t("firstTimeResetSuccess"));

      const updatedUser = { ...currentUser, is_force_reset: 0 };
      const token = localStorage.getItem("userToken");
      const expiresAt = localStorage.getItem("userTokenExpiresAt");
      const expiresInSeconds = expiresAt ? Math.round((Number(expiresAt) - Date.now()) / 1000) : 2400;

      await signIn({
        token,
        expiresInSeconds,
        user: updatedUser,
      });

      setTimeout(() => {
        navigate("/Dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || t("firstTimeResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return {
    currentUser,
    values,
    message,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
    handleLogout,
  };
};
