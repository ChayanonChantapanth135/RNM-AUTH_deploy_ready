import React, { useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Hooks & Components
import { useAllTasks } from "./hooks/useAllTasks";
import TaskStats from "./components/TaskStats";
import TaskFilters from "./components/TaskFilters";
import TaskTable from "./components/TaskTable";
import TaskPagination from "./components/TaskPagination";
import TaskDetailModal from "./components/TaskDetailModal";

/**
 * คอมโพเนนต์หน้างานทั้งหมด (All Tasks Page Component)
 * - แสดงรายการงานทั้งหมดในระบบพร้อมตัวกรอง ค้นหา และสถิติ
 * - ตกแต่งในธีม Dark Luxe Glassmorphism เข้ากับหน้า Dashboard
 */
const AllTasksPage = () => {
  const { t, language } = useLanguage();
  const pageRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  const {
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    setCurrentPage,
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    currentItems,
    totalPages,
    stats,
    showViewModal,
    setShowViewModal,
    selectedTask,
    tempStatus,
    setTempStatus,
    successMessage,
    errorMessage,
    handleManageClick,
    handleUpdateTask,
    handleDeleteTask,
    allProjectsList,
    allUsersList,
    currentUser,
    taskHistory,
    totalItems,
  } = useAllTasks();

  return (
    <div
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
        {/* หัวข้อหน้า */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-wide">
              {t("allTasks") || "งานทั้งหมด"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {language === "th"
                ? "จัดการและติดตามภารกิจทั้งหมดในโครงการของคุณ"
                : "Manage and track all tasks in your projects"}
            </p>
          </div>
          {/* <button 
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
            onClick={() => alert("ระบบสร้างงานใหม่จะมาเร็วๆ นี้")}
          >
            + {language === "th" ? "สร้างงานใหม่" : "Create New Task"}
          </button> */}
        </div>

        {/* บล็อกสถิติด่วน */}
        <TaskStats stats={stats} language={language} t={t} />

        {/* แผงควบคุม ค้นหา และกรองข้อมูล */}
        <TaskFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          setCurrentPage={setCurrentPage}
          language={language}
          t={t}
        />

        {/* รายการงานรูปแบบตารางแก้ว */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            <TaskTable
              currentItems={currentItems}
              language={language}
              t={t}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onManageClick={handleManageClick}
            />
          </>
        )}

        {/* Task Details & Status Update Modal */}
        <TaskDetailModal
          showViewModal={showViewModal}
          setShowViewModal={(val) => {
            setShowViewModal(val);
            if (!val) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
          selectedTask={selectedTask}
          tempStatus={tempStatus}
          setTempStatus={setTempStatus}
          handleUpdateTask={handleUpdateTask}
          handleDeleteTask={handleDeleteTask}
          projects={allProjectsList}
          users={allUsersList}
          currentUser={currentUser}
          taskHistory={taskHistory}
          t={t}
        />
      </main>

      <Footer />
    </div>
  );
};

export default AllTasksPage;
