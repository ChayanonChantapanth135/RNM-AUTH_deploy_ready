import React from "react";

const PasswordForm = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  t,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4 relative z-10">
      <h5 className="text-base font-bold flex items-center gap-2 mb-2" style={{ color: "var(--brand-color)" }}>
        <ion-icon name="lock-closed-outline" style={{ fontSize: "20px" }}></ion-icon>
        <span>{t("profileChangePassword")}</span>
      </h5>

      <div className="flex flex-col gap-4">
        {/* Current Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profileCurrentPassword") || "Current Password"}
          </label>
          <input
            type="password"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none placeholder:text-slate-400"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
              {t("profileNewPassword")}
            </label>
            <input
              type="password"
              className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none placeholder:text-slate-400"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
              {t("profileConfirmPassword")}
            </label>
            <input
              type="password"
              className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none placeholder:text-slate-400"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm;
