import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HomeHero from "./components/HomeHero";
import HomeFeatures from "./components/HomeFeatures";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * คอมโพเนนต์หน้าแรก (HomePage Component) - Clean Modular Architecture
 */
const HomePage = () => {
  const { t } = useLanguage();
  const isLoggedIn = !!localStorage.getItem("userToken");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      {/* Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full pointer-events-none ambient-blob-1"></div>
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none ambient-blob-2"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none ambient-blob-3"></div>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <HomeHero t={t} isLoggedIn={isLoggedIn} />

        {/* Highlight Stats */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="glass-panel rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-2xl">
              <motion.div whileHover={{ y: -5 }} className="p-4 transition-all">
                <div className="text-5xl font-extrabold gradient-text mb-2">10x</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {t("statProductivity") || "เพิ่มประสิทธิภาพการทำงาน"}
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="p-4 border-y md:border-y-0 md:border-x border-slate-800 transition-all">
                <div className="text-5xl font-extrabold gradient-text-emerald mb-2">100%</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {t("statAlignment") || "ทีมทำงานสอดคล้องกัน 100%"}
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="p-4 transition-all">
                <div className="text-5xl font-extrabold text-pink-400 mb-2">0</div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  {t("statMissedDeadlines") || "ลดการส่งงานล่าช้ากว่ากำหนด"}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <HomeFeatures t={t} containerVariants={containerVariants} itemVariants={itemVariants} />

        {/* CTA Bottom Banner */}
        <section className="py-20 px-6 relative">
          <div className="max-w-5xl mx-auto glass-panel rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              {t("landingCtaTitle") || "พร้อมที่จะยกระดับการทำงานของทีมคุณแล้วหรือยัง?"}
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-base leading-relaxed">
              {t("landingCtaDesc") || "เริ่มต้นจัดการโปรเจกต์ของคุณอย่างเป็นระบบตั้งแต่วันนี้ ใช้งานได้ฟรี!"}
            </p>
            {isLoggedIn ? (
              <Link
                to="/Dashboard"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold shadow-xl text-base glow-button no-underline inline-block"
              >
                {t("goToDashboard") || "ไปที่แดชบอร์ดเลย 📊"}
              </Link>
            ) : (
              <Link
                to="/Login"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold shadow-xl text-base glow-button no-underline inline-block"
              >
                {t("getStartedBtn") || "เริ่มต้นสมัครใช้งานฟรี ✨"}
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
