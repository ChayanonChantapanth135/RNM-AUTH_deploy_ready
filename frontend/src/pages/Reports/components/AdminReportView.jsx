import React, { useState } from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { API_URL } from "../../../config";
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
  AreaChart,
  Area,
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

/* ── Reusable: Animated KPI Card ── */
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
      {/* Top accent line */}
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

/* ── Reusable: Gradient Ring Chart ── */
function CompletionRing({
  rate,
  label,
  gradientFrom = "#14b8a6",
  gradientTo = "#10b981",
  glowColor = "rgba(16,185,129,0.3)",
}) {
  const { t } = useLanguage();
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <defs>
            <linearGradient
              id={`ring-grad-${label}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--border-surface)"
            strokeWidth="3.2"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={`url(#ring-grad-${label})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={`${rate}, 100`}
            style={{
              transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)",
              // filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className="text-3xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            {rate}%
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("completed")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable: Section Wrapper ── */
function Section({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl p-8 shadow-lg ${className}`}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
        backdropFilter: "blur(16px)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, desc }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-3">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
          }}
        >
          {icon}
        </span>
        {title}
      </h3>
      {desc && <p className="text-xs text-slate-400 mt-1 ml-11">{desc}</p>}
    </div>
  );
}

/* ── Status Pill ── */
function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  let bg = "rgba(100,116,139,0.2)";
  let color = "#94a3b8";
  let dotColor = "#94a3b8";
  if (s === "completed") {
    bg = "rgba(16,185,129,0.15)";
    color = "#34d399";
    dotColor = "#10b981";
  } else if (s === "in progress" || s === "in_progress") {
    bg = "rgba(99,102,241,0.15)";
    color = "#818cf8";
    dotColor = "#6366f1";
  } else if (s === "review" || s === "reviewing") {
    bg = "rgba(245,158,11,0.15)";
    color = "#fbbf24";
    dotColor = "#f59e0b";
  } else if (s === "pending") {
    bg = "rgba(100,116,139,0.15)";
    color = "#cbd5e1";
    dotColor = "#94a3b8";
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{ background: bg, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: dotColor }}
      />
      {status}
    </span>
  );
}

const formatRole = (role) => {
  if (!role) return "-";
  const r = String(role).toLowerCase().trim();
  if (r === "admin") return "Admin";
  if (r === "manager" || r === "project_manager" || r === "project manager")
    return "Project Manager";
  if (r === "storyboard") return "Storyboard";
  if (r === "animation") return "Animation";
  if (r === "designer") return "Designer";
  if (r === "programmer") return "Programmer";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getRoleBadgeStyle = (role) => {
  const r = (role || "").toLowerCase();
  if (r.includes("admin")) return "bg-indigo-500/20 text-indigo-300";
  if (r.includes("manager")) return "bg-pink-500/20 text-pink-300";
  if (r.includes("storyboard")) return "bg-amber-500/20 text-amber-300";
  if (r.includes("animation")) return "bg-emerald-500/20 text-emerald-300";
  if (r.includes("designer")) return "bg-purple-500/20 text-purple-300";
  if (r.includes("programmer")) return "bg-cyan-500/20 text-cyan-300";
  return "bg-slate-800 text-slate-300";
};

/* ═══════════════════════════════════════════ */
/*           ADMIN REPORT VIEW                */
/* ═══════════════════════════════════════════ */
export default function AdminReportView({ data }) {
  const { t } = useLanguage();
  const {
    totalProjects,
    totalTasks,
    totalUsers,
    overallCompletionRate,
    projectStatusCounts,
    userWorkloadList,
    projects,
  } = data;

  // Table state similar to ManageUserPage
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter workload list
  const filteredWorkload = userWorkloadList.filter((user) => {
    const matchesSearch =
      (user.fullname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (user.role || "").toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const totalEntries = filteredWorkload.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredWorkload.slice(
    indexOfFirstEntry,
    indexOfLastEntry,
  );
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;

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
          label={t("allProjects")}
          value={totalProjects}
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
          value={totalTasks}
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          iconGradient="linear-gradient(135deg, #7c3aed, #a855f7)"
          label={t("totalActiveUsers")}
          value={totalUsers}
          accentColor="linear-gradient(90deg, #a855f7, #c084fc)"
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
          label={t("overallCompletionRateLabel")}
          value={`${overallCompletionRate}%`}
          valueColor="text-emerald-400"
          accentColor="linear-gradient(90deg, #10b981, #34d399)"
        />
      </div>

      {/* ── Completion Meter + Project Status Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ring / System Delivery Efficiency Card */}
        <Section className="flex flex-col justify-between">
          <div>
            <SectionTitle
              icon={
                <svg
                  className="w-4 h-4 text-emerald-400"
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
              }
              title={t("systemDeliveryEfficiency")}
              desc={t("systemDeliveryDesc")}
            />
            <div className="my-6 flex justify-center">
              <CompletionRing
                rate={overallCompletionRate}
                label="admin"
                gradientFrom="#14b8a6"
                gradientTo="#10b981"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Task stats summary list */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 ">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {t("completedTasksLabel") || "งานที่เสร็จสิ้น"}
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-400 tabular-nums">
                  {data.completedTasksCount ||
                    projects.reduce(
                      (acc, p) =>
                        acc +
                        (p.tasks?.filter(
                          (t) => (t.status || "").toLowerCase() === "completed",
                        ).length || 0),
                      0,
                    )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 ">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {t("totalTasks") || "งานทั้งหมดในระบบ"}
                  </span>
                </div>
                <span className="text-sm font-black text-indigo-300 tabular-nums">
                  {totalTasks}
                </span>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="pt-1">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-400">
                  {t("overallCompletionRateLabel") || "เปอร์เซ็นต์ความสำเร็จ"}
                </span>
                <span className="text-emerald-400 tabular-nums">
                  {overallCompletionRate}%
                </span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${overallCompletionRate}%`,
                    background: "linear-gradient(90deg, #14b8a6, #10b981)",
                    boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Status Breakdown */}
        <Section className="lg:col-span-2">
          <SectionTitle
            icon={
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            title={t("projectStatusBreakdownTitle")}
            desc={t("projectStatusBreakdownDesc")}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: t("pending"),
                count: projectStatusCounts.pending,
                color: "#94a3b8",
                bg: "rgba(100,116,139,0.1)",
              },
              {
                label: t("inProgress"),
                count: projectStatusCounts.inProgress,
                color: "#818cf8",
                bg: "rgba(99,102,241,0.1)",
              },
              {
                label: t("reviewing"),
                count: projectStatusCounts.review,
                color: "#fbbf24",
                bg: "rgba(245,158,11,0.1)",
              },
              {
                label: t("completed"),
                count: projectStatusCounts.completed,
                color: "#34d399",
                bg: "rgba(16,185,129,0.1)",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: item.bg }}
              >
                <div
                  className="w-2 h-2 rounded-full mx-auto mb-2"
                  style={{
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                  }}
                />
                <p
                  className="text-xl font-black"
                  style={{ color: item.color }}
                >
                  {item.count}
                </p>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
                  style={{ color: item.color, opacity: 0.8 }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Recharts BarChart for Project Statuses */}
          <div className="h-56 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: t("pending") || "รอดำเนินการ", count: projectStatusCounts.pending, fill: "#94a3b8" },
                  { name: t("inProgress") || "กำลังดำเนินการ", count: projectStatusCounts.inProgress, fill: "#6366f1" },
                  { name: t("reviewing") || "รอตรวจสอบ", count: projectStatusCounts.review, fill: "#f59e0b" },
                  { name: t("completed") || "เสร็จสิ้น", count: projectStatusCounts.completed, fill: "#10b981" },
                ]}
                margin={{ top: 5, right: 10, left: -25, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-secondary)"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                />
                <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {["#94a3b8", "#6366f1", "#f59e0b", "#10b981"].map((c, i) => (
                    <Cell key={`bar-admin-${i}`} fill={c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Health */}
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {projects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl p-3.5 flex items-center justify-between gap-4 transition-all duration-300 shadow-sm"
                style={{
                  background: "var(--bg-surface-hover)",
                  border: "1px solid var(--border-surface)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className="text-xs font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="text-xs font-black tabular-nums"
                      style={{ color: "var(--brand-color)" }}
                    >
                      {p.progress || 0}%
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ background: "var(--border-surface)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.progress || 0}%`,
                        background: `linear-gradient(90deg, #14b8a6, ${(p.progress || 0) > 70 ? "#10b981" : "#6366f1"})`,
                      }}
                    />
                  </div>
                </div>
                <StatusPill status={p.status} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── User Workload Table Section (Styled like ManageUserPage) ── */}
      <Section>
        <SectionTitle
          icon={
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title={t("userWorkloadMatrixTitle")}
          desc={t("userWorkloadMatrixDesc")}
        />

        {/* Top Filters Block */}
        <div
          className="rounded-2xl p-4 mb-5 shadow-sm"
          style={{
            background: "var(--bg-surface-hover)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label
                className="block text-[11px] font-bold mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("searchUser") || t("searchWork") || "ค้นหาผู้ใช้งาน"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none transition-all shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  placeholder={
                    t("searchPlaceholder") || "ค้นหาด้วยชื่อหรืออีเมล..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
              </div>
            </div>

            {/* Role Filter */}
            <div className="w-full">
              <label
                className="block text-[11px] font-bold mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("colRole") || "บทบาท"}
              </label>
              <div className="relative w-full">
                <select
                  className="w-full rounded-xl py-2.5 pl-3.5 pr-8 text-xs font-medium focus:outline-none transition-all cursor-pointer appearance-none shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">
                    {t("roleFilterAll") || "ทุกบทบาท"}
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Storyboard">Storyboard</option>
                  <option value="Animation">Animation</option>
                  <option value="Designer">Designer</option>
                  <option value="Programmer">Programmer</option>
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-4 h-4"
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

        {/* Entries Control & Pagination Info Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div
            className="flex items-center gap-2.5 text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>{t("showText") || "แสดง"}</span>
            <div className="relative inline-flex items-center">
              <select
                className="text-xs font-bold rounded-full pl-5 pr-8 py-1.5 focus:outline-none transition-all cursor-pointer appearance-none"
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                <svg
                  className="w-3.5 h-3.5 stroke-[3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <span>{t("entriesPerPageText") || "รายการ"}</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-4 px-4 text-left">{t("colUser")}</th>
                <th className="py-4 px-4 text-center">{t("colRole")}</th>
                <th className="py-4 px-4 text-center">
                  {t("assignedTasksLabel")}
                </th>
                <th className="py-4 px-4 text-center">
                  {t("completedTasksLabel")}
                </th>
                <th className="py-4 px-4 text-left">
                  {t("progressRateLabel")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
              {currentEntries.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center gap-3">
                      {item.avatar ? (
                        <img
                          src={
                            item.avatar.startsWith("http")
                              ? item.avatar
                              : `${API_URL}${item.avatar}`
                          }
                          alt={item.fullname}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                          {(item.fullname || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-white text-sm truncate leading-none">
                        {item.fullname}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeStyle(item.role)}`}
                    >
                      {formatRole(item.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-200 tabular-nums">
                    {item.assignedCount}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-400 tabular-nums">
                    {item.completedCount}
                  </td>
                  <td className="py-4 px-4 min-w-[170px]">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 rounded-full h-2 overflow-hidden shadow-inner"
                        style={{
                          background: "var(--border-surface)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.rate}%`,
                            background:
                              item.rate >= 70
                                ? "linear-gradient(90deg, #10b981, #34d399)"
                                : item.rate >= 40
                                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                  : item.rate > 0
                                    ? "linear-gradient(90deg, #ef4444, #f87171)"
                                    : "transparent",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold w-10 text-right tabular-nums"
                        style={{
                          color:
                            item.rate > 0
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                          opacity: item.rate === 0 ? 0.8 : 1,
                        }}
                      >
                        {item.rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {currentEntries.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-slate-500 py-8 text-sm"
                  >
                    {t("noUsersText") || "ไม่พบข้อมูลผู้ใช้งาน"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (Shown on mobile only, no horizontal scroll) */}
        <div className="md:hidden flex flex-col gap-3">
          {currentEntries.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/[0.04] transition-all flex flex-col gap-3"
            >
              {/* User + Role Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {item.avatar ? (
                    <img
                      src={
                        item.avatar.startsWith("http")
                          ? item.avatar
                          : `${API_URL}${item.avatar}`
                      }
                      alt={item.fullname}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-300 shrink-0">
                      {(item.fullname || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-white text-sm truncate">
                    {item.fullname}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${getRoleBadgeStyle(item.role)}`}
                >
                  {formatRole(item.role)}
                </span>
              </div>

              {/* Counts: Assigned vs Completed */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs py-1 px-2 rounded-xl bg-black/20">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t("assignedTasksLabel") || "Assigned"}</span>
                  <span className="font-black text-slate-200 text-sm">{item.assignedCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t("completedTasksLabel") || "Completed"}</span>
                  <span className="font-black text-emerald-400 text-sm">{item.completedCount}</span>
                </div>
              </div>

              {/* Progress Bar Row */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">{t("progressRateLabel") || "Progress Rate"}</span>
                  <span className="font-black text-white">{item.rate}%</span>
                </div>
                <div
                  className="w-full rounded-full h-2 overflow-hidden shadow-inner"
                  style={{
                    background: "var(--border-surface)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.rate}%`,
                      background:
                        item.rate >= 70
                          ? "linear-gradient(90deg, #10b981, #34d399)"
                          : item.rate >= 40
                            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            : item.rate > 0
                              ? "linear-gradient(90deg, #ef4444, #f87171)"
                              : "transparent",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {currentEntries.length === 0 && (
            <div className="text-center text-slate-500 py-8 text-sm">
              {t("noUsersText") || "ไม่พบข้อมูลผู้ใช้งาน"}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 text-xs"
          style={{
            borderTop: "1px solid var(--border-surface)",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            {t("showingText") || "แสดง"}{" "}
            {totalEntries === 0 ? 0 : indexOfFirstEntry + 1}{" "}
            {t("toText") || "ถึง"} {Math.min(indexOfLastEntry, totalEntries)}{" "}
            {t("ofText") || "จาก"} {totalEntries} {t("entriesText") || "รายการ"}
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
      </Section>
    </div>
  );
}
