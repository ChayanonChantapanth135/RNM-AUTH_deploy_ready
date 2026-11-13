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
      icon: <i className="bi bi-bar-chart-line text-teal-400"></i>,
      titleKey: "featureAnalyticsTitle",
      descKey: "featureAnalyticsDesc",
      badge: "Analytics",
      gradient: "from-blue-500/20 to-teal-500/20",
    },
    {
      icon: <i className="bi bi-kanban text-indigo-400"></i>,
      titleKey: "featureWorkflowTitle",
      descKey: "featureWorkflowDesc",
      badge: "Workflow",
      gradient: "from-purple-500/20 to-indigo-500/20",
    },
    {
      icon: <i className="bi bi-shield-check text-emerald-400"></i>,
      titleKey: "featureAccessTitle",
      descKey: "featureAccessDesc",
      badge: "Security",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: <i className="bi bi-clock-history text-cyan-400"></i>,
      titleKey: "featureAuditTitle",
      descKey: "featureAuditDesc",
      badge: "Audit Trail",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
  ];

  const techStack = [
    { name: "React 19", category: "Frontend Framework", icon: <i className="bi bi-code-slash text-sky-400"></i> },
    { name: "Vite", category: "Build Tool", icon: <i className="bi bi-lightning-charge text-amber-400"></i> },
    { name: "Node.js & Express", category: "Backend REST API", icon: <i className="bi bi-hdd-network text-emerald-400"></i> },
    { name: "MySQL / TiDB", category: "Relational Database", icon: <i className="bi bi-database text-blue-400"></i> },
    { name: "Tailwind CSS", category: "Styling", icon: <i className="bi bi-palette text-cyan-400"></i> },
    { name: "Socket.io", category: "Real-time Sync", icon: <i className="bi bi-broadcast text-purple-400"></i> },
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 animate-fade-in-up relative z-10">
        {/* Hero Section */}
        <div
          className="rounded-2xl p-8 md:p-12 mb-10 shadow-sm relative overflow-hidden text-center flex flex-col items-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
          }}
        >
          <div className="relative z-10 max-w-3xl flex flex-col items-center">
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
