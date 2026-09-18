import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HomeHero = ({ t, isLoggedIn }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10"
        style={{
          backgroundColor: "rgba(30, 27, 75, 0.85)",
          color: "#ffffff",
        }}
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]"></span>
        </span>
        <span style={{ color: "#ffffff" }}>
          {t("landingBadge") ||
            "🚀 แพลตฟอร์มจัดการโปรเจกต์และงานสำหรับทีมยุคใหม่"}
        </span>
      </motion.div>

      <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-5xl mx-auto">
        {t("landingHeroTitle") || "บริหารจัดการโปรเจกต์และงานในทีม"}
        <span className="block mt-3 gradient-text">
          {t("landingHeroTitleAccent") || "ง่าย ครบจบในที่เดียว และเป็นระบบ"}
        </span>
      </h1>

      <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
        {t("landingHeroDesc") ||
          "ช่วยให้ทีมของคุณทำงานร่วมกันได้อย่างราบรื่น ติดตามกำหนดส่งงานผ่านปฏิทิน อัปเดตสถานะงานได้แบบเรียลไทม์ พร้อมบันทึกประวัติการทำงานของระบบอย่างเป็นระเบียบ"}
      </p>

      <div className="mt-12 flex flex-wrap justify-center gap-5">
        {isLoggedIn ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/Dashboard"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-base glow-button no-underline inline-block"
            >
              {t("goToDashboard") || "เข้าสู่หน้าแดชบอร์ด 📊"}
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/Login"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-base glow-button no-underline inline-block"
              >
                {t("getStartedBtn") || "เริ่มต้นใช้งานฟรี ✨"}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl glass-panel text-slate-200 font-semibold text-base hover:bg-slate-800/80 transition-all duration-200 no-underline inline-block"
              >
                {t("learnMoreBtn") || "เรียนรู้เพิ่มเติม"}
              </a>
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default HomeHero;
