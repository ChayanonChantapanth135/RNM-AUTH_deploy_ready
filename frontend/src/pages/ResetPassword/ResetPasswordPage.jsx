import React, { useRef } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useResetPassword } from "./hooks/useResetPassword";
import ResetPasswordForm from "./components/ResetPasswordForm";

/**
 * คอมโพเนนต์หน้ารีเซ็ตรหัสผ่าน (ResetPasswordPage Component) - Clean Modular Architecture
 */
const ResetPasswordPage = () => {
  const { language, t } = useLanguage();
  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  const {
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
  } = useResetPassword(language, t);

  useGSAP(() => {
    gsap.to(orb1Ref.current, {
      x: 40,
      y: -40,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(orb2Ref.current, {
      x: -40,
      y: 40,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Background Animated Glowing Orbs */}
      <div
        ref={orb1Ref}
        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none ambient-blob-1"
      />
      <div
        ref={orb2Ref}
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none ambient-blob-2"
      />

      {/* Language Switcher Positioned Top-Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Main Glassmorphic Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl z-10 shadow-2xl relative"
      >
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 mx-auto mb-6 shadow-lg shadow-teal-500/30">
          <div className="w-full h-full bg-[#153648] rounded-[14px] flex items-center justify-center text-2xl">
            🔑
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-center text-white mb-2 tracking-tight">
          {t("resetPasswordTitle")}
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-normal">
          {language === "th"
            ? "กรอกข้อมูลและรหัส OTP เพื่อตั้งรหัสผ่านใหม่"
            : "Enter details and OTP code to set new password"}
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
        <ResetPasswordForm
          values={values}
          handleChange={handleChange}
          handleSendOtp={handleSendOtp}
          handleSubmit={handleSubmit}
          loading={loading}
          otpCooldown={otpCooldown}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          language={language}
          t={t}
        />
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
