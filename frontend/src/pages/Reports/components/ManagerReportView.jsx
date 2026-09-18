import React from "react";
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

export default function ManagerReportView({ data }) {
  const { t, language } = useLanguage();
  const { managedProjects, managedTasks, managerCompletionRate } = data;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortByProgress, setSortByProgress] = React.useState("none"); // "none" | "asc" | "desc"

  const onTrackCount = managedProjects.filter(
    (p) => (p.status || "").toLowerCase() !== "delayed",
  ).length;

  const filteredProjects = React.useMemo(() => {
    return managedProjects
      .filter((p) => {
        const matchSearch =
          searchQuery === "" ||
          (p.name &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.teamLeaderName &&
            p.teamLeaderName.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchStatus = true;
        if (statusFilter !== "all") {
          const s = (p.status || "").toLowerCase();
          if (statusFilter === "in progress")
            matchStatus = s === "in progress" || s === "in_progress";
          else if (statusFilter === "review")
            matchStatus = s === "review" || s === "reviewing";
          else matchStatus = s === statusFilter;
        }

        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortByProgress === "asc")
          return (a.progress || 0) - (b.progress || 0);
        if (sortByProgress === "desc")
          return (b.progress || 0) - (a.progress || 0);
        return 0;
      });
  }, [managedProjects, searchQuery, statusFilter, sortByProgress]);

  const totalEntries = filteredProjects.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);
  const currentEntries = filteredProjects.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage,
  );

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
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #0d9488, #14b8a6)"
          label={t("projectsTitle")}
          value={managedProjects.length}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #4f46e5, #6366f1)"
          label={t("totalTasks")}
          value={managedTasks.length}
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #059669, #10b981)"
          label={t("onTrackProjectsLabel")}
          value={onTrackCount}
          valueColor="text-emerald-400"
          accentColor="linear-gradient(90deg, #10b981, #34d399)"
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
          iconGradient="linear-gradient(135deg, #0891b2, #06b6d4)"
          label={t("overallCompletionRateLabel")}
          value={`${managerCompletionRate}%`}
          valueColor="text-cyan-300"
          accentColor="linear-gradient(90deg, #06b6d4, #22d3ee)"
        />
      </div>

      {/* ── Recharts Analytics for Project Manager: Project Statuses & Progress ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Donut Chart */}
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
                    "linear-gradient(135deg, rgba(8,145,178,0.2), rgba(6,182,212,0.2))",
                }}
              >
                🎯
              </span>
              {t("projectHealthStatusTitle") || "Project Status Breakdown"}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>
              {t("projectHealthStatusDesc") || "Distribution of projects by progress status"}
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            {managedProjects.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold">No Projects</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Pie
                    data={[
                      {
                        name: t("statusCompleted") || "Completed",
                        value: managedProjects.filter((p) => (p.status || "").toLowerCase() === "completed").length,
                        fill: "#10b981",
                      },
                      {
                        name: t("statusInProgress") || "In Progress",
                        value: managedProjects.filter((p) => {
                          const s = (p.status || "").toLowerCase();
                          return s === "in progress" || s === "in_progress";
                        }).length,
                        fill: "#06b6d4",
                      },
                      {
                        name: t("statusReview") || "Review",
                        value: managedProjects.filter((p) => {
                          const s = (p.status || "").toLowerCase();
                          return s === "review" || s === "reviewing";
                        }).length,
                        fill: "#f59e0b",
                      },
                      {
                        name: t("statusPending") || "Pending",
                        value: managedProjects.filter((p) => (p.status || "").toLowerCase() === "pending").length,
                        fill: "#94a3b8",
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
                      "#06b6d4",
                      "#f59e0b",
                      "#94a3b8",
                    ].map((fill, idx) => (
                      <Cell key={`pm-pie-${idx}`} fill={fill} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                {managerCompletionRate}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {t("completed") || "Rate"}
              </span>
            </div>
          </div>

          <div className="w-full rounded-full h-2 overflow-hidden mt-2" style={{ background: "var(--border-surface)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${managerCompletionRate}%`,
                background: "linear-gradient(90deg, #06b6d4, #14b8a6)",
              }}
            />
          </div>
        </div>

        {/* Project Progress Comparison Bar Chart */}
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
                📈
              </span>
              {t("projectProgressOverviewTitle") || "Project Progress & Delivery Rates"}
            </h3>
            <p className="text-xs mt-1 ml-11" style={{ color: "var(--text-secondary)" }}>
              {t("projectProgressOverviewDesc") || "Completion percentage per managed project"}
            </p>
          </div>

          <div className="h-56 w-full mt-2 overflow-x-auto overflow-y-hidden custom-scrollbar">
            {(() => {
              const projectChartData = managedProjects.map((p) => {
                const pTasks = p.tasks || [];
                const pCompleted = pTasks.filter(
                  (t) => (t.status || "").toLowerCase() === "completed",
                ).length;
                const progress =
                  pTasks.length > 0
                    ? Math.round((pCompleted / pTasks.length) * 100)
                    : p.progress || 0;

                return {
                  name: p.name?.length > 20 ? `${p.name.slice(0, 18)}...` : p.name,
                  progress: progress,
                  totalTasks: pTasks.length,
                };
              });

              if (projectChartData.length === 0) {
                return (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-slate-500 font-bold">No Projects Available</p>
                  </div>
                );
              }

              const dynamicWidth = Math.max(projectChartData.length * 90, 420);

              return (
                <div style={{ minWidth: `${dynamicWidth}px`, width: "100%", height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        stroke="var(--text-secondary)"
                        fontSize={11}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar
                        dataKey="progress"
                        name={t("colProgress") || "Progress"}
                        fill="#06b6d4"
                        radius={[6, 6, 0, 0]}
                      >
                        {projectChartData.map((entry, idx) => (
                          <Cell
                            key={`cell-pm-${idx}`}
                            fill={entry.progress >= 100 ? "#10b981" : entry.progress > 50 ? "#06b6d4" : "#6366f1"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Managed Projects Progress Table ── */}
      <div
        className="glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden mb-8"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-surface)",
          backdropFilter: "blur(16px)",
        }}
      >
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              {t("managedProjectsProgressTitle") || "Managed Projects Progress"}
            </h3>
            <p
              className="text-xs mt-1 ml-11"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("managedProjectsProgressDesc") ||
                "Monitor status, deadline, and progress meters for your managed projects"}
            </p>
          </div>

          {/* Show Entries Dropdown */}
          <div
            className="flex items-center gap-2 text-xs font-semibold self-end md:self-auto"
            style={{ color: "var(--text-secondary)" }}
          >
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
                {t("searchWork") || "ค้นหาโครงการ"}
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
                    language === "th"
                      ? "ค้นหาด้วยชื่อโครงการ หรือหัวหน้าทีม..."
                      : "Search by project name or team leader..."
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
                  {t("projectsTitle") || "PROJECT NAME"}
                </th>
                <th className="py-4 px-6">
                  {t("colTeamLeader") || "TEAM LEADER"}
                </th>
                <th className="py-4 px-6 text-center">
                  {t("taskStatusLabel") || "STATUS"}
                </th>
                <th className="py-4 px-6 text-center">
                  {t("endDateLabel") || "DUE DATE"}
                </th>
                <th
                  className="py-4 px-6 text-left cursor-pointer select-none"
                  onClick={() => {
                    if (sortByProgress === "none") setSortByProgress("desc");
                    else if (sortByProgress === "desc")
                      setSortByProgress("asc");
                    else setSortByProgress("none");
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t("colProgress") || "PROGRESS"}</span>
                    <span>
                      {sortByProgress === "none"
                        ? "⇅"
                        : sortByProgress === "desc"
                          ? "↓"
                          : "↑"}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((p) => {
                  const pTasks = p.tasks || [];
                  const pCompleted = pTasks.filter(
                    (t) => (t.status || "").toLowerCase() === "completed",
                  ).length;
                  const progress =
                    p.progress !== undefined
                      ? p.progress
                      : pTasks.length > 0
                        ? Math.round((pCompleted / pTasks.length) * 100)
                        : 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {/* Project Name */}
                      <td className="py-4 px-6 font-bold text-white whitespace-nowrap">
                        <div>
                          <span>{p.name}</span>
                          {pTasks.length > 0 && (
                            <p className="text-xs font-normal text-slate-400 mt-0.5">
                              {pTasks.length} {t("tasks") || "งาน"} (
                              {pCompleted} {t("completed") || "เสร็จสิ้น"})
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Team Leader */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-bold text-white">
                          {p.teamLeaderName || "-"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <StatusPill status={p.status} />
                      </td>

                      {/* End Date */}
                      <td className="py-4 px-6 text-center text-slate-400 font-mono whitespace-nowrap">
                        {formatDate(p.end_date || p.endDate, language)}
                      </td>

                      {/* Progress Bar & Rate */}
                      <td className="py-4 px-6 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex-1 rounded-full h-2 overflow-hidden"
                            style={{ background: "var(--border-surface)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, #14b8a6, ${progress > 70 ? "#10b981" : "#6366f1"})`,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-black tabular-nums shrink-0 text-white"
                            style={{ color: "#FFFFFF" }}
                          >
                            {progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-sm font-semibold">
                      {language === "th"
                        ? "ไม่พบโครงการในหมวดหมู่นี้"
                        : "No projects found"}
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
    </div>
  );
}
