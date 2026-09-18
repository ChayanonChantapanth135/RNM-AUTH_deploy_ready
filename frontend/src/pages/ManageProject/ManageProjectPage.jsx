import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../lib/LanguageContext";
import ConfirmModal from "../../components/ConfirmModal";
import ProjectCard from "./components/ProjectCard";
import ProjectBoardView from "./components/ProjectBoardView";
import ProjectFilter from "./components/ProjectFilter";
import ProjectTable from "./components/ProjectTable";
import { useProjectManagement } from "./hooks/useProjectManagement";
import CreateProjectModal from "./components/CreateProjectModal";
import EditProjectModal from "./components/EditProjectModal";
import ProjectDetailModal from "./components/ProjectDetailModal";
import AddTaskModal from "./components/AddTaskModal";
import ViewTaskModal from "./components/ViewTaskModal";

/**
 * คอมโพเนนต์หน้าจัดการโครงการ (ManageProjectPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const ManageProjectPage = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const {
    currentUser,
    viewMode,
    setViewMode,
    sortByPriority,
    setSortByPriority,
    teamLeaders,
    users,
    searchQuery,
    setSearchQuery,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    showAddTaskModal,
    setShowAddTaskModal,
    showViewTaskModal,
    setShowViewTaskModal,
    selectedProject,
    setSelectedProject,
    selectedTask,
    setSelectedTask,
    tempStatus,
    setTempStatus,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    taskFormData,
    setTaskFormData,
    filteredProjects,
    fetchProjects,
    handleCreateSubmit,
    handleViewDetails,
    handleOpenEdit,
    handleEditSubmit,
    handleOpenDelete,
    handleDeleteConfirm,
    handleAddTaskSubmit,
  } = useProjectManagement(t);

  const userRole = (currentUser?.role || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  const canManage =
    userRole === "admin" ||
    userRole === "manager" ||
    userRole === "project_manager";

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
        {/* Header and Title */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              {t("projectManagementTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t("projectManagementDesc")}
            </p>
          </div>
        </div>

        {/* Global Toast Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border-0 text-emerald-300 text-xs font-semibold mb-6 flex items-center gap-2 shadow-lg">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border-0 text-rose-300 text-xs font-semibold mb-6 flex items-center gap-2 shadow-lg">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter panel */}
        <ProjectFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleOpenCreate={() => setShowCreateModal(true)}
          canCreate={canManage}
          t={t}
        />

        {viewMode === "table" ? (
          <ProjectTable
            filteredProjects={filteredProjects}
            t={t}
            sortByPriority={sortByPriority}
            setSortByPriority={setSortByPriority}
            handleViewDetails={handleViewDetails}
            handleOpenEdit={handleOpenEdit}
            handleOpenDelete={handleOpenDelete}
            canManage={canManage}
          />
        ) : (
          <ProjectBoardView
            filteredProjects={filteredProjects}
            t={t}
            handleViewDetails={handleViewDetails}
            handleOpenEdit={handleOpenEdit}
            handleOpenDelete={handleOpenDelete}
            canManage={canManage}
          />
        )}
      </main>

      {/* CREATE MODAL */}
      <CreateProjectModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        handleCreateSubmit={handleCreateSubmit}
        formData={formData}
        setFormData={setFormData}
        teamLeaders={teamLeaders}
        users={users}
        t={t}
      />

      {/* EDIT MODAL */}
      <EditProjectModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        handleEditSubmit={handleEditSubmit}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        teamLeaders={teamLeaders}
        users={users}
        t={t}
      />

      <ProjectDetailModal
        showDetailModal={showDetailModal}
        setShowDetailModal={(val) => {
          setShowDetailModal(val);
          if (!val) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          }
        }}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        setSelectedTask={setSelectedTask}
        setTempStatus={setTempStatus}
        setShowViewTaskModal={setShowViewTaskModal}
        setShowAddTaskModal={setShowAddTaskModal}
        canManage={canManage}
        currentUser={currentUser}
        t={t}
      />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={t("deleteProjectConfirmTitle")}
        description={
          selectedProject && (
            <>
              {t("deleteProjectConfirmDesc1")}
              <strong>"{selectedProject.name}"</strong>
              {t("deleteProjectConfirmDesc2")}
            </>
          )
        }
        onConfirm={handleDeleteConfirm}
        confirmText={t("confirmDeleteBtn")}
        cancelText={t("cancelBtn")}
        type="danger"
      />

      {/* ADD TASK MODAL */}
      <AddTaskModal
        showAddTaskModal={showAddTaskModal}
        setShowAddTaskModal={setShowAddTaskModal}
        selectedProject={selectedProject}
        taskFormData={taskFormData}
        setTaskFormData={setTaskFormData}
        users={users}
        handleAddTaskSubmit={handleAddTaskSubmit}
        t={t}
      />

      {/* VIEW TASK DETAIL MODAL */}
      <ViewTaskModal
        showViewTaskModal={showViewTaskModal}
        setShowViewTaskModal={(val) => {
          setShowViewTaskModal(val);
          if (!val) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          }
        }}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedTask={selectedTask}
        tempStatus={tempStatus}
        setTempStatus={setTempStatus}
        currentUser={currentUser}
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
        fetchProjects={fetchProjects}
        users={users}
        t={t}
      />

      <Footer />
    </div>
  );
};

export default ManageProjectPage;
