import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDateTime } from "../../../lib/dateUtils";

const ActivityTable = ({
  loading,
  currentEntries,
  filteredLogs,
  entriesPerPage,
  setEntriesPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstEntry,
  indexOfLastEntry,
  t,
}) => {
  const { language } = useLanguage();
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden">
      {/* Show entries row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>{t("showText") || "Show"}</span>
          <select
            className="bg-slate-900/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none cursor-pointer"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>{t("entriesPerPageText") || "Entries"}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-xs mt-3">
            {t("loadingActivities")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr 
                className="border-b text-xs uppercase tracking-wider font-bold"
                style={{ 
                  borderColor: "var(--border-surface)", 
                  color: "var(--text-secondary)" 
                }}
              >
                <th className="py-4 px-4 text-left">{t("colAction")}</th>
                <th className="py-4 px-4 text-left">{t("colDetails")}</th>
                <th className="py-4 px-4 text-center">{t("colUser")}</th>
                <th className="py-4 px-4 text-center">{t("colTime")}</th>
              </tr>
            </thead>
            <tbody 
              className="divide-y text-sm"
              style={{ borderColor: "var(--border-surface)" }}
            >
              {currentEntries.length > 0 ? (
                currentEntries.map((log, index) => {
                  const act = log.action.toLowerCase();
                  let badgeClass = "bg-slate-500/20 text-slate-300 dark:text-slate-300";
                  let badgeStyle = { backgroundColor: "rgba(100, 116, 139, 0.15)", color: "var(--text-secondary)" };

                  if (act.includes("create")) {
                    badgeStyle = { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" };
                  } else if (act.includes("edit") || act.includes("update") || act.includes("reset")) {
                    badgeStyle = { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" };
                  } else if (act.includes("delete") || act.includes("suspend")) {
                    badgeStyle = { backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" };
                  } else if (act.includes("login")) {
                    badgeStyle = { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#6366f1" };
                  } else if (act.includes("logout")) {
                    badgeStyle = { backgroundColor: "rgba(100, 116, 139, 0.2)", color: "#94a3b8" };
                  }

                  return (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderBottom: "1px solid var(--border-surface)" }}
                    >
                      <td className="py-4 px-4 text-left">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap inline-block"
                          style={badgeStyle}
                        >
                          {t(log.action) || log.action}
                        </span>
                      </td>
                      <td 
                        className="py-4 px-4 font-medium text-xs text-left"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {log.details}
                      </td>
                      <td 
                        className="py-4 px-4 text-xs font-semibold text-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        👤 {log.fullname || log.username || t("systemAdmin")}
                      </td>
                      <td 
                        className="py-4 px-4 text-center text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatDateTime(log.created_at, language)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-2">📂</div>
                    <p className="text-sm font-semibold">
                      {t("noActivitiesFound")}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
          <span>
            {t("showingText") || "แสดง"} {indexOfFirstEntry + 1} -{" "}
            {Math.min(indexOfLastEntry, filteredLogs.length)}{" "}
            {t("ofText") || "จาก"} {filteredLogs.length}{" "}
            {t("entriesText") || "รายการ"}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              {t("prevText") || "ย้อนกลับ"}
            </button>
            <span
              className="px-3.5 py-1.5 font-bold rounded-xl text-xs pagination-badge shadow-md"
              style={{
                background: "var(--brand-color)",
                color: "#FFFFFF",
              }}
            >
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              {t("nextText") || "ถัดไป"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTable;
