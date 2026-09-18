import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDate } from "../../../lib/dateUtils";
import { getSocket } from "../../../lib/socket";

const ProjectDetailModal = ({
  showDetailModal,
  setShowDetailModal,
  selectedProject,
  setSelectedProject,
  setSelectedTask,
  setTempStatus,
  setShowViewTaskModal,
  setShowAddTaskModal,
  canManage = true,
  currentUser,
  t,
}) => {
  const { language } = useLanguage();

  // Socket.io Real-time listener specifically for open ProjectDetailModal
  useEffect(() => {
    if (!showDetailModal || !selectedProject) return;

    const socket = getSocket();
    if (!socket) return;

    const handleTaskStatusChange = (payload) => {
      const { taskId, status } = payload;
      if (!selectedProject.tasks) return;

      const hasTask = selectedProject.tasks.some((tItem) => Number(tItem.id) === Number(taskId));
      if (hasTask && setSelectedProject) {
        setSelectedProject((prev) => {
          if (!prev || !prev.tasks) return prev;
          const updatedTasks = prev.tasks.map((tItem) =>
            Number(tItem.id) === Number(taskId) ? { ...tItem, status } : tItem
          );
          const completedCount = updatedTasks.filter(
            (tItem) => tItem.status && tItem.status.toLowerCase() === "completed"
          ).length;
          const progress =
            updatedTasks.length > 0
              ? Math.round((completedCount / updatedTasks.length) * 100)
              : 0;

          return {
            ...prev,
            tasks: updatedTasks,
            progress,
          };
        });
      }
    };

    const handleProjectUpdated = (payload) => {
      if (Number(payload.projectId || payload.id) === Number(selectedProject.id) && setSelectedProject) {
        setSelectedProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            name: payload.name !== undefined ? payload.name : prev.name,
            status: payload.status !== undefined ? payload.status : prev.status,
            priority: payload.priority !== undefined ? payload.priority : prev.priority,
            endDate: payload.endDate !== undefined ? payload.endDate : prev.endDate,
            end_date: payload.endDate !== undefined ? payload.endDate : prev.end_date,
            teamLeaderId: payload.teamLeaderId !== undefined ? payload.teamLeaderId : prev.teamLeaderId,
            teamLeaderName: payload.teamLeaderName !== undefined ? payload.teamLeaderName : prev.teamLeaderName,
            team_leader_name: payload.teamLeaderName !== undefined ? payload.teamLeaderName : prev.team_leader_name,
          };
        });
      }
    };

    socket.on("task:status:updated", handleTaskStatusChange);
    socket.on("task:updated", handleTaskStatusChange);
    socket.on("project:updated", handleProjectUpdated);

    return () => {
      socket.off("task:status:updated", handleTaskStatusChange);
      socket.off("task:updated", handleTaskStatusChange);
      socket.off("project:updated", handleProjectUpdated);
    };
  }, [showDetailModal, selectedProject, setSelectedProject]);
  const userRole = (currentUser?.role || "").toLowerCase().trim().replace(/\s+/g, "_");
  const isCreatorOfProject = Number(selectedProject?.created_by) === Number(currentUser?.id);
  const isTeamLeaderOfProject =
    Number(selectedProject?.teamLeaderId) === Number(currentUser?.id) ||
    Number(selectedProject?.team_leader_id) === Number(currentUser?.id);

  // canManageProject: Admin หรือ Creator ของโปรเจกต์นี้ หรือ Manager ที่สร้างโปรเจกต์นี้
  const isManagerRole = userRole === "manager" || userRole === "project_manager";
  const canManageProject = userRole === "admin" || (isManagerRole && isCreatorOfProject) || (!isManagerRole && canManage);

  const canAddTask = canManageProject || isTeamLeaderOfProject;

  const currentUid = Number(currentUser?.id);
  const isManagerInOthersProject = isManagerRole && !isCreatorOfProject;

  // แสดงรายชื่อ Task ทั้งหมดในโปรเจกต์ แต่จะควบคุมการกดปุ่ม "View Task Detail" ตามสิทธิ์
  const displayTasks = selectedProject?.tasks || [];

  const getTaskStyle = (task) => {
    if (task.status === "Completed") return {};
    if (!task.dueDate) return {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { backgroundColor: "rgba(220, 53, 69, 0.12)" }; // light red
    } else if (diffDays <= 3) {
      return { backgroundColor: "rgba(255, 193, 7, 0.15)" }; // light yellow
    }
    return {};
  };

  return (
    <Modal
      show={showDetailModal}
      onHide={() => setShowDetailModal(false)}
      size="lg"
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        {selectedProject && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-1.5">
                <ion-icon name="folder-open-outline" style={{ fontSize: "20px" }}></ion-icon>
                <span>{t("projectDetailsTitle")}</span>
              </h5>
              <button
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              ></button>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <span className="text-muted small d-block">
                    {t("projectDetailsName")}
                  </span>
                  <strong className="fs-5 text-dark">
                    {selectedProject.name}
                  </strong>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">
                    {t("colPriority")}
                  </span>
                  <span
                    className={`badge ${selectedProject.priority === "High" ? "bg-danger" : "bg-warning text-dark"}`}
                  >
                    {selectedProject.priority}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <span className="text-muted small d-block">
                    {t("projectDetailsDueDate")}
                  </span>
                  <strong className="text-dark d-flex align-items-center gap-1">
                    <ion-icon name="calendar-outline" style={{ fontSize: "16px" }}></ion-icon>
                    <span>{formatDate(selectedProject.endDate, language)}</span>
                  </strong>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">
                    {t("projectDetailsManager")}
                  </span>
                  <span className="text-indigo-600 font-semibold d-flex align-items-center gap-1">
                    <ion-icon name="briefcase-outline" style={{ fontSize: "16px" }}></ion-icon>
                    <span>{selectedProject.projectManagerName || selectedProject.created_by_name || selectedProject.project_manager_name || "-"}</span>
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">
                    {t("projectDetailsLeader")}
                  </span>
                  <span className="text-primary fw-bold d-flex align-items-center gap-1">
                    <ion-icon name="person-outline" style={{ fontSize: "16px" }}></ion-icon>
                    <span>{selectedProject.teamLeaderName || selectedProject.team_leader_name || "-"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Detail */}
            <div className="mb-4 p-3 bg-light rounded-lg">
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold small text-muted">
                  {t("projectDetailsProgress")}
                </span>
                <span className="fw-bold text-primary">
                  {selectedProject.progress}%
                </span>
              </div>
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1.5">
                <ion-icon name="clipboard-outline" style={{ fontSize: "20px" }}></ion-icon>
                <span>{t("projectDetailsTaskList")}</span>
              </h6>
              <div
                className="list-group rounded-lg shadow-xs"
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {displayTasks && displayTasks.length > 0 ? (
                  displayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="list-group-item d-flex align-items-center justify-content-between py-3 rounded-2xl mb-1 border-0"
                      style={getTaskStyle(task)}
                    >
                      {/* Left: Task Title */}
                      <div
                        className="d-flex flex-column justify-content-center"
                        style={{ flex: 1, minWidth: "150px" }}
                      >
                        <span className="text-dark fw-medium">
                          {task.title}
                        </span>
                      </div>

                      {/* Middle: Assignee & Due Date */}
                      <div
                        className="d-flex flex-column gap-1 text-muted small"
                        style={{
                          flex: 1,
                          minWidth: "180px",
                          paddingLeft: "15px",
                        }}
                      >
                        <span className="d-block">
                          👤 {task.assigned_to_name || t("unassigned")}
                        </span>
                        {task.dueDate && (
                          <span className="d-block">📅 {formatDate(task.dueDate, language)}</span>
                        )}
                      </div>

                      {/* Middle-Right: Status Badge */}
                      <div className="ms-3" style={{ minWidth: "110px" }}>
                        <span
                          className={`badge text-xs ${
                            task.status === "Completed"
                              ? "bg-success"
                              : task.status === "Reviewing"
                                ? "bg-warning text-dark"
                                : task.status === "In Progress"
                                  ? "bg-info text-dark"
                                  : "bg-secondary"
                          }`}
                        >
                          {task.status || "Pending"}
                        </span>
                      </div>

                      {/* Right: View Task Detail Button (Fixed width container to keep alignment) */}
                      <div className="ms-3 d-flex justify-content-end" style={{ width: "125px", minWidth: "125px" }}>
                        {(() => {
                          const isAssigned =
                            Number(task.assigned_to) === currentUid ||
                            Number(task.assignedTo) === currentUid;
                          const canViewDetail = canManageProject || isTeamLeaderOfProject || isAssigned;

                          if (!canViewDetail) {
                            return null;
                          }

                          return (
                            <button
                              className="btn btn-sm btn-primary rounded-lg text-xs w-100"
                              onClick={() => {
                                setSelectedTask(task);
                                setTempStatus(task.status || "Pending");
                                setShowViewTaskModal(true);
                              }}
                            >
                              {t("viewTaskDetail")}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="list-group-item text-center py-3 text-muted text-xs">
                    {t("projectDetailsNoTasks")}
                  </div>
                )}
              </div>
            </div>

            {canAddTask && (
              <div className="d-flex gap-2 justify-content-end border-top pt-3">
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 rounded-lg"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowAddTaskModal(true);
                  }}
                >
                  + {t("Add Task")}
                </button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProjectDetailModal;
