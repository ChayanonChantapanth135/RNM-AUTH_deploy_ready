import React from "react";

const TechStackGrid = ({ techStack, t }) => {
  return (
    <div
      className="rounded-3xl p-8 shadow-xl"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-surface)",
      }}
    >
      <h2
        className="text-xl md:text-2xl font-extrabold mb-6 flex items-center gap-3"
        style={{ color: "var(--text-primary)" }}
      >
        {t("techStackTitle")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {techStack.map((tech, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-4 text-center transition-all hover:scale-105 shadow-sm"
            style={{
              backgroundColor: "var(--bg-surface-hover)",
              border: "1px solid var(--border-surface)",
            }}
          >
            <div className="text-2xl mb-2">{tech.icon}</div>
            <div
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {tech.name}
            </div>
            <div
              className="text-[10px] font-semibold mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {tech.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackGrid;
