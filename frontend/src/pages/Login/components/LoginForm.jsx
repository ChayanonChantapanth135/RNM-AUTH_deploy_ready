import React from "react";
import { Link } from "react-router-dom";

const LoginForm = ({
  values,
  handleChange,
  handleSubmit,
  loading,
  showPassword,
  setShowPassword,
  language,
  t,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full bg-slate-900/60 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          {t("passwordLabel")}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-base glow-button transition-all disabled:opacity-50 mt-2 cursor-pointer"
      >
        {loading
          ? language === "th"
            ? "กำลังเข้าสู่ระบบ..."
            : "Signing in..."
          : t("loginTitle")}
      </button>

      <div className="text-center pt-3">
        <Link
          to="/reset-password"
          className="text-xs text-slate-400 hover:text-indigo-400 transition-colors no-underline font-medium"
        >
          {t("forgotPasswordLink")}
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
