import React from "react";
import { useLanguage } from "../lib/LanguageContext";
import { motion } from "framer-motion";

/**
 * คอมโพเนนต์ตัวสลับภาษา (Language Switcher Segmented Control)
 * - รองรับ Safari / iOS WebKit สมบูรณ์ 100% (ไม่มีตัวหนังสือล้น หรือเบี้ยว)
 * - สวิตช์สไลด์แบบ Capsule/Pill ปรับขนาดให้พอดี
 */
const LanguageSwitcher = ({ variant = "light" }) => {
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
      className="relative inline-flex items-center justify-between p-1 transition-all duration-300 focus:outline-none select-none cursor-pointer flex-shrink-0"
      style={{
        width: "68px",
        height: "32px",
        minWidth: "68px",
        minHeight: "32px",
        borderRadius: "9999px",
        backgroundColor: "var(--bg-surface-hover)",
        border: "1px solid var(--border-surface)",
        boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.2)",
        WebkitAppearance: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Sliding Active Pill */}
      <motion.div
        className="absolute top-1 bottom-1 flex items-center justify-center text-[11px] font-black z-10"
        style={{
          width: "28px",
          height: "22px",
          borderRadius: "9999px",
          backgroundColor: "var(--brand-color)",
          color: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          left: "4px",
        }}
        animate={{ x: isEn ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isEn ? "EN" : "TH"}
      </motion.div>

      {/* Label TH (Left) */}
      <span
        className="w-[28px] text-center text-[10px] font-extrabold transition-opacity z-0 pointer-events-none"
        style={{
          color: "var(--text-secondary)",
          opacity: isEn ? 0.7 : 0,
          marginLeft: "2px",
        }}
      >
        TH
      </span>

      {/* Label EN (Right) */}
      <span
        className="w-[28px] text-center text-[10px] font-extrabold transition-opacity z-0 pointer-events-none"
        style={{
          color: "var(--text-secondary)",
          opacity: isEn ? 0 : 0.7,
          marginRight: "2px",
        }}
      >
        EN
      </span>
    </button>
  );
};

export default LanguageSwitcher;
