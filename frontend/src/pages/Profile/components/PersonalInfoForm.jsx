import React from "react";
import SearchableUserSelect from "../../../components/SearchableUserSelect";

const PersonalInfoForm = ({
  fullname,
  setFullname,
  phone,
  setPhone,
  email,
  setEmail,
  leaderId,
  setLeaderId,
  usersList = [],
  user,
  t,
}) => {
  const isLeaderLocked = Boolean(user?.leader_id);
  const currentLeaderName =
    user?.leader_name ||
    usersList.find((u) => String(u.id) === String(user?.leader_id))?.fullname ||
    "";

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4 relative z-20">
      <h5 className="text-base font-bold flex items-center gap-2 mb-2" style={{ color: "var(--brand-color)" }}>
        <ion-icon name="person-circle-outline" style={{ fontSize: "20px" }}></ion-icon>
        <span>{t("profilePersonalInfo")}</span>
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profileUsername")}
          </label>
          <input
            type="text"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profilePhone")}
          </label>
          <input
            type="tel"
            className="rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none placeholder:text-slate-400"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+66XXXXXXXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profileEmail") || "Email"}
          </label>
          <input
            type="email"
            className="rounded-2xl px-4 py-3 text-sm font-medium cursor-not-allowed opacity-60"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-secondary)",
              border: "1px dashed var(--border-surface)",
            }}
            value={email || ""}
            disabled
          />
        </div>

        {/* Leader Selector / Locked Leader */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
            {t("profileLeaderLabel") || "Leader"}
          </label>

          {isLeaderLocked ? (
            <div>
              <div
                className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center justify-between cursor-not-allowed opacity-60"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-secondary)",
                  border: "1px dashed var(--border-surface)",
                  minHeight: "46px",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentLeaderName || `ID: ${user?.leader_id}`}</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-500/90 mt-1 flex items-center gap-1">
                <span>{t("profileLeaderLockedNotice") || "You have already set your leader and cannot change it."}</span>
              </p>
            </div>
          ) : (
            <div>
              <SearchableUserSelect
                users={usersList.filter((u) => Number(u.id) !== Number(user?.id))}
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                placeholder={t("profileLeaderPlaceholder") || "-- Select Leader --"}
                placement="bottom"
                triggerClassName="rounded-2xl px-4 py-3 text-sm font-medium"
                triggerStyle={{
                  minHeight: "46px",
                  borderRadius: "1rem",
                  background: "var(--bg-surface-hover)",
                  color: leaderId ? "var(--text-primary)" : "var(--text-secondary)",
                  border: "1px solid var(--border-surface)",
                }}
              />
              <p className="text-[11px] text-teal-400/90 mt-1 flex items-center gap-1">
                <span>{t("profileLeaderNotice") || "You can select your leader only once. Once saved, it cannot be changed."}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;

