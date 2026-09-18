import React, { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";

const ProjectBoardView = ({
  filteredProjects,
  t,
  handleViewDetails,
  handleOpenEdit,
  handleOpenDelete,
  canManage = true,
}) => {
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-reset page to 1 when filtered dataset changes or if currentPage exceeds totalPages
  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems, itemsPerPage]);

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const startItem = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const endItem = Math.min(indexOfLastItem, totalItems);

  return (
    <div className="mb-8">
      {/* Items Per Page Dropdown Header */}
      <div className="mb-6 flex items-center">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <span>{t("showText") || "Show"}</span>
          <div className="relative">
            <select
              className="bg-slate-900/80 rounded-xl pl-3 pr-8 py-1.5 text-white text-xs focus:outline-none appearance-none font-bold cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={15}>15</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
          <span>{t("entriesPerPageText") || "Entries"}</span>
        </div>
      </div>

      {/* Grid of Project Cards */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {currentItems.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              t={t}
              handleViewDetails={handleViewDetails}
              handleOpenEdit={handleOpenEdit}
              handleOpenDelete={handleOpenDelete}
              canManage={canManage}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 mb-6">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-sm font-semibold text-slate-400">
            {t("noProjectsFound")}
          </p>
        </div>
      )}

      {/* Bottom Pagination Footer */}
      {totalPages > 1 && (
        <div className="rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <span>
            {t("showingText") || "Showing"} {totalItems === 0 ? 0 : startItem}{" "}
            {t("toText") || "to"} {endItem} {t("ofText") || "of"} {totalItems}{" "}
            {t("entriesText") || "Entries"}
          </span>

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
        </div>
      )}
    </div>
  );
};

export default ProjectBoardView;
