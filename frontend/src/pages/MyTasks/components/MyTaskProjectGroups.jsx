import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function MyTaskProjectGroups({
  projectGroups,
  handleManageClick,
}) {
  const { t, language } = useLanguage();

  // State to track expanded project groups (Map of groupName -> boolean)
  const [expandedGroups, setExpandedGroups] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;

  // Reset to page 1 if projectGroups change
  useEffect(() => {
    setCurrentPage(1);
  }, [projectGroups.length]);

  const totalPages = Math.ceil(projectGroups.length / projectsPerPage) || 1;
  const currentProjectGroups = projectGroups.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage,
  );

  // Initialize or update open state when projectGroups change
  useEffect(() => {
    if (projectGroups && projectGroups.length > 0) {
      setExpandedGroups((prev) => {
        const next = { ...prev };
        projectGroups.forEach((group) => {
          if (next[group.name] === undefined) {
            // Check if all tasks in the project are completed
            const allCompleted = group.tasks.every(
              (task) => String(task.status).toLowerCase() === "completed",
            );
            // Default open if active tasks remain, collapse if all done
            next[group.name] = !allCompleted;
          }
        });
        return next;
      });
    }
  }, [projectGroups]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const expandAll = () => {
    const next = {};
    projectGroups.forEach((g) => {
      next[g.name] = true;
    });
    setExpandedGroups(next);
  };

  const collapseAll = () => {
    const next = {};
    projectGroups.forEach((g) => {
      next[g.name] = false;
    });
    setExpandedGroups(next);
  };

  const allExpanded =
    projectGroups.length > 0 &&
    projectGroups.every((g) => expandedGroups[g.name] !== false);

  const formatDueDateDisplay = (dateVal) => {
    if (!dateVal || dateVal === "-") return "-";
    try {
      const dateStr = String(dateVal).trim();
      let year, month, day;

      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          let y = parseInt(parts[2], 10);
          if (y > 2500) y -= 543;
          year = y;
        }
      } else if (dateStr.includes("-")) {
        const parts = dateStr.split("T")[0].split("-");
        if (parts.length === 3) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        }
      }

      if (!year || !month || !day) {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        day = d.getDate();
        month = d.getMonth() + 1;
        year = d.getFullYear();
      }

      const displayYear = language === "th" ? year + 543 : year;
      const formattedDay = String(day).padStart(2, "0");
      const formattedMonth = String(month).padStart(2, "0");

      return `${formattedDay}/${formattedMonth}/${displayYear}`;
    } catch (e) {
      return dateVal;
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Expand / Collapse All Bar */}
      {projectGroups.length > 1 && (
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-slate-400">
            {language === "th"
              ? `ทั้งหมด ${projectGroups.length} โครงการ`
              : `Total ${projectGroups.length} Projects`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={allExpanded ? collapseAll : expandAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  allExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span>
                {allExpanded
                  ? language === "th"
                    ? "ซ่อนงานทั้งหมด"
                    : "Hide All Tasks"
                  : language === "th"
                    ? "แสดงงานทั้งหมด"
                    : "Show All Tasks"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Project Group Cards (Paginated 3 per page) */}
      {currentProjectGroups.map((group) => {
        const isExpanded = expandedGroups[group.name] !== false;
        const totalTasks = group.tasks.length;
        const completedTasks = group.tasks.filter(
          (t) => String(t.status).toLowerCase() === "completed",
        ).length;
        const progressRate =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return (
          <div
            key={group.name}
            className="project-group-card glass-panel rounded-3xl p-5 md:p-6 transition-all duration-300 shadow-md"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-surface)",
            }}
          >
            {/* Project Header (Clickable Accordion) */}
            <div
              onClick={() => toggleGroup(group.name)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 cursor-pointer select-none group/hdr"
              style={{
                borderBottom: isExpanded
                  ? "1px solid var(--border-surface)"
                  : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(99,102,241,0.15))",
                    border: "1px solid var(--border-surface)",
                  }}
                >
                  📁
                </span>
                <div>
                  <h2
                    className="text-lg font-bold leading-tight group-hover/hdr:text-teal-400 transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {group.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs font-semibold">
                    <span style={{ color: "var(--brand-color)" }}>
                      {totalTasks} {t("assignedTasksText") || "tasks"}
                    </span>
                    <span className="opacity-30">•</span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {completedTasks}/{totalTasks}{" "}
                      {t("completed") || "เสร็จสิ้น"} ({progressRate}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* Progress bar mini */}
                <div className="hidden md:flex items-center gap-2 w-32">
                  <div
                    className="flex-1 rounded-full h-2 overflow-hidden"
                    style={{ background: "var(--border-surface)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressRate}%`,
                        background: `linear-gradient(90deg, #14b8a6, ${progressRate === 100 ? "#10b981" : "#6366f1"})`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-400">
                    {progressRate}%
                  </span>
                </div>

                {/* Toggle Arrow Button */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: "var(--bg-surface-hover)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-teal-400" : "text-slate-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tasks Table Section (Collapsible) */}
            {isExpanded && (
              <div className="mt-4 pt-1 transition-all duration-300 animate-fadeIn">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto max-h-[380px] overflow-y-auto pr-1 custom-scrollbar rounded-xl">
                  <table className="w-full text-left border-collapse relative">
                    <thead
                      className="sticky top-0 z-20"
                      style={{ background: "var(--bg-surface)" }}
                    >
                      <tr
                        className="text-xs uppercase tracking-wider font-bold shadow-sm"
                        style={{
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border-surface)",
                        }}
                      >
                        <th className="py-3 px-4 text-center">
                          {t("taskNameLabel")}
                        </th>
                        <th className="py-3 px-4 text-center">
                          {t("taskTypeLabel")}
                        </th>
                        <th className="py-3 px-4 text-center">
                          {t("taskPriorityLabel")}
                        </th>
                        <th className="py-3 px-4 text-center">
                          {t("taskStatusLabel")}
                        </th>
                        <th className="py-3 px-4 text-center">
                          {t("taskDueDateLabel")}
                        </th>
                        <th className="py-3 px-4 text-center">
                          {t("colManage")}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y text-sm"
                      style={{ borderColor: "var(--border-surface)" }}
                    >
                      {group.tasks.map((task) => {
                        const statusColors = {
                          Pending: "badge-status-todo",
                          "In Progress": "badge-status-in-progress",
                          Reviewing: "badge-status-in-review",
                          Completed: "badge-status-completed",
                        };

                        const priorityColors = {
                          High: "bg-red-500/20 text-red-400",
                          Medium: "bg-amber-500/20 text-amber-400",
                          Low: "bg-blue-500/20 text-blue-400",
                        };

                        const translateStatus = (status) => {
                          const s = String(status).toLowerCase();
                          if (s === "pending") return t("pending");
                          if (s === "in progress" || s === "in_progress")
                            return t("inProgress");
                          if (s === "reviewing" || s === "review")
                            return t("reviewing");
                          if (s === "completed") return t("completed");
                          return status;
                        };

                        const translatePriority = (priority) => {
                          const p = String(priority).toLowerCase();
                          if (p === "high") return t("priorityHigh");
                          if (p === "medium") return t("priorityMedium");
                          if (p === "low") return t("priorityLow");
                          return priority;
                        };

                        const formatTaskType = (type) => {
                          if (!type) return "-";
                          if (type === "แปล" || type === "Translate")
                            return t("taskTypeTranslate");
                          if (
                            type === "สตอรี่บอร์ด" ||
                            type === "Storyboard & Script"
                          )
                            return t("taskTypeStoryboard");
                          if (type === "ออกแบบ" || type === "Graphic & Design")
                            return t("taskTypeGraphicDesign");
                          if (type === "อนิเมชัน" || type === "Animation")
                            return t("taskTypeAnimation");
                          if (
                            type === "ตัดต่อ" ||
                            type === "Video Editing" ||
                            type === "Video Edit"
                          )
                            return t("taskTypeVideoEdit");
                          if (type === "พัฒนาโปรแกรม" || type === "Development")
                            return t("taskTypeDevelopment");
                          if (type === "อื่นๆ" || type === "Others")
                            return t("taskTypeOthers");
                          return type;
                        };

                        const getTaskRowStyle = (tItem) => {
                          if (tItem.status === "Completed") return {};
                          const targetDateStr =
                            tItem.rawDueDate || tItem.dueDate;
                          if (!targetDateStr || targetDateStr === "-")
                            return {};

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          let taskDueDate = null;
                          try {
                            const dateStr = String(targetDateStr).trim();
                            if (dateStr.includes("/")) {
                              const parts = dateStr.split("/");
                              if (parts.length === 3) {
                                let y = parseInt(parts[2], 10);
                                if (y > 2500) y -= 543;
                                taskDueDate = new Date(
                                  y,
                                  parseInt(parts[1], 10) - 1,
                                  parseInt(parts[0], 10),
                                );
                              }
                            } else if (dateStr.includes("-")) {
                              const parts = dateStr.split("T")[0].split("-");
                              if (parts.length === 3) {
                                taskDueDate = new Date(
                                  parseInt(parts[0], 10),
                                  parseInt(parts[1], 10) - 1,
                                  parseInt(parts[2], 10),
                                );
                              }
                            }
                            if (!taskDueDate || isNaN(taskDueDate.getTime())) {
                              taskDueDate = new Date(targetDateStr);
                            }
                          } catch {
                            return {};
                          }

                          if (!taskDueDate || isNaN(taskDueDate.getTime()))
                            return {};
                          taskDueDate.setHours(0, 0, 0, 0);

                          const diffTime =
                            taskDueDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24),
                          );

                          if (diffDays < 0) {
                            return {
                              backgroundColor: "rgba(225, 29, 72, 0.12)",
                            };
                          } else if (diffDays <= 3) {
                            return {
                              backgroundColor: "rgba(245, 158, 11, 0.15)",
                            };
                          }
                          return {};
                        };

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-500/5 transition-all group"
                            style={getTaskRowStyle(task)}
                          >
                            <td
                              className="py-3.5 px-4 text-center font-bold first:rounded-l-xl last:rounded-r-xl"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {task.title}
                            </td>
                            <td
                              className="py-3.5 px-4 text-center font-medium first:rounded-l-xl last:rounded-r-xl"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {formatTaskType(task.taskType)}
                            </td>
                            <td className="py-3.5 px-4 text-center first:rounded-l-xl last:rounded-r-xl">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${priorityColors[task.priority]}`}
                              >
                                {translatePriority(task.priority)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center first:rounded-l-xl last:rounded-r-xl">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[task.status]}`}
                              >
                                {translateStatus(task.status)}
                              </span>
                            </td>
                            <td
                              className="py-3.5 px-4 text-center text-xs font-semibold first:rounded-l-xl last:rounded-r-xl"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {formatDueDateDisplay(
                                task.rawDueDate || task.dueDate,
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center first:rounded-l-xl last:rounded-r-xl">
                              <button
                                className="px-4 py-1.5 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                                style={{
                                  background: "var(--bg-surface-hover)",
                                  color: "var(--text-primary)",
                                  border: "1px solid var(--border-surface)",
                                }}
                                onClick={() => handleManageClick(task)}
                              >
                                {t("colManage")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Task Cards (Shown on mobile only, no horizontal scroll) */}
                <div className="md:hidden flex flex-col gap-2.5 mt-2">
                  {group.tasks.map((task) => {
                    const statusColors = {
                      Pending: "badge-status-todo",
                      "In Progress": "badge-status-in-progress",
                      Reviewing: "badge-status-in-review",
                      Completed: "badge-status-completed",
                    };

                    const priorityColors = {
                      High: "bg-red-500/20 text-red-400",
                      Medium: "bg-amber-500/20 text-amber-400",
                      Low: "bg-blue-500/20 text-blue-400",
                    };

                    const translateStatus = (status) => {
                      const s = String(status).toLowerCase();
                      if (s === "pending") return t("pending");
                      if (s === "in progress" || s === "in_progress")
                        return t("inProgress");
                      if (s === "reviewing" || s === "review")
                        return t("reviewing");
                      if (s === "completed") return t("completed");
                      return status;
                    };

                    const translatePriority = (priority) => {
                      const p = String(priority).toLowerCase();
                      if (p === "high") return t("priorityHigh");
                      if (p === "medium") return t("priorityMedium");
                      if (p === "low") return t("priorityLow");
                      return priority;
                    };

                    const formatTaskType = (type) => {
                      if (!type) return "-";
                      if (type === "แปล" || type === "Translate")
                        return t("taskTypeTranslate");
                      if (
                        type === "สตอรี่บอร์ด" ||
                        type === "Storyboard & Script"
                      )
                        return t("taskTypeStoryboard");
                      if (type === "ออกแบบ" || type === "Graphic & Design")
                        return t("taskTypeGraphicDesign");
                      if (type === "อนิเมชัน" || type === "Animation")
                        return t("taskTypeAnimation");
                      if (
                        type === "ตัดต่อ" ||
                        type === "Video Editing" ||
                        type === "Video Edit"
                      )
                        return t("taskTypeVideoEdit");
                      if (type === "พัฒนาโปรแกรม" || type === "Development")
                        return t("taskTypeDevelopment");
                      if (type === "อื่นๆ" || type === "Others")
                        return t("taskTypeOthers");
                      return type;
                    };

                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-white/[0.04] transition-all flex flex-col gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h5
                              className="font-bold text-sm truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {task.title}
                            </h5>
                            <span
                              className="inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-bold"
                              style={{
                                background: "rgba(20,184,166,0.12)",
                                color: "#0d9488",
                              }}
                            >
                              {formatTaskType(task.taskType)}
                            </span>
                          </div>
                          <button
                            className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md shrink-0"
                            style={{
                              background: "var(--bg-surface-hover)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-surface)",
                            }}
                            onClick={() => handleManageClick(task)}
                          >
                            {t("colManage")}
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${priorityColors[task.priority]}`}
                            >
                              {translatePriority(task.priority)}
                            </span>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusColors[task.status]}`}
                            >
                              {translateStatus(task.status)}
                            </span>
                          </div>
                          <div
                            className="text-[11px] font-mono shrink-0"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatDueDateDisplay(
                              task.rawDueDate || task.dueDate,
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-700/40 text-xs text-slate-400">
          <span>
            {language === "th"
              ? `แสดงโครงการที่ ${(currentPage - 1) * projectsPerPage + 1} ถึง ${Math.min(currentPage * projectsPerPage, projectGroups.length)} จากทั้งหมด ${projectGroups.length} โครงการ`
              : `Showing ${(currentPage - 1) * projectsPerPage + 1} to ${Math.min(currentPage * projectsPerPage, projectGroups.length)} of ${projectGroups.length} projects`}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              onClick={() => {
                setCurrentPage((prev) => Math.max(prev - 1, 1));
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
            >
              {t("prevText") || "Previous"}
            </button>

            <span
              className="px-3.5 py-1.5 font-bold rounded-xl text-xs shadow-md"
              style={{
                background: "var(--brand-color)",
                color: "#FFFFFF",
              }}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
              onClick={() => {
                setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
            >
              {t("nextText") || "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
