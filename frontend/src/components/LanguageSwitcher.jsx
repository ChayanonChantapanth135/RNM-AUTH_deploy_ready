import React from "react";
import { useLanguage } from "../lib/LanguageContext";
import { motion } from "framer-motion";

/**
 * คอมโพเนนต์ตัวสลับภาษาแบบ Slide Bar (Interactive Toggle Switch Component)
 * - สวิตช์สไลด์แบบ Capsule/Pill พร้อมอนิเมชัน Framer Motion สำหรับสลับ TH ↔ EN
 * - รองรับธีม Light / Dark
 */
const LanguageSwitcher = ({ variant = "light" }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "th" ? "en" : "th");
  };

  const isEn = language === "en";
  const isDark = variant === "dark";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={isEn ? "Switch to Thai (TH)" : "Switch to English (EN)"}
      aria-label="Toggle language switch"
      className="relative inline-flex items-center h-8 w-16 p-1 transition-all duration-300 focus:outline-none select-none cursor-pointer border-0 shadow-inner"
      style={{
        borderRadius: "9999px",
        background: "var(--bg-surface-hover)",
        border: "1px solid var(--border-surface)",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Background Labels */}
      <span
        className="absolute left-2.5 text-[10px] font-black pointer-events-none select-none transition-colors"
        style={{
          color: isEn ? "var(--text-secondary)" : "var(--brand-color)",
          opacity: isEn ? 0.6 : 1,
        }}
      >
        TH
      </span>
      <span
        className="absolute right-2.5 text-[10px] font-black pointer-events-none select-none transition-colors"
        style={{
          color: isEn ? "var(--brand-color)" : "var(--text-secondary)",
          opacity: isEn ? 1 : 0.6,
        }}
      >
        EN
      </span>

      {/* Sliding Circle Thumb */}
      <motion.div
        className="w-6 h-6 shadow-md flex items-center justify-center text-[10px] font-black z-10"
        style={{
          borderRadius: "50%",
          backgroundColor: "var(--brand-color)",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
        animate={{ x: isEn ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        {isEn ? "EN" : "TH"}
      </motion.div>
    </button>
  );
};

export default LanguageSwitcher;
