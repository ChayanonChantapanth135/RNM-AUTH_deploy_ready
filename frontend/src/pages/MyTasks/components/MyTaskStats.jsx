import React from "react";

export default function MyTaskStats({ stats, t, language }) {
  const statItems = [
    {
      label: language === "th" ? "งานทั้งหมด" : "Total",
      value: stats.total,
      color: "text-blue-400",
      glow: "bg-blue-500/10 group-hover:bg-blue-500/20",
    },
    {
      label: t("pending") || "รอดำเนินการ",
      value: stats.pending,
      color: "text-amber-400",
      glow: "bg-amber-500/10 group-hover:bg-amber-500/20",
    },
    {
      label: t("inProgress") || "กำลังทำ",
      value: stats.inProgress,
      color: "text-indigo-400",
      glow: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    },
    {
      label: t("reviewing") || "รอตรวจสอบ",
      value: stats.reviewing,
      color: "text-purple-400",
      glow: "bg-purple-500/10 group-hover:bg-purple-500/20",
    },
    {
      label: t("completed") || "เสร็จสิ้น",
      value: stats.completed,
      color: "text-emerald-400",
      glow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statItems.map((stat, idx) => (
        <div
          key={idx}
          className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <span className={`text-2xl md:text-3xl font-black ${stat.color} block`}>
            {stat.value}
          </span>
          <p 
            className="text-xs font-semibold mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {stat.label}
          </p>
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full filter blur-xl transition-all pointer-events-none ${stat.glow}`}></div>
        </div>
      ))}
    </div>
  );
}
