import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ── Custom Tooltip for Recharts ── */
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3.5 py-2.5 rounded-xl shadow-2xl text-xs font-bold border-0"
        style={{
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-primary)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
        }}
      >
        <p className="mb-1 text-slate-400 font-semibold">{label || payload[0]?.name}</p>
        {payload.map((item, idx) => (
          <p key={idx} className="text-xs font-extrabold flex items-center justify-between gap-4 py-0.5" style={{ color: item.color || item.fill }}>
            <span>{item.name}:</span>
            <span className="font-mono">{item.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Reusable KPI Card ── */
function KpiCard({
  icon,
  iconGradient,
  label,
  value,
  valueColor = "",
  accentColor,
}) {
  return (
    <div
      className="group relative rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 shadow-md"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: accentColor }}
      />
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: iconGradient }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className="text-[11px] font-bold uppercase tracking-wider truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </p>
          <h3
            className={`text-2xl font-black mt-0.5 ${valueColor}`}
            style={!valueColor ? { color: "var(--text-primary)" } : {}}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

/* ── Status Pill ── */
function StatusPill({ status }) {
  const { t } = useLanguage();
  const s = (status || "").toLowerCase();
  let bg = "rgba(100,116,139,0.2)";
  let color = "#94a3b8";
  let dot = "#94a3b8";
  let text = status;
  if (s === "completed") {
    bg = "rgba(16,185,129,0.15)";
    color = "#34d399";
    dot = "#10b981";
    text = t("statusCompleted") || "เสร็จสิ้น";
  } else if (s === "in progress" || s === "in_progress") {
    bg = "rgba(99,102,241,0.15)";
    color = "#818cf8";
    dot = "#6366f1";
    text = t("statusInProgress") || "กำลังดำเนินการ";
  } else if (s === "review" || s === "reviewing") {
    bg = "rgba(245,158,11,0.15)";
    color = "#fbbf24";
    dot = "#f59e0b";
    text = t("statusReview") || "รอตรวจสอบ";
  } else if (s === "pending") {
    bg = "rgba(100,116,139,0.15)";
    color = "#cbd5e1";
    dot = "#94a3b8";
    text = t("statusPending") || "รอดำเนินการ";
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{ background: bg, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {text}
    </span>
  );
}

export default function TeamLeaderReportView({ data }) {
  const { t, language } = useLanguage();
  const {
    tlProjects = [],
    tlTasks = [],
    tlCompletionRate = 0,
    tlOverdueCount = 0,
  } = data || {};

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortByPriority, setSortByPriority] = useState("none"); // "none" | "asc" | "desc"
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...(tlTasks || [])];

    // Search query filter (title, project name, or assignee name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          (task.title || task.name || "").toLowerCase().includes(q) ||
          (task.projectName || "").toLowerCase().includes(q) ||
          (task.assigned_to_name || "").toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => {
        const s = (task.status || "").toLowerCase();
        if (statusFilter === "pending") return s === "pending";
        if (statusFilter === "in progress")
          return s === "in progress" || s === "in_progress";
        if (statusFilter === "review")
          return s === "review" || s === "reviewing";
        if (statusFilter === "completed") return s === "completed";
        return true;
      });
    }

    // Sort by priority
    if (sortByPriority !== "none") {
      const priorityOrder = {
        High: 3,
        high: 3,
        Medium: 2,
        medium: 2,
        Low: 1,
        low: 1,
      };
      result.sort((a, b) => {
        const pA = priorityOrder[a.priority] || 2;
        const pB = priorityOrder[b.priority] || 2;
        return sortByPriority === "asc" ? pA - pB : pB - pA;
      });
    }

    return result;
  }, [tlTasks, searchQuery, statusFilter, sortByPriority]);

  const totalEntries = filteredTasks.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [totalEntries, entriesPerPage]);

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastEntry = safeCurrentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredTasks.slice(
    indexOfFirstEntry,
    indexOfLastEntry,
  );

  const startEntry = totalEntries === 0 ? 0 : indexOfFirstEntry + 1;
  const endEntry = Math.min(indexOfLastEntry, totalEntries);

  return (
    <div className="space-y-8">
      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #0d9488, #14b8a6)"
          label={t("projectsTitle") || "Managed Projects"}
          value={tlProjects.length}
          accentColor="linear-gradient(90deg, #14b8a6, #2dd4bf)"
        />
        <KpiCard
          icon={
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #4f46e5, #6366f1)"
          label={t("totalTasks") || "Team Tasks"}
          value={tlTasks.length}
          accentColor="linear-gradient(90deg, #6366f1, #818cf8)"
        />
        <KpiCard
          icon={
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #dc2626, #ef4444)"
          label={t("overdueTasks") || "Overdue Tasks"}
          value={tlOverdueCount}
          valueColor="text-rose-400"
          accentColor="linear-gradient(90deg, #ef4444, #f87171)"
        />
        <KpiCard
          icon={
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #059669, #10b981)"
          label={t("overallCompletionRateLabel") || "Team Completion Rate"}
          value={`${tlCompletionRate}%`}
          valueColor="text-emerald-400"
          accentColor="linear-gradient(90deg, #10b981, #34d399)"
        />
      </div>

      {/* ── Recharts Analytics for Team Leader: Workload by Member & Team Task Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Task Status Donut */}
        <div
          className="rounded-3xl p-6 flex flex-col justify-between shadow-lg"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="mb-2">
            <h3
              className="text-lg font-bold flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(20,184,166,0.2), rgba(99,102,241,0.2))",
                }}
              >
                📊
              </span>
              {t("teamStatusDistribution") || "Team Task Status"}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>
              {t("teamStatusDistributionDesc") || "Breakdown of tasks assigned across your team"}
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            {tlTasks.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold">No Task Data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Pie
                    data={[
                      {
                        name: t("statusCompleted") || "Completed",
                        value: tlTasks.filter((t) => (t.status || "").toLowerCase() === "completed").length,
                        fill: "#10b981",
                      },
                      {
                        name: t("statusInProgress") || "In Progress",
                        value: tlTasks.filter((t) => {
                          const s = (t.status || "").toLowerCase();
                          return s === "in progress" || s === "in_progress";
                        }).length,
                        fill: "#6366f1",
                      },
                      {
                        name: t("statusReview") || "Review",
                        value: tlTasks.filter((t) => {
                          const s = (t.status || "").toLowerCase();
                          return s === "review" || s === "reviewing";
                        }).length,
                        fill: "#f59e0b",
                      },
                      {
                        name: t("statusPending") || "Pending",
                        value: tlTasks.filter((t) => (t.status || "").toLowerCase() === "pending").length,
                        fill: "#94a3b8",
                      },
                      {
                        name: t("overdueTasks") || "Overdue",
                        value: tlOverdueCount,
                        fill: "#ef4444",
                      },
                    ].filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      "#10b981",
                      "#6366f1",
                      "#f59e0b",
                      "#94a3b8",
                      "#ef4444",
                    ].map((fill, idx) => (
                      <Cell key={`tl-pie-${idx}`} fill={fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                {tlCompletionRate}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {t("completed") || "Success"}
              </span>
            </div>
          </div>

          <div className="w-full rounded-full h-2 overflow-hidden mt-2" style={{ background: "var(--border-surface)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${tlCompletionRate}%`,
                background: "linear-gradient(90deg, #10b981, #14b8a6)",
              }}
            />
          </div>
        </div>

        {/* Member Workload Bar Chart */}
        <div
          className="lg:col-span-2 rounded-3xl p-6 flex flex-col justify-between shadow-lg"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="mb-2">
            <h3
              className="text-lg font-bold flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
                }}
              >
                👥
              </span>
              {t("teamMemberWorkloadTitle") || "Member Task Completion & Workload"}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>
              {t("teamMemberWorkloadDesc") || "Comparison of total tasks vs completed tasks per team member"}
            </p>
          </div>

          <div className="h-56 w-full mt-2 overflow-x-auto overflow-y-hidden custom-scrollbar">
            {(() => {
              // Group tasks by assignee
              const memberMap = {};
              tlTasks.forEach((t) => {
                const name = t.assigned_to_name || "Unassigned";
                if (!memberMap[name]) {
                  memberMap[name] = { name, total: 0, completed: 0 };
                }
                memberMap[name].total += 1;
                if ((t.status || "").toLowerCase() === "completed") {
                  memberMap[name].completed += 1;
                }
              });

              const memberData = Object.values(memberMap);

              if (memberData.length === 0) {
                return (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-slate-500 font-bold">No Member Assignment Data</p>
                  </div>
                );
              }

              const dynamicWidth = Math.max(memberData.length * 90, 420);

              return (
                <div style={{ minWidth: `${dynamicWidth}px`, width: "100%", height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={memberData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                      <Bar
                        dataKey="total"
                        name={t("assignedTasksLabel") || "Assigned"}
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="completed"
                        name={t("completedTasksLabel") || "Completed"}
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Minimal Managed Projects Progress ── */}
      {tlProjects.length > 0 && (
        <div
          className="rounded-3xl p-6 shadow-md transition-all"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                style={{
                  background: "rgba(20,184,166,0.15)",
                  color: "#14b8a6",
                }}
              >
                📁
              </span>
              <div>
                <h4
                  className="text-sm font-bold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("managedProjectsProgressTitle") ||
                    "Managed Projects Progress"}
                </h4>
              </div>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: "var(--bg-surface-hover)",
                color: "var(--text-secondary)",
              }}
            >
              {tlProjects.length} {t("projectsTitle") || "Projects"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[365px] overflow-y-auto pr-1.5 pb-1 custom-scrollbar">
            {tlProjects.map((p) => {
              const pTasks = p.tasks || [];
              const pCompleted = pTasks.filter(
                (t) => (t.status || "").toLowerCase() === "completed",
              ).length;
              const progress =
                pTasks.length > 0
                  ? Math.round((pCompleted / pTasks.length) * 100)
                  : 0;

              return (
                <div
                  key={p.id}
                  className="group rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "var(--bg-surface-hover)",
                    border: "1px solid var(--border-surface)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <h5
                        className="text-xs font-bold truncate group-hover:text-teal-400 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.name}
                      </h5>
                      <span
                        className="text-[11px] opacity-70"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {pCompleted}/{pTasks.length} {t("completed") || "done"}
                      </span>
                    </div>
                    <StatusPill status={p.status} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {t("colProgress") || "Progress"}
                      </span>
                      <span
                        className="font-mono tabular-nums font-bold"
                        style={{ color: "#FFFFFF" }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-1.5 overflow-hidden"
                      style={{ background: "var(--border-surface)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, #14b8a6, ${progress > 70 ? "#10b981" : "#6366f1"})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Team Tasks Table (Styled like ProjectTable) ── */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3
              className="text-lg font-bold flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
                }}
              >
                <svg
                  className="w-4 h-4 text-indigo-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </span>
              {t("activeTeamTasksTitle") || "Team Tasks Execution"}
            </h3>
            <p
              className="text-xs mt-1 ml-11"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("activeTeamTasksDesc") ||
                "Track tasks assigned to your team members"}
            </p>
          </div>

          {/* Show Entries Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold self-end md:self-auto">
            <span>{t("showText") || "Show"}</span>
            <div className="relative">
              <select
                className="rounded-xl pl-3 pr-8 py-1.5 text-xs focus:outline-none appearance-none font-bold cursor-pointer"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
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
              <div
                className="absolute inset-y-0 right-2 flex items-center pointer-events-none"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  className="w-3.5 h-3.5"
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
            <span>{t("entriesPerPageText") || "Entries"}</span>
          </div>
        </div>

        {/* Filters Bar: Search & Status Filter */}
        <div
          className="rounded-2xl p-4 mb-6 shadow-sm"
          style={{
            background: "var(--bg-surface-hover)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label
                className="block text-[11px] font-bold mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("searchWork") || "ค้นหางาน"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-xl py-2 pl-9 pr-3 text-xs font-medium focus:outline-none transition-all shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  placeholder={
                    t("searchWorkPlaceholder") ||
                    "ค้นหาด้วยชื่องาน หรือชื่อโปรเจกต์..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label
                className="block text-[11px] font-bold mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("taskStatusLabel") || "สถานะ"}
              </label>
              <div className="relative">
                <select
                  className="w-full rounded-xl py-2 pl-3 pr-8 text-xs font-medium focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">{t("allStatus") || "ทุกสถานะ"}</option>
                  <option value="pending">
                    {t("statusPending") || "รอดำเนินการ"}
                  </option>
                  <option value="in progress">
                    {t("statusInProgress") || "กำลังดำเนินการ"}
                  </option>
                  <option value="review">
                    {t("statusReview") || "รอตรวจสอบ"}
                  </option>
                  <option value="completed">
                    {t("statusCompleted") || "เสร็จสิ้น"}
                  </option>
                </select>
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-3.5 h-3.5"
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
          </div>
        </div>

        {/* Table Component */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-300 font-bold">
                <th className="py-4 px-6">
                  {t("taskNameLabel") || "TASK NAME"}
                </th>
                <th className="py-4 px-6">
                  {t("taskProjectLabel") || "PROJECT"}
                </th>
                <th className="py-4 px-6">
                  {t("taskAssigneeLabel") || "ASSIGNEE"}
                </th>
                <th
                  className="py-4 px-6 text-center cursor-pointer select-none"
                  onClick={() => {
                    if (sortByPriority === "none") setSortByPriority("desc");
                    else if (sortByPriority === "desc")
                      setSortByPriority("asc");
                    else setSortByPriority("none");
                  }}
                >
                  {t("priority") || "PRIORITY"}{" "}
                  <span>
                    {sortByPriority === "none"
                      ? "⇅"
                      : sortByPriority === "desc"
                        ? "↓"
                        : "↑"}
                  </span>
                </th>
                <th className="py-4 px-6 text-center">
                  {t("taskStatusLabel") || "STATUS"}
                </th>
                <th className="py-4 px-6 text-center">
                  {t("taskDueDateLabel") || "DUE DATE"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((tItem) => {
                  const statusLower = (tItem.status || "").toLowerCase();
                  const deadlineStyle = (() => {
                    const due = tItem.due_date || tItem.dueDate;
                    if (!due || statusLower === "completed") return {};
                    const now = new Date();
                    const end = new Date(due);
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

                  const priority = tItem.priority || "Medium";
                  const priorityClass =
                    priority === "High"
                      ? "bg-rose-500/20 text-rose-300"
                      : priority === "Medium"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-blue-500/20 text-blue-300";

                  return (
                    <tr
                      key={tItem.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {/* Task Name */}
                      <td
                        className="py-4 px-6 font-bold text-white rounded-l-2xl whitespace-nowrap"
                        style={deadlineStyle}
                      >
                        {tItem.title || tItem.name || "-"}
                      </td>

                      {/* Project Name */}
                      <td
                        className="py-4 px-6 text-slate-300 whitespace-nowrap"
                        style={deadlineStyle}
                      >
                        {tItem.projectName || "-"}
                      </td>

                      {/* Assignee */}
                      <td
                        className="py-4 px-6 whitespace-nowrap"
                        style={deadlineStyle}
                      >
                        <span className="font-bold text-xs">
                          {tItem.assigned_to_name || tItem.assigneeName || "-"}
                        </span>
                      </td>

                      {/* Priority Pill */}
                      <td
                        className="py-4 px-6 text-center whitespace-nowrap"
                        style={deadlineStyle}
                      >
                        <span
                          className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold ${priorityClass}`}
                        >
                          {priority}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td
                        className="py-4 px-6 text-center whitespace-nowrap"
                        style={deadlineStyle}
                      >
                        <StatusPill status={tItem.status} />
                      </td>

                      {/* Due Date */}
                      <td
                        className="py-4 px-6 text-center text-slate-400 font-mono whitespace-nowrap rounded-r-2xl"
                        style={deadlineStyle}
                      >
                        {formatDate(tItem.due_date || tItem.dueDate, language)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm font-semibold">
                      {t("noActiveTeamTasksText") || "No tasks found"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-white/5 text-xs text-slate-400">
          <span>
            {t("showingText") || "Showing"}{" "}
            {totalEntries === 0 ? 0 : startEntry} {t("toText") || "to"}{" "}
            {endEntry} {t("ofText") || "of"} {totalEntries}{" "}
            {t("entriesText") || "Entries"}
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
    </div>
  );
}
