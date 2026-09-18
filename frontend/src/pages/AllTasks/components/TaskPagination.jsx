import React from "react";

const TaskPagination = ({ currentPage, setCurrentPage, totalPages, language }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
        style={{
          background: "var(--bg-surface-hover)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-surface)",
        }}
      >
        {language === "th" ? "ก่อนหน้า" : "Previous"}
      </button>
      <span
        className="px-4 py-2 font-bold rounded-xl text-xs pagination-badge shadow-md"
        style={{
          background: "var(--brand-color)",
          color: "#FFFFFF",
        }}
      >
        {language === "th" ? "หน้า" : "Page"} {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer shadow-sm hover:shadow-md"
        style={{
          background: "var(--bg-surface-hover)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-surface)",
        }}
      >
        {language === "th" ? "ถัดไป" : "Next"}
      </button>
    </div>
  );
};

export default TaskPagination;
