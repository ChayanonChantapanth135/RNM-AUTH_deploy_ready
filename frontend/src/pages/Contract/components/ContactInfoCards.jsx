import React from "react";

const ContactInfoCards = ({ contactInfos, t }) => {
  return (
    <div className="lg:col-span-5 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-8 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <span>🏢</span> {t("contactInfoTitle")}
      </h2>
      <div className="flex-1 flex flex-col justify-between gap-4">
        {contactInfos.map((info, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-5 shadow-sm flex items-start gap-4 transition-all hover:-translate-y-0.5 flex-1 items-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-surface)",
            }}
          >
            <span 
              className="text-2xl p-3 rounded-xl shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                border: "1px solid var(--border-surface)",
              }}
            >
              {info.icon}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {t(info.titleKey)}
              </h3>
              <p className="text-sm font-bold mt-1 leading-relaxed break-words" style={{ color: "var(--text-primary)" }}>
                {info.valKey ? t(info.valKey) : info.val}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfoCards;
