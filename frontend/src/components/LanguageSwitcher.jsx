import React from "react";
import { useLanguage } from "../lib/LanguageContext";

/**
 * คอมโพเนนต์ตัวสลับภาษา (Segmented Language Switcher)
 * - ออกแบบให้แสดงผลคมชัด 100% เท่ากันบนทุกแพลตฟอร์ม (Android, iOS Safari, Desktop)
 * - ไม่มีการซ้อนทับหรือตัวหนังสือล้น
 */
const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "th" ? "en" : "th");
  };

  const isEn = language === "en";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={isEn ? "Switch to Thai (TH)" : "Switch to English (EN)"}
      aria-label="Toggle language switch"
      className="relative inline-flex items-center p-0.5 select-none cursor-pointer flex-shrink-0"
      style={{
        width: "72px",
        height: "32px",
        minWidth: "72px",
        minHeight: "32px",
        borderRadius: "9999px",
        backgroundColor: "var(--bg-surface-hover)",
        border: "1px solid var(--border-surface)",
        boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.2)",
        outline: "none",
        WebkitAppearance: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Sliding Active Pill Backdrop */}
      <div
        className="absolute top-0.5 bottom-0.5 transition-all duration-300 ease-out flex-shrink-0"
        style={{
          width: "33px",
          height: "26px",
          borderRadius: "9999px",
          backgroundColor: "var(--brand-color)",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)",
          left: isEn ? "36px" : "2px",
        }}
      />

      {/* TH Label */}
      <span
        className="relative z-10 w-1/2 text-center text-[11px] font-black tracking-tight transition-colors duration-200"
        style={{
          color: isEn ? "var(--text-secondary)" : "#ffffff",
        }}
      >
        TH
      </span>

      {/* EN Label */}
      <span
        className="relative z-10 w-1/2 text-center text-[11px] font-black tracking-tight transition-colors duration-200"
        style={{
          color: isEn ? "#ffffff" : "var(--text-secondary)",
        }}
      >
        EN
      </span>
    </button>
  );
};

export default LanguageSwitcher;
