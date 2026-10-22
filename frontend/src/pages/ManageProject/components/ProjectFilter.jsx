import React from "react";
import { useTheme } from "../../../lib/ThemeContext";

const ProjectFilter = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  handleOpenCreate,
  canCreate = true,
  t,
}) => {
  const { currentAccent } = useTheme();
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          className="w-full rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-surface)",
          }}
          placeholder={t("searchProjectPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between sm:justify-end">
        {/* View Switcher Segmented Control */}
        <div 
          className="inline-flex items-center p-1 rounded-2xl border backdrop-blur-md shadow-inner gap-1"
          style={{
            background: "var(--bg-surface-hover)",
            borderColor: "var(--border-surface)",
          }}
        >
          <button
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
              viewMode === "table"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            style={viewMode === "table" ? { backgroundColor: "#4f46e5", color: "#ffffff" } : {}}
            onClick={() => setViewMode("table")}
          >
            <span className="text-sm">📋</span>
            <span>{t("tableView")}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
              viewMode === "board"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            style={viewMode === "board" ? { backgroundColor: "#4f46e5", color: "#ffffff" } : {}}
            onClick={() => setViewMode("board")}
          >
            <span className="text-sm">🗂️</span>
            <span>{t("boardView")}</span>
          </button>
        </div>

        {/* Create Button (Admin & PM only) */}
        {canCreate && (
          <button
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs glow-button whitespace-nowrap cursor-pointer shadow-md"
            onClick={handleOpenCreate}
          >
            {t("createProjectBtn")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectFilter;
