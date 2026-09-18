import React from "react";

const AboutFeatures = ({ features, t }) => {
  return (
    <div className="mb-12">
      <h2
        className="text-xl md:text-2xl font-extrabold mb-6 flex items-center gap-3"
        style={{ color: "var(--text-primary)" }}
      >
        Core Platform Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-sm"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-surface)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-3xl p-3 rounded-xl group-hover:scale-110 transition-transform shadow-sm"
                style={{
                  backgroundColor: "var(--bg-surface-hover)",
                  border: "1px solid var(--border-surface)",
                }}
              >
                {f.icon}
              </span>
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold shadow-sm"
                style={{
                  backgroundColor: "var(--bg-surface-hover)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-surface)",
                }}
              >
                {f.badge}
              </span>
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {t(f.titleKey)}
            </h3>
            <p
              className="text-xs md:text-sm leading-relaxed font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {t(f.descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutFeatures;
