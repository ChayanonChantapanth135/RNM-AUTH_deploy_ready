import React, { useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ConfirmModal from "../../components/ConfirmModal";
import { useLanguage } from "../../lib/LanguageContext";
import { getCurrentUser } from "../../lib/auth";
import { useUserManagement } from "./hooks/useUserManagement";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import ImportPreviewModal from "./components/ImportPreviewModal";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * คอมโพเนนต์หน้าจัดการผู้ใช้ของระบบ (ManageUserPage Component) - Redesigned Dark Luxe Glassmorphism Theme
 */
const ManageUserPage = () => {
  const { t, language } = useLanguage();
  const userHook = useUserManagement(t, language);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      userHook.setCurrentUser(user);
    };
    fetchUser();
  }, []);

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
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              {t("manageUsersTitle")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t("manageUsersDesc")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={userHook.handleDownloadTemplate}
              className="px-4 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white text-xs font-semibold"
            >
              📤 {t("downloadTemplateBtn")}
            </button>
            <button
              className="px-4 py-2.5 rounded-xl glass-card text-slate-300 hover:text-white text-xs font-semibold"
              onClick={() => fileInputRef.current?.click()}
            >
              📥 {t("importUsersBtn")}
            </button>
            <button
              className="px-4 py-2.5 rounded-xl glass-card text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
              onClick={userHook.handleExportExcel}
            >
              📊 {t("exportUsersBtn")}
            </button>
            <button
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs glow-button"
              onClick={userHook.handleOpenAdd}
            >
              + {t("addUserBtn")}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  userHook.handleImportFile(file);
                  e.target.value = "";
                }
              }}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
          </div>
        </div>

        {/* Top Filters Block */}
        <div className="glass-panel rounded-3xl p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative w-full">
              <select
                className="w-full rounded-2xl py-3 pl-4 pr-10 text-xs font-semibold focus:outline-none transition-all cursor-pointer appearance-none"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
                value={userHook.roleFilter}
                onChange={(e) => userHook.setRoleFilter(e.target.value)}
              >
                <option value="all">{t("roleFilterAll")}</option>
                <option value="Admin">Admin</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Storyboard">Storyboard</option>
                <option value="Animation">Animation</option>
                <option value="Designer">Designer</option>
                <option value="Programmer">Programmer</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="relative w-full">
              <select
                className="w-full rounded-2xl py-3 pl-4 pr-10 text-xs font-semibold focus:outline-none transition-all cursor-pointer appearance-none"
                style={{
                  background: "var(--bg-surface-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-surface)",
                }}
                value={userHook.statusFilter}
                onChange={(e) => userHook.setStatusFilter(e.target.value)}
              >
                <option value="all">{t("statusFilterAll")}</option>
                <option value="active">{t("activeLabel")}</option>
                <option value="suspended">{t("suspendedLabel")}</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none transition-all placeholder:text-slate-400"
                  style={{
                    background: "var(--bg-surface-hover)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-surface)",
                  }}
                  placeholder={t("searchPlaceholder")}
                  value={userHook.searchQuery}
                  onChange={(e) => userHook.setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
              </div>
            </div>
          </div>
        </div>

        {userHook.loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <UserTable
            filteredUsers={userHook.filteredUsers}
            currentUser={userHook.currentUser}
            currentPage={userHook.currentPage}
            setCurrentPage={userHook.setCurrentPage}
            entriesPerPage={userHook.entriesPerPage}
            setEntriesPerPage={userHook.setEntriesPerPage}
            t={t}
            handleOpenEdit={userHook.handleOpenEdit}
            handleToggleStatus={userHook.handleToggleStatus}
            handleDeleteUser={userHook.handleDeleteUser}
          />
        )}
      </main>

      {/* Add/Edit User Modal */}
      <UserModal
        showAddModal={userHook.showAddModal}
        setShowAddModal={userHook.setShowAddModal}
        isEditMode={userHook.isEditMode}
        isSelf={
          userHook.currentUser &&
          userHook.selectedUserId &&
          (Number(userHook.currentUser.id) ===
            Number(userHook.selectedUserId) ||
            userHook.currentUser.email?.toLowerCase() ===
              userHook.formData.email?.toLowerCase())
        }
        selectedUserId={userHook.selectedUserId}
        users={userHook.users}
        formData={userHook.formData}
        handleInputChange={userHook.handleInputChange}
        handleAvatarChange={userHook.handleAvatarChange}
        avatarPreview={userHook.avatarPreview}
        modalError={userHook.modalError}
        modalSuccess={userHook.modalSuccess}
        handleCreateOrUpdateUser={userHook.handleCreateOrUpdateUser}
        t={t}
      />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        show={userHook.showDeleteModal}
        onHide={() => userHook.setShowDeleteModal(false)}
        title={t("deleteUserConfirmTitle")}
        description={
          userHook.selectedUserForDelete && (
            <>
              {t("deleteConfirm")}{" "}
              <strong>"{userHook.selectedUserForDelete.name}"</strong>{" "}
              {t("deleteSuffix")}
            </>
          )
        }
        onConfirm={userHook.handleDeleteConfirm}
        confirmText={t("confirmDeleteBtn")}
        cancelText={t("cancelBtn")}
        type="danger"
      />

      {/* STATUS TOGGLE CONFIRM MODAL */}
      <ConfirmModal
        show={userHook.showStatusModal}
        onHide={() => userHook.setShowStatusModal(false)}
        title={
          userHook.selectedUserForStatus?.status === "active"
            ? t("suspendConfirm")
            : t("activateConfirm")
        }
        description={
          userHook.selectedUserForStatus && (
            <>
              {userHook.selectedUserForStatus.status === "active"
                ? `${t("suspendConfirm")} "${userHook.selectedUserForStatus.name}" ${t("confirmSuffix")}`
                : `${t("activateConfirm")} "${userHook.selectedUserForStatus.name}" ${t("confirmSuffix")}`}
            </>
          )
        }
        onConfirm={userHook.handleStatusConfirm}
        confirmText={t("confirmBtn")}
        cancelText={t("cancelBtn")}
        type="warning"
      />

      {/* IMPORT PREVIEW DEMO MODAL */}
      <ImportPreviewModal
        show={userHook.showImportConfirm}
        onHide={() => userHook.setShowImportConfirm(false)}
        fileName={userHook.importFileName}
        users={userHook.importUsersList}
        existingUsers={userHook.users}
        onConfirm={userHook.handleImportConfirm}
        t={t}
        loading={userHook.loading}
      />

      {/* IMPORT RESULT SUCCESS MODAL */}
      <ConfirmModal
        show={userHook.showImportResult}
        onHide={() => userHook.setShowImportResult(false)}
        title={t("importResultTitle")}
        description={
          t("importResultDesc")
            ? t("importResultDesc")
                .replace("{imported}", userHook.importResultDetails.imported)
                .replace("{updated}", userHook.importResultDetails.updated)
            : ""
        }
        onConfirm={() => userHook.setShowImportResult(false)}
        confirmText={t("confirmBtn")}
        cancelText={t("cancelBtn")}
        type="success"
      />

      <Footer />
    </div>
  );
};

export default ManageUserPage;
