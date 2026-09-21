import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function ReportHeader({
  roleTitle,
  roleDesc,
  onExportExcel,
  onPrint,
  onRefresh,
  canToggleView = false,
  availableViews = ["user", "team_leader"],
  reportViewMode = "user",
  setReportViewMode,
}) {
  const { t } = useLanguage();

  return (
    <div className="relative mb-10">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 sm:p-8 md:p-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(99,102,241,0.15) 50%, rgba(168,85,247,0.10) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.03]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, white 10%, transparent 20%)",
              animation: "shimmerSpin 8s linear infinite",
            }}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #14b8a6, #6366f1)",
                }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span
                className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                Analytics
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {roleTitle}
            </h1>
            <p
              className="text-xs sm:text-sm max-w-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {roleDesc}
            </p>
          </div>

          {/* Right Action Container: Buttons + View Switcher */}
          <div className="flex flex-col items-start md:items-end gap-3 self-stretch md:self-auto shrink-0">
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={onRefresh}
                className="group px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-surface-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-surface)";
                }}
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t("refreshDataBtn")}
              </button>

              <button
                onClick={onExportExcel}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#ffffff",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(16,185,129,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(16,185,129,0.25)";
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t("exportExcel")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Segmented Control below the card with full width */}
      {canToggleView && availableViews && availableViews.length > 1 && (
        <div className="w-full mt-4">
          <div
            className="w-full grid grid-cols-2 sm:flex sm:items-center p-1.5 rounded-2xl sm:rounded-full shadow-md gap-1.5 backdrop-blur-md"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-surface)",
            }}
          >
            {availableViews.includes("admin") && (
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  reportViewMode === "admin"
                    ? "shadow-md scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
                style={
                  reportViewMode === "admin"
                    ? { background: "var(--brand-color)", color: "#ffffff" }
                    : {}
                }
                onClick={() => setReportViewMode && setReportViewMode("admin")}
              >
                <span className="text-base"></span>{" "}
                <span>{t("adminReport") || "รายงานผู้ดูแลระบบ"}</span>
              </button>
            )}

            {availableViews.includes("manager") && (
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  reportViewMode === "manager"
                    ? "shadow-md scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
                style={
                  reportViewMode === "manager"
                    ? { background: "var(--brand-color)", color: "#ffffff" }
                    : {}
                }
                onClick={() =>
                  setReportViewMode && setReportViewMode("manager")
                }
              >
                <span className="text-base">💼</span>{" "}
                <span>{t("managerReport") || "รายงาน Project Manager"}</span>
              </button>
            )}

            {availableViews.includes("team_leader") && (
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  reportViewMode === "team_leader"
                    ? "shadow-md scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
                style={
                  reportViewMode === "team_leader"
                    ? { background: "var(--brand-color)", color: "#ffffff" }
                    : {}
                }
                onClick={() =>
                  setReportViewMode && setReportViewMode("team_leader")
                }
              >
                <span className="text-base"></span>{" "}
                <span>{t("teamLeaderReport") || "รายงานหัวหน้าทีม"}</span>
              </button>
            )}

            {availableViews.includes("user") && (
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  reportViewMode === "user"
                    ? "shadow-md scale-[1.01]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
                style={
                  reportViewMode === "user"
                    ? { background: "var(--brand-color)", color: "#ffffff" }
                    : {}
                }
                onClick={() => setReportViewMode && setReportViewMode("user")}
              >
                <span className="text-base"></span>{" "}
                <span>{t("personalReport") || "รายงานส่วนตัว"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keyframe for shimmer */}
      <style>{`
        @keyframes shimmerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
