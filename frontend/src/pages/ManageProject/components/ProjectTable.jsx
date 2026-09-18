import React, { useState, useEffect } from "react";
import { formatDate } from "../../../lib/dateUtils";
import { useLanguage } from "../../../lib/LanguageContext";

const ProjectTable = ({
  filteredProjects,
  t,
  sortByPriority,
  setSortByPriority,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete,
  canManage = true,
}) => {
  const { language } = useLanguage();
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-reset page to 1 when filtered dataset changes or if currentPage exceeds totalPages
  const totalEntries = filteredProjects.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [totalEntries, entriesPerPage]);

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastEntry = safeCurrentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredProjects.slice(indexOfFirstEntry, indexOfLastEntry);

  const startEntry = totalEntries === 0 ? 0 : indexOfFirstEntry + 1;
  const endEntry = Math.min(indexOfLastEntry, totalEntries);

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden mb-8">
      {/* Show Entries Dropdown Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <span>{t("showText") || "Show"}</span>
          <div className="relative">
            <select
              className="bg-slate-900/80 rounded-xl pl-3 pr-8 py-1.5 text-white text-xs focus:outline-none appearance-none font-bold cursor-pointer"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <span>{t("entriesPerPageText") || "Entries"}</span>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-bold">
              <th className="py-4 px-6">{language === "th" ? "ชื่อโครงการ" : "PROJECT NAME"}</th>
              <th className="py-4 px-6">{language === "th" ? "หัวหน้าทีม" : "TEAM LEADER"}</th>
              <th
                className="py-4 px-6 text-center cursor-pointer select-none"
                onClick={() => {
                  if (sortByPriority === "none") setSortByPriority("desc");
                  else if (sortByPriority === "desc") setSortByPriority("asc");
                  else setSortByPriority("none");
                }}
              >
                {language === "th" ? "ความสำคัญ" : "PRIORITY"}{" "}
                <span>
                  {sortByPriority === "none"
                    ? "⇅"
                    : sortByPriority === "desc"
                      ? "↓"
                      : "↑"}
                </span>
              </th>
              <th className="py-4 px-6 text-center">{language === "th" ? "สถานะ" : "STATUS"}</th>
              <th className="py-4 px-6 text-center">{language === "th" ? "วันสิ้นสุด" : "DUE DATE"}</th>
              <th className="py-4 px-6 text-center">{language === "th" ? "จัดการ" : "ACTION"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {currentEntries.length > 0 ? (
              currentEntries.map((project) => {
                const statusLower = project.status?.toLowerCase() || "";
                const deadlineStyle = (() => {
                  if (!project.end_date || statusLower === "completed") return {};
                  const now = new Date();
                  const end = new Date(project.end_date);
                  const endDay = new Date(end);
                  endDay.setHours(23, 59, 59, 999);
                  
                  if (now > endDay) {
                    return {
                      backgroundColor: "rgba(244, 63, 94, 0.15)", // light red
                    };
                  }
                  
                  const diffTime = endDay.getTime() - now.getTime();
                  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
                  if (diffTime >= 0 && diffTime <= threeDaysMs) {
                    return {
                      backgroundColor: "rgba(245, 158, 11, 0.15)", // light yellow
                    };
                  }
                  return {};
                })();

                return (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors">
                    {/* Project Name */}
                    <td className="py-4 px-6 font-bold text-white rounded-l-2xl whitespace-nowrap" style={deadlineStyle}>
                      {project.name}
                    </td>

                    {/* Team Leader / Assignee */}
                    <td className="py-4 px-6 text-slate-300 whitespace-nowrap" style={deadlineStyle}>
                      {project.teamLeaderName || "-"}
                    </td>

                    {/* Priority Pill */}
                    <td className="py-4 px-6 text-center whitespace-nowrap" style={deadlineStyle}>
                      <span
                        className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${
                          project.priority === "High"
                            ? "bg-rose-500/20 text-rose-300"
                            : project.priority === "Medium"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {project.priority || "Medium"}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6 text-center whitespace-nowrap" style={deadlineStyle}>
                      {(() => {
                        let badgeClass = "badge-status-todo";
                        let statusText = t("statusPending") || "Pending";
                        if (statusLower === "completed") {
                          badgeClass = "badge-status-completed";
                          statusText = t("statusCompleted") || "Completed";
                        } else if (
                          statusLower === "in_progress" ||
                          statusLower === "in progress"
                        ) {
                          badgeClass = "badge-status-in-progress";
                          statusText = t("statusInProgress") || "In Progress";
                        } else if (
                          statusLower === "review" ||
                          statusLower === "reviewing"
                        ) {
                          badgeClass = "badge-status-in-review";
                          statusText = t("statusReview") || "Reviewing";
                        }
                        return (
                          <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                            {statusText}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Due Date (DD/MM/YYYY) */}
                    <td className="py-4 px-6 text-center text-slate-400 font-mono whitespace-nowrap" style={deadlineStyle}>
                      {formatDate(project.end_date, language)}
                    </td>

                    {/* Action Button: Manage */}
                    <td className="py-4 px-6 text-center rounded-r-2xl whitespace-nowrap" style={deadlineStyle}>
                      <div className="inline-flex items-center justify-center gap-2">
                        <button
                          className="px-4 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                          style={{
                            background: "var(--bg-surface-hover)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-surface)",
                          }}
                          onClick={() => handleViewDetails(project)}
                        >
                          {language === "th" ? "จัดการ" : "Manage"}
                        </button>
                        {canManage && (
                          <>
                            <button
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium transition-colors"
                              onClick={() => handleOpenEdit(project)}
                              title="แก้ไขโครงการ"
                            >
                              ✏️
                            </button>
                            <button
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
                              onClick={() => handleOpenDelete(project)}
                              title="ลบโครงการ"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-2">📂</div>
                  <p className="text-sm font-semibold">{t("noProjectsFound") || "No projects found"}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
        <span>
          {t("showingText") || "Showing"} {totalEntries === 0 ? 0 : startEntry}{" "}
          {t("toText") || "to"} {endEntry} {t("ofText") || "of"}{" "}
          {totalEntries} {t("entriesText") || "Entries"}
        </span>

        {totalPages > 1 && (
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
              {t("prevText") || "Previous"}
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
              {t("nextText") || "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
