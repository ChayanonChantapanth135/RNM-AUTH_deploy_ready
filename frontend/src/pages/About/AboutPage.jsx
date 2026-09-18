import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AboutFeatures from "./components/AboutFeatures";
import TechStackGrid from "./components/TechStackGrid";

/**
 * คอมโพเนนต์หน้าเกี่ยวกับเรา (AboutPage Component) - Clean Modular Architecture
 */
const AboutPage = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: "📊",
      titleKey: "featureAnalyticsTitle",
      descKey: "featureAnalyticsDesc",
      badge: "Analytics",
      gradient: "from-blue-500/20 to-teal-500/20",
    },
    {
      icon: "📂",
      titleKey: "featureWorkflowTitle",
      descKey: "featureWorkflowDesc",
      badge: "Workflow",
      gradient: "from-purple-500/20 to-indigo-500/20",
    },
    {
      icon: "🛡️",
      titleKey: "featureAccessTitle",
      descKey: "featureAccessDesc",
      badge: "Security",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: "⚡",
      titleKey: "featureAuditTitle",
      descKey: "featureAuditDesc",
      badge: "Audit Trail",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
  ];

  const techStack = [
    { name: "React 18", category: "Frontend Framework", icon: "⚛️" },
    { name: "Vite", category: "Build Tool & HMR", icon: "⚡" },
    { name: "Node.js & Express", category: "Backend REST API", icon: "🟢" },
    { name: "MySQL 8", category: "Relational Database", icon: "🐬" },
    { name: "Tailwind CSS", category: "Styling & Tokens", icon: "🎨" },
    { name: "Glassmorphism UI", category: "Design System", icon: "💎" },
  ];

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
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none ambient-blob-2"></div>
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none ambient-blob-3"></div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-fade-in-up relative z-10">
        {/* Hero Section */}
        <div
          className="rounded-3xl p-8 md:p-12 mb-10 shadow-xl relative overflow-hidden text-center flex flex-col items-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl flex flex-col items-center">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider mb-4 uppercase shadow-sm"
              style={{
                background: "rgba(13, 148, 136, 0.15)",
                color: "#0d9488",
                border: "1px solid rgba(13, 148, 136, 0.3)",
              }}
            >
              🚀 {t("aboutTitle")}
            </span>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("aboutTitle")}
            </h1>
            <p
              className="text-sm md:text-base leading-relaxed font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("aboutSubtitle")}
            </p>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div
          className="rounded-3xl p-8 mb-10 shadow-xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <h2
            className="text-xl md:text-2xl font-bold mb-3 flex items-center gap-3"
            style={{ color: "var(--text-primary)" }}
          >
            {t("aboutVisionTitle")}
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("aboutVisionDesc")}
          </p>
        </div>

        {/* Core Features Grid */}
        <AboutFeatures features={features} t={t} />

        {/* Tech Stack Grid */}
        <TechStackGrid techStack={techStack} t={t} />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
