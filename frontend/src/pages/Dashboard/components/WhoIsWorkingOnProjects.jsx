import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";

/**
 * คอมโพเนนต์ Who is working on this project?
 * - แสดงโปรเจกต์ทั้งหมดที่ยังไม่เสร็จ (ซ่อนโปรเจกต์ที่ status เป็น Completed หรือ progress 100%)
 * - แสดงให้เห็นว่าใครกำลังทำโปรเจกต์ไหนอยู่ (Task ที่ In Progress)
 * - ธีม Dark Luxe Glassmorphism ตามระบบดีไซน์ของแดชบอร์ด
 */
const WhoIsWorkingOnProjects = ({ projects = [], loading = false }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // กรองโปรเจกต์ทั้งหมด: ซ่อนโปรเจกต์ที่ทำเสร็จแล้ว (status === 'Completed' หรือ progress === 100)
  const nonCompletedProjects = React.useMemo(() => {
    return projects.filter((p) => {
      const status = (p.status || "").toLowerCase().trim();
      const isCompleted = status === "completed" || p.progress === 100;
      return !isCompleted;
    });
  }, [projects]);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl mt-8 relative overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {/* <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/30 border border-sky-400/30 flex items-center justify-center text-xl shadow-inner">
            <span role="img" aria-label="workers">⚡</span>
          </div> */}
          <div>
            <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <span>
                {t("whoIsWorkingOnProject") ||
                  "Who is working on this project?"}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {nonCompletedProjects.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("whoIsWorkingDesc") ||
                "Active projects and assignees currently working on tasks"}
            </p>
          </div>
        </div>

        <Link
          to="/Projects"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300 no-underline flex items-center gap-1.5 self-end sm:self-auto"
        >
          <span>{t("allProjects") || "โปรเจกต์ทั้งหมด"}</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-9 w-9 border-3 border-sky-500 border-t-transparent"></div>
        </div>
      ) : nonCompletedProjects.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
          {/* <span className="text-4xl block mb-2 opacity-60">🎉</span> */}
          <p className="text-sm font-semibold text-slate-300">
            {t("noActiveProjectsWithWorkers") ||
              "ไม่มีโครงการที่ค้างอยู่ หรือทุกโครงการเสร็จสมบูรณ์เรียบร้อยแล้ว"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {language === "th"
              ? "โครงการที่เสร็จสิ้นแล้วจะถูกซ่อนจากมุมมองนี้โดยอัตโนมัติ"
              : "Completed projects are hidden from this view automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nonCompletedProjects.map((project) => {
            const allTasks = project.tasks || [];
            // ดึงเฉพาะงานที่กำลังทำอยู่ (In Progress)
            const inProgressTasks = allTasks.filter((tItem) => {
              const s = (tItem.status || "").toLowerCase().trim();
              return (
                s === "in progress" || s === "in_progress" || s === "กำลังทำ"
              );
            });

            const statusLower = (project.status || "").toLowerCase().trim();
            const badgeClass =
              statusLower === "in_progress" || statusLower === "in progress"
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                : statusLower === "review" || statusLower === "reviewing"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-slate-700/40 text-slate-300 border-slate-600/30";

            return (
              <div
                key={project.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-white/10 hover:border-sky-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg relative overflow-hidden"
              >
                {/* Background Ambient Glow */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />

                <div>
                  {/* Top Bar: Status & Priority */}
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${badgeClass} inline-flex items-center gap-1.5`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {project.status || "Pending"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        project.priority === "High"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : project.priority === "Medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {project.priority || "Medium"}
                    </span>
                  </div>

                  {/* Project Name */}
                  <h4
                    onClick={() =>
                      navigate(`/Projects?projectId=${project.id}`)
                    }
                    className="text-base font-bold text-white group-hover:text-sky-400 transition-colors cursor-pointer line-clamp-1 mb-2 tracking-tight"
                    title={project.name}
                  >
                    📁 {project.name}
                  </h4>

                  {/* Team Leader & Due Date info */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400 mb-4 pb-3 border-b border-white/5">
                    {project.teamLeaderName && (
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <span className="text-slate-500">TL:</span>
                        <b className="text-white/90">
                          {project.teamLeaderName}
                        </b>
                      </span>
                    )}
                    {project.end_date && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-slate-500">📅</span>
                        <span>{formatDate(project.end_date, language)}</span>
                      </span>
                    )}
                  </div>

                  {/* Who is working (In-Progress Tasks) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span className="text-amber-400">⚡</span>
                        <span>{t("currentlyWorking") || "กำลังทำภารกิจ:"}</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                        {inProgressTasks.length}{" "}
                        {t("tasksInProgressCount") || "งาน"}
                      </span>
                    </div>

                    {inProgressTasks.length === 0 ? (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-[11px] text-slate-400 italic">
                          {t("noOneWorkingCurrently") ||
                            "ยังไม่มีใคร In Progress งานในโครงการนี้"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {inProgressTasks.map((tItem) => {
                          const workerName =
                            tItem.assigned_to_name ||
                            tItem.assignee_name ||
                            tItem.assignee ||
                            (language === "th"
                              ? "ไม่ระบุผู้รับผิดชอบ"
                              : "Unassigned");

                          return (
                            <div
                              key={tItem.id}
                              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                                    {workerName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-bold text-sky-200 truncate">
                                    {workerName}
                                  </span>
                                </div>
                                <p
                                  className="text-[11px] text-slate-300 font-medium truncate pl-6"
                                  title={tItem.title}
                                >
                                  {tItem.title}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 shrink-0 border border-indigo-400/30">
                                In Progress
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar footer */}
                <div className="mt-5 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium mb-1.5">
                    <span>
                      {language === "th" ? "ความคืบหน้า" : "Progress"}
                    </span>
                    <span className="text-white font-bold">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, project.progress || 0))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(WhoIsWorkingOnProjects);
