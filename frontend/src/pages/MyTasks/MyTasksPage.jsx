import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Hooks & Sub-components
import { useMyTasks } from "./hooks/useMyTasks";
import MyTaskStats from "./components/MyTaskStats";
import MyTaskFilters from "./components/MyTaskFilters";
import MyTaskProjectGroups from "./components/MyTaskProjectGroups";
import TaskDetailModal from "../AllTasks/components/TaskDetailModal";

const MyTasksPage = () => {
  const { t, language } = useLanguage();
  const pageRef = useRef(null);

  const {
    currentUser,
    loading,
    allProjects,
    allUsers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    showViewModal,
    setShowViewModal,
    selectedTask,
    tempStatus,
    setTempStatus,
    successMessage,
    errorMessage,
    loadData,
    handleUpdateTask,
    handleDeleteTask,
    handleManageClick,
    projectGroups,
    stats,
    filteredTasks,
  } = useMyTasks();

  // Grid Stagger Entrance Animation for project cards
  useGSAP(
    () => {
      if (!loading && filteredTasks.length > 0 && pageRef.current) {
        gsap.fromTo(
          ".project-group-card",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" },
        );
      }
    },
    { scope: pageRef, dependencies: [loading, filteredTasks] },
  );

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

      {/* Background Animated Blobs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none ambient-blob-1"></div>
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none ambient-blob-2"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full pointer-events-none ambient-blob-3"></div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1
              className="text-3xl font-black tracking-wide flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              {t("myTask") || "งานของฉัน"}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {language === "th"
                ? "ติดตามภารกิจที่คุณได้รับมอบหมายและจัดหมวดหมู่ตามโครงการ"
                : "Track tasks assigned to you grouped by project"}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="group px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
            style={{
              background: "var(--bg-surface-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-surface)",
            }}
          >
            <svg
              className={`w-3.5 h-3.5 ${
                loading
                  ? "animate-spin text-teal-400"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{t("refresh") || "รีเฟรช"}</span>
          </button>
        </div>

        {/* Action Banners */}
        {successMessage && (
          <div className="mb-6 w-full py-3.5 px-5 rounded-2xl bg-[#0e3b40] text-emerald-400 text-sm font-semibold flex items-center gap-3 shadow-xl">
            <span className="w-4 h-4 rounded bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 w-full py-3.5 px-5 rounded-2xl bg-rose-950 text-rose-400 text-sm font-semibold flex items-center gap-3 shadow-xl">
            <span className="w-4 h-4 rounded bg-rose-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              ⚠️
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Task statistics */}
        <MyTaskStats stats={stats} t={t} language={language} />

        {/* Search and Filters */}
        <MyTaskFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          t={t}
          language={language}
        />

        {/* Main Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <span className="text-5xl block mb-4">🗭</span>
            <h3 className="text-xl font-bold text-white mb-2">
              {language === "th" ? "ไม่พบงานที่รับผิดชอบ" : "No Tasks Found"}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              {language === "th"
                ? "ลองเปลี่ยนตัวกรอง ค้นหาคำอื่น หรือคุณยังไม่ได้รับมอบหมายงานใด ๆ ในขณะนี้"
                : "Try changing filters, search terms or you may not have any assigned tasks currently."}
            </p>
          </div>
        ) : (
          <MyTaskProjectGroups
            projectGroups={projectGroups}
            handleManageClick={handleManageClick}
            language={language}
          />
        )}
      </main>

      <Footer />

      {/* Task Details Modal */}
      {showViewModal && selectedTask && (
        <TaskDetailModal
          showViewModal={showViewModal}
          setShowViewModal={(val) => {
            setShowViewModal(val);
            if (!val) {
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
              );
            }
          }}
          selectedTask={selectedTask}
          tempStatus={tempStatus}
          setTempStatus={setTempStatus}
          handleUpdateTask={handleUpdateTask}
          handleDeleteTask={handleDeleteTask}
          projects={allProjects}
          users={allUsers}
          currentUser={currentUser}
          t={t}
          hideEditInfoButton={true}
        />
      )}
    </div>
  );
};

export default MyTasksPage;
