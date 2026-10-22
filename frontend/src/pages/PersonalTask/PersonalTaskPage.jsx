import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
import { usePersonalTasks } from "./hooks/usePersonalTasks";
import TaskBoard from "./components/TaskBoard";
import PersonalTaskCalendar from "./components/PersonalTaskCalendar";
import TaskModal from "./components/TaskModal";

const PersonalTaskPage = () => {
  const { language } = useLanguage();
  const { currentAccent } = useTheme();
  const [viewMode, setViewMode] = useState("board"); // "board" | "calendar"

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [currentTask, setCurrentTask] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState("todo");

  const {
    data,
    loading,
    handleDragEnd,
    createTask,
    updateTask,
    handleDeleteTask,
    handleUpdateTaskDate,
  } = usePersonalTasks();

  const isThai = language === "th";

  const handleOpenAdd = (columnId = "todo", initialDate = null) => {
    setModalMode("add");
    setActiveColumnId(columnId);
    setCurrentTask(initialDate ? { task_date: initialDate } : null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setModalMode("edit");
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (modalMode === "add") {
      const success = await createTask(activeColumnId, formData);
      if (success) setIsModalOpen(false);
    } else if (modalMode === "edit") {
      const taskId = currentTask.dbId || currentTask.id;
      const success = await updateTask(taskId, formData);
      if (success) setIsModalOpen(false);
    }
  };

  const columnTitle = data?.columns?.[activeColumnId]?.title || "";

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      {/* Background Static Blobs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none ambient-blob-1"></div>
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full pointer-events-none ambient-blob-2"></div>
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full pointer-events-none ambient-blob-3"></div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10 space-y-6">
        {/* Title Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black tracking-wide flex items-center gap-3">
              {isThai ? "งานส่วนตัวของฉัน" : "Personal Tasks"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {isThai
                ? "จัดการรายการงานส่วนตัวของคุณด้วยระบบ Kanban บอร์ด และปฏิทิน Drag & Drop"
                : "Manage your personal tasks with Kanban board & Drag-and-Drop Calendar"}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto flex-wrap gap-2.5">
            {/* View Mode Toggle Switcher */}
            <div
              className="inline-flex items-center p-1 rounded-2xl border backdrop-blur-md shadow-inner gap-1 text-xs font-bold"
              style={{
                background: "var(--bg-surface-hover)",
                borderColor: "var(--border-surface)",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === "board"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={viewMode === "board" ? { backgroundColor: "#4f46e5", color: "#ffffff" } : {}}
              >
                <span className="text-sm">📋</span>
                <span>{isThai ? "บอร์ด" : "Kanban"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  viewMode === "calendar"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={viewMode === "calendar" ? { backgroundColor: "#4f46e5", color: "#ffffff" } : {}}
              >
                <span className="text-sm">📅</span>
                <span>{isThai ? "ปฏิทิน" : "Calendar"}</span>
              </button>
            </div>

            {/* Add New Task Button */}
            <button
              onClick={() => handleOpenAdd("todo")}
              className="px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs glow-button flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap"
            >
              <span className="text-sm leading-none font-extrabold">+</span>
              <span>{isThai ? "เพิ่ม Task ใหม่" : "Add New Task"}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div>
          </div>
        ) : viewMode === "board" ? (
          <TaskBoard
            data={data}
            onDragEnd={handleDragEnd}
            onAddTask={handleOpenAdd}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <PersonalTaskCalendar
            data={data}
            onAddTask={handleOpenAdd}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskDate={handleUpdateTaskDate}
          />
        )}
      </main>

      {/* Task Modal with CustomDateInput Calendar */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={currentTask}
        columnTitle={columnTitle}
      />

      <Footer />
    </div>
  );
};

export default PersonalTaskPage;
