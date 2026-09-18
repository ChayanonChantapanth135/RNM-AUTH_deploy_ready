import React from "react";
import { Link } from "react-router-dom";

const ResetPasswordForm = ({
  values,
  handleChange,
  handleSendOtp,
  handleSubmit,
  loading,
  otpCooldown,
  showPassword,
  setShowPassword,
  language,
  t,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          {t("emailLabel")}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none"></span>
          <input
            id="email"
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            value={values.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-28 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || otpCooldown > 0}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {loading
              ? "..."
              : otpCooldown > 0
                ? `${Math.floor(otpCooldown / 60)}:${(otpCooldown % 60)
                    .toString()
                    .padStart(2, "0")}`
                : t("sendOtpBtn")}
          </button>
        </div>
      </div>

      {/* OTP Code */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          {t("otpCodeLabel")}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none"></span>
          <input
            id="otpCode"
            type="text"
            name="otpCode"
            placeholder={t("otpCodePlaceholder")}
            value={values.otpCode}
            onChange={handleChange}
            required
            className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          {t("newPasswordLabel")}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none"></span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("passwordPlaceholder")}
            value={values.password}
            onChange={handleChange}
            required
            className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none"></span>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder={t("passwordPlaceholder")}
            value={values.confirmPassword}
            onChange={handleChange}
            required
            className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-11 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-base glow-button transition-all disabled:opacity-50 mt-4"
      >
        {loading
          ? language === "th"
            ? "กำลังรีเซ็ต..."
            : "Resetting..."
          : t("resetPasswordTitle")}
      </button>

      <div className="text-center pt-3">
        <Link
          to="/login"
          className="text-xs text-slate-400 hover:text-indigo-400 transition-colors no-underline font-medium"
        >
          {language === "th" ? "← กลับไปหน้าล็อกอิน" : "← Back to Login"}
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
