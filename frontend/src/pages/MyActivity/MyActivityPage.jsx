import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMyActivityLogs } from "./hooks/useMyActivityLogs";
import MyActivityFilter from "./components/MyActivityFilter";
import MyActivityTable from "./components/MyActivityTable";

/**
 * คอมโพเนนต์หน้าบันทึกกิจกรรมส่วนตัวย้อนหลัง (MyActivityPage Component) - Clean Modular Architecture
 */
const MyActivityPage = () => {
  const { t } = useLanguage();

  const {
    loading,
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    fetchLogs,
    filteredLogs,
    currentEntries,
    indexOfFirstEntry,
    indexOfLastEntry,
    totalPages,
  } = useMyActivityLogs();

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-fade-in-up relative z-10">
        {/* Header Title Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2
              className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {t("myActivity") || "My Activity"}
            </h2>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("myActivitySubtitle") ||
                "View and track your own historical actions and logs"}
            </p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="group px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
            title={t("refreshDataBtn") || t("refreshBtn") || "Refresh"}
          >
            <span className={loading ? "animate-spin" : ""}>⭮</span>
            <span>{t("refreshBtn") || "รีเฟรชข้อมูล"}</span>
          </button>
        </div>

        {/* Filters and Search Toolbar */}
        <MyActivityFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          actionFilter={actionFilter}
          setActionFilter={setActionFilter}
          setCurrentPage={setCurrentPage}
          t={t}
        />

        {/* Table View */}
        <MyActivityTable
          loading={loading}
          currentEntries={currentEntries}
          filteredLogs={filteredLogs}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          indexOfFirstEntry={indexOfFirstEntry}
          indexOfLastEntry={indexOfLastEntry}
          t={t}
        />
      </main>

      <Footer />
    </div>
  );
};

export default MyActivityPage;
