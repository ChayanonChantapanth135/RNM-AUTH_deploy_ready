import React from "react";

export default function MyTaskFilters({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  t, 
  language 
}) {
  const statuses = ["All", "Pending", "In Progress", "Reviewing", "Completed"];

  return (
    <div 
      className="glass-panel rounded-3xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
      }}
    >
      <div className="w-full md:w-72 relative">
        <input 
          type="text" 
          placeholder={language === "th" ? "ค้นหาชื่องาน หรือ โปรเจกต์..." : "Search by task or project..."}
          className="w-full rounded-2xl px-5 py-2.5 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
          style={{
            background: "var(--bg-surface-hover)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-surface)",
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="px-4 py-2 text-xs font-bold rounded-2xl transition-all whitespace-nowrap cursor-pointer shadow-sm"
            style={{
              background: statusFilter === status ? "var(--brand-color)" : "var(--bg-surface-hover)",
              color: statusFilter === status ? "#FFFFFF" : "var(--text-secondary)",
              border: statusFilter === status ? "1px solid transparent" : "1px solid var(--border-surface)",
            }}
          >
            {status === "All" 
              ? (language === "th" ? "ทั้งหมด" : "All") 
              : t(status.charAt(0).toLowerCase() + status.slice(1)) || status}
          </button>
        ))}
      </div>
    </div>
  );
}
