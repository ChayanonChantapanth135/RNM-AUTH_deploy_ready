import React, { useRef } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLogin } from "./hooks/useLogin";
import LoginForm from "./components/LoginForm";

/**
 * คอมโพเนนต์หน้าล็อกอิน (LoginPage Component) - Clean Modular Architecture
 */
const LoginPage = () => {
  const { language, t } = useLanguage();

  const {
    values,
    message,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  } = useLogin(t);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Background Animated Glowing Orbs */}
      <div
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full pointer-events-none ambient-blob-1"
      ></div>
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none ambient-blob-2"
      ></div>

      {/* Language Switcher Positioned Top-Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl z-10 shadow-2xl relative"
      >
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 mx-auto mb-6 shadow-lg shadow-teal-500/30">
          <div className="w-full h-full bg-[#153648] rounded-[14px] flex items-center justify-center text-2xl">
            🔐
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">
          {t("loginTitle")}
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-normal">
          {language === "th" ? "ยินดีต้อนรับสู่ระบบบริหารงาน" : "Welcome back to the portal"}
        </p>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-semibold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <LoginForm
          values={values}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          language={language}
          t={t}
        />
      </motion.div>
    </div>
  );
};

export default LoginPage;
