import React from "react";

const ResetPasswordFirstTimeForm = ({
  values,
  handleChange,
  handleSubmit,
  handleLogout,
  loading,
  showPassword,
  setShowPassword,
  t,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* New Password */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          {t("newPasswordLabel") || "New Password"}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
            🔑
          </span>
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
        {loading ? t("updatingPassword") : t("saveNewPassword")}
      </button>

      <div className="text-center pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors bg-transparent border-0 p-0 font-medium cursor-pointer"
        >
          {"← " + t("signOut")}
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordFirstTimeForm;
