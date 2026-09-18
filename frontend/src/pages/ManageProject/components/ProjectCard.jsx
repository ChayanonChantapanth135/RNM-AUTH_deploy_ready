import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";

const ProjectCard = ({
  project,
  t,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete,
  canManage = true,
}) => {
  const { language } = useLanguage();
  const statusLower = project.status?.toLowerCase();
  let badgeClass = "badge-status-todo";
  let statusText = t("statusPending");
  if (statusLower === "completed") {
    badgeClass = "badge-status-completed";
    statusText = t("statusCompleted");
  } else if (statusLower === "in_progress" || statusLower === "in progress") {
    badgeClass = "badge-status-in-progress";
    statusText = t("statusInProgress");
  } else if (statusLower === "review" || statusLower === "reviewing") {
    badgeClass = "badge-status-in-review";
    statusText = t("statusReview");
  }

  const deadlineStyle = (() => {
    if (!project.end_date || statusLower === "completed") return {};
    const now = new Date();
    const end = new Date(project.end_date);
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);
    
    if (now > endDay) {
      return {
        background: "rgba(244, 63, 94, 0.15)", // light red
        border: "1.5px solid rgba(244, 63, 94, 0.4)",
      };
    }
    
    const diffTime = endDay.getTime() - now.getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    if (diffTime >= 0 && diffTime <= threeDaysMs) {
      return {
        background: "rgba(245, 158, 11, 0.15)", // light yellow
        border: "1.5px solid rgba(245, 158, 11, 0.4)",
      };
    }
    return {};
  })();

  return (
    <div 
      className="glass-card rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden group"
      style={deadlineStyle}
    >
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>

      <div>
        {/* Status & Priority */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap inline-block ${badgeClass}`}>
            ● {statusText}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
            project.priority === "High"
              ? "bg-rose-500/20 text-rose-300"
              : project.priority === "Medium"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-indigo-500/20 text-indigo-300"
          }`}>
            {project.priority}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{project.name}</h3>

        {/* Dates & Team Leader */}
        <div className="space-y-2 mb-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>⏱️ {t("endDateLabel")}:</span>
            <span className="font-semibold text-slate-200">
              {project.end_date ? formatDate(project.end_date, language) : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>👤 {t("colTeamLeader")}:</span>
            <span className="font-semibold text-slate-200">
              {project.teamLeaderName || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Actions */}
      <div>
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Progress</span>
            <span className="text-white">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 pt-4 border-t border-white/5">
          <button
            className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 !text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
            style={{ color: "#FFFFFF" }}
            onClick={() => handleViewDetails(project)}
          >
            {t("viewBtn") || "View"}
          </button>
          {canManage && (
            <>
              <button
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 !text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
                style={{ color: "#FFFFFF" }}
                onClick={() => handleOpenEdit(project)}
              >
                {t("editBtn") || "Edit"}
              </button>
              <button
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 !text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
                style={{ color: "#FFFFFF" }}
                onClick={() => handleOpenDelete(project)}
              >
                {t("deleteBtn") || "Delete"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
