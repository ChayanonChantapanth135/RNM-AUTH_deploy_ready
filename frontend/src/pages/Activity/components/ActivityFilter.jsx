import React from "react";

const ActivityFilter = ({
  searchQuery,
  setSearchQuery,
  actionFilter,
  setActionFilter,
  setCurrentPage,
  t,
}) => {
  return (
    <div 
      className="glass-panel rounded-3xl p-5 mb-8 shadow-xl"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            className="w-full rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            placeholder={t("searchActivityPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="relative">
          <select
            className="w-full rounded-2xl py-3 pl-4 pr-10 text-xs font-medium focus:outline-none transition-all cursor-pointer shadow-sm appearance-none"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{t("allActivities")}</option>
            <option value="project">{t("aboutProjects")}</option>
            <option value="user">{t("aboutUsers")}</option>
            <option value="system">{t("aboutSystem")}</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;
