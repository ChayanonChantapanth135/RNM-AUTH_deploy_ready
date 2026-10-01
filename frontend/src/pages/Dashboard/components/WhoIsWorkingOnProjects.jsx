import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";
import { API_URL } from "../../../config";

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
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4"
        style={{ borderColor: "var(--border-surface)" }}
      >
        <div className="flex items-center gap-3">
          {/* <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/30 border border-sky-400/30 flex items-center justify-center text-xl shadow-inner">
            <span role="img" aria-label="workers">⚡</span>
          </div> */}
          <div>
            <h3
              className="text-xl font-black tracking-wide flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span>
                {t("whoIsWorkingOnProject") ||
                  "Who is working on this project?"}
              </span>
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
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
        <div className="text-center py-12 px-4">
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
        <div className="max-h-[750px] sm:max-h-[580px] md:max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nonCompletedProjects.map((project) => {
              const allTasks = project.tasks || [];
              // ดึงเฉพาะงานที่กำลังทำอยู่ (In Progress)
              const inProgressTasks = allTasks.filter((tItem) => {
                const s = (tItem.status || "").toLowerCase().trim();
                return (
                  s === "in progress" || s === "in_progress" || s === "กำลังทำ"
                );
              });

              return (
                <div
                  key={project.id}
                  className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500/50 transition-all duration-300 group shadow-sm hover:shadow-md"
                  style={{
                    border: "1px solid var(--border-surface)",
                  }}
                >
                  <div>
                    {/* ชื่อโปรเจกต์ (Project Name) */}
                    <h4
                      // onClick={() =>
                      //   navigate(`/Projects?projectId=${project.id}`)
                      // }
                      className="text-sm font-bold transition-colors cursor-pointer truncate mb-2.5 flex items-center gap-1.5 group-hover:text-sky-500"
                      style={{ color: "var(--text-primary)" }}
                      title={project.name}
                    >
                      <span className="text-base">📁</span>
                      <span className="truncate">{project.name}</span>
                    </h4>

                    {/* รายการคนที่กำลังทำและชื่องาน (Who is working & Task name) */}
                    <div className="space-y-2">
                      {inProgressTasks.length === 0 ? (
                        <p
                          className="text-xs italic py-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {language === "th"
                            ? "ไม่มีคนกำลังทำ"
                            : "No active tasks in progress"}
                        </p>
                      ) : (
                        inProgressTasks.map((tItem) => {
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
                              className="p-2.5 rounded-xl flex items-center gap-2.5 transition-colors"
                              style={{
                                backgroundColor: "var(--bg-surface-hover)",
                                border: "none",
                              }}
                            >
                              {/* รูปโปรไฟล์ / Avatar ของคนทำ */}
                              {tItem.assigned_to_avatar ? (
                                <img
                                  src={
                                    tItem.assigned_to_avatar.startsWith("http")
                                      ? tItem.assigned_to_avatar
                                      : `${API_URL}${tItem.assigned_to_avatar}`
                                  }
                                  alt={workerName}
                                  className="w-7 h-7 rounded-full object-cover shrink-0 shadow-sm"
                                  onError={(e) => {
                                    // Fallback ซ่อนรูปแล้วแสดง fallback text เมื่อรูปโหลดไม่สำเร็จ
                                    e.currentTarget.style.display = "none";
                                    if (e.currentTarget.nextSibling) {
                                      e.currentTarget.nextSibling.style.display =
                                        "flex";
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm"
                                style={{
                                  display: tItem.assigned_to_avatar
                                    ? "none"
                                    : "flex",
                                }}
                              >
                                {workerName.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                {/* ชื่อคนทำ */}
                                <p
                                  className="text-xs font-semibold truncate leading-tight mb-0.5"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {workerName}
                                </p>
                                {/* ชื่องาน (Task) */}
                                <p
                                  className="text-[11px] truncate leading-tight"
                                  style={{ color: "var(--text-secondary)" }}
                                  title={tItem.title}
                                >
                                  {tItem.title}
                                </p>
                              </div>
                            </div>
                          );
                        })
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
};

export default React.memo(WhoIsWorkingOnProjects);
