import React, { useRef, useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useReportsData } from "./hooks/useReportsData";
import ReportHeader from "./components/ReportHeader";
import AdminReportView from "./components/AdminReportView";
import ManagerReportView from "./components/ManagerReportView";
import TeamLeaderReportView from "./components/TeamLeaderReportView";
import UserReportView from "./components/UserReportView";

/**
 * คอมโพเนนต์หน้ารายงานโครงการและวิเคราะห์สถิติ (Reports & Analytics Page Component)
 * - สรุปข้อมูลวิเคราะห์ สถิติ และประสิทธิภาพการทำงาน ปรับการแสดงผลตามระดับสิทธิ์ของผู้ใช้งาน (Role-Based View)
 * - รองรับปุ่มสลับมุมมอง (View Switcher) สำหรับ Project Manager และผู้ใช้ที่มีประสบการณ์เป็น Team Leader
 */
const ReportsPage = () => {
  const { t } = useLanguage();
  const reportData = useReportsData();
  const {
    loading,
    isAdmin,
    isManager,
    isTeamLeader,
    hasTlExperience,
    refreshData,
    exportToExcel,
    printReport,
  } = reportData;

  // กำหนดรายการมุมมองที่สามารถเข้าถึงได้ตามระดับสิทธิ์และประสบการณ์
  const availableViews = useMemo(() => {
    if (isAdmin) return ["admin", "manager", "team_leader", "user"];
    if (isManager) return ["manager", "team_leader", "user"];
    if (hasTlExperience) return isTeamLeader ? ["team_leader", "user"] : ["user", "team_leader"];
    return ["user"];
  }, [isAdmin, isManager, isTeamLeader, hasTlExperience]);

  // กำหนดสถานะมุมมองเริ่มต้น
  const [reportViewMode, setReportViewMode] = useState(() => {
    if (isAdmin) return "admin";
    if (isManager) return "manager";
    if (isTeamLeader) return "team_leader";
    return "user";
  });

  useEffect(() => {
    if (!availableViews.includes(reportViewMode)) {
      setReportViewMode(availableViews[0] || "user");
    }
  }, [availableViews, reportViewMode]);

  const canToggleView = availableViews.length > 1;

  // Animation Refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    // Header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }

    // Content entrance with stagger
    if (contentRef.current) {
      const sections = contentRef.current.querySelectorAll(":scope > div > div");
      if (sections.length > 0) {
        gsap.fromTo(sections,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out", delay: 0.3 }
        );
      }
    }
  }, { scope: pageRef, dependencies: [loading, reportViewMode] });

  // Role titles & descriptions dynamically adjusted based on active view mode
  let roleTitle = t("reportsHeaderTitle");
  let roleDesc = t("reportsHeaderDesc");

  if (reportViewMode === "admin") {
    roleTitle = t("adminReportTitle");
    roleDesc = t("adminReportDesc");
  } else if (reportViewMode === "manager") {
    roleTitle = t("managerReportTitle");
    roleDesc = t("managerReportDesc");
  } else if (reportViewMode === "team_leader") {
    roleTitle = t("teamLeaderReportTitle");
    roleDesc = t("teamLeaderReportDesc");
  } else if (reportViewMode === "user") {
    roleTitle = t("myTaskPerformanceSummaryTitle") || t("reportsHeaderTitle");
    roleDesc = t("myTaskPerformanceSummaryDesc") || t("reportsHeaderDesc");
  }

  return (
    <div 
      ref={pageRef} 
      className="min-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full relative z-10">
        <div ref={headerRef}>
          <ReportHeader
            roleTitle={roleTitle}
            roleDesc={roleDesc}
            onExportExcel={() => exportToExcel(reportViewMode)}
            onPrint={printReport}
            onRefresh={refreshData}
            canToggleView={canToggleView && !loading}
            availableViews={availableViews}
            reportViewMode={reportViewMode}
            setReportViewMode={setReportViewMode}
          />
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: "#14b8a6",
                  borderRightColor: "#6366f1",
                  animationDuration: "1s",
                }}
              />
              <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderBottomColor: "#a855f7",
                  borderLeftColor: "#06b6d4",
                  animationDuration: "1.5s",
                  animationDirection: "reverse",
                }}
              />
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
              Loading analytics...
            </span>
          </div>
        ) : (
          <div ref={contentRef}>
            {reportViewMode === "admin" && <AdminReportView data={reportData} />}
            {reportViewMode === "manager" && <ManagerReportView data={reportData} />}
            {reportViewMode === "team_leader" && <TeamLeaderReportView data={reportData} />}
            {reportViewMode === "user" && <UserReportView data={reportData} />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReportsPage;
