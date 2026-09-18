import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import SearchableUserSelect from "../../../components/SearchableUserSelect";
import CustomDateInput from "../../../components/CustomDateInput";
import { useLanguage } from "../../../lib/LanguageContext";
import { formatDateTime, formatDate } from "../../../lib/dateUtils";
import { getSocket } from "../../../lib/socket";

const TaskDetailModal = ({
  showViewModal,
  setShowViewModal,
  selectedTask,
  tempStatus,
  setTempStatus,
  handleUpdateTask,
  handleDeleteTask,
  projects = [],
  users = [],
  currentUser,
  t,
  hideEditInfoButton = false,
}) => {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
    projectId: "",
    status: "",
  });

  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchComments = async () => {
    if (!selectedTask) return;
    try {
      const response = await axios.get(
        `/auth/tasks/${selectedTask.id}/comments`,
      );
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchFiles = async () => {
    if (!selectedTask) return;
    try {
      const response = await axios.get(`/auth/tasks/${selectedTask.id}/files`);
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const fetchStatusHistory = async () => {
    if (!selectedTask) return;
    try {
      const response = await axios.get(
        `/auth/tasks/${selectedTask.id}/status-history`,
      );
      setStatusHistory(response.data);
    } catch (err) {
      console.error("Error fetching status history:", err);
    }
  };

  // Socket.io Real-time listener for comments, files, and status updates in this modal
  useEffect(() => {
    if (!showViewModal || !selectedTask) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewComment = (payload) => {
      if (Number(payload.taskId) === Number(selectedTask.id)) {
        fetchComments();
      }
    };

    const handleNewFile = (payload) => {
      if (Number(payload.taskId) === Number(selectedTask.id)) {
        fetchFiles();
      }
    };

    const handleStatusUpdated = (payload) => {
      if (Number(payload.taskId) === Number(selectedTask.id)) {
        if (payload.status) {
          setTempStatus(payload.status);
          setFormData((prev) => ({ ...prev, status: payload.status }));
        }
        fetchStatusHistory();
      }
    };

    const handleTaskUpdated = (payload) => {
      if (Number(payload.taskId) === Number(selectedTask.id)) {
        if (payload.status) {
          setTempStatus(payload.status);
          selectedTask.status = payload.status;
        }
        if (payload.title !== undefined) selectedTask.title = payload.title;
        if (payload.description !== undefined) selectedTask.description = payload.description;
        if (payload.priority !== undefined) selectedTask.priority = payload.priority;
        if (payload.dueDate !== undefined) {
          selectedTask.dueDate = payload.dueDate;
          selectedTask.due_date = payload.dueDate;
          selectedTask.displayDueDate = formatDate(payload.dueDate, language);
        }
        if (payload.assignedTo !== undefined) {
          selectedTask.assignedTo = payload.assignedTo;
          selectedTask.assigned_to = payload.assignedTo;
          const assignedUser = users.find((u) => Number(u.id) === Number(payload.assignedTo));
          const assignedName = assignedUser ? (assignedUser.fullname || assignedUser.username) : "Unassigned";
          selectedTask.assignee = assignedName;
          selectedTask.assigned_to_name = assignedName;
        }
        if (payload.taskType !== undefined) {
          selectedTask.taskType = payload.taskType;
          selectedTask.task_type = payload.taskType;
        }

        setFormData((prev) => ({
          ...prev,
          status: payload.status !== undefined ? payload.status : prev.status,
          title: payload.title !== undefined ? payload.title : prev.title,
          description: payload.description !== undefined ? payload.description : prev.description,
          priority: payload.priority !== undefined ? payload.priority : prev.priority,
          dueDate: payload.dueDate !== undefined ? payload.dueDate : prev.dueDate,
          assignedTo: payload.assignedTo !== undefined ? payload.assignedTo : prev.assignedTo,
          taskType: payload.taskType !== undefined ? payload.taskType : prev.taskType,
        }));

        fetchStatusHistory();
      }
    };

    socket.on("task:comment:new", handleNewComment);
    socket.on("task:file:new", handleNewFile);
    socket.on("task:status:updated", handleStatusUpdated);
    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:comment:new", handleNewComment);
      socket.off("task:file:new", handleNewFile);
      socket.off("task:status:updated", handleStatusUpdated);
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [showViewModal, selectedTask]);

  useEffect(() => {
    if (selectedTask) {
      const rawDate = selectedTask.rawDueDate || selectedTask.due_date || selectedTask.dueDate;
      let isoDueDate = "";
      if (rawDate && rawDate !== "-") {
        const str = String(rawDate).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
          isoDueDate = str;
        } else if (str.includes("T")) {
          isoDueDate = str.split("T")[0];
        } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
          const [d, m, y] = str.split("/");
          let yearNum = parseInt(y, 10);
          if (yearNum > 2400) yearNum -= 543;
          isoDueDate = `${yearNum}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      }

      setFormData({
        title: selectedTask.title || "",
        description: selectedTask.description || "",
        taskType: selectedTask.taskType || "",
        priority: selectedTask.priority || "Medium",
        dueDate: isoDueDate,
        assignedTo: selectedTask.assignedTo || "",
        projectId: selectedTask.projectId || "",
        status: selectedTask.status || "Pending",
      });
      setTempStatus(selectedTask.status || "Pending");
      setIsEditing(false);

      if (showViewModal) {
        fetchComments();
        fetchFiles();
        fetchStatusHistory();
      }
    }
  }, [selectedTask, showViewModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    try {
      await axios.post(`/auth/tasks/${selectedTask.id}/comments`, {
        comment: newComment,
        userId: currentUser?.id,
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTask) return;

    const fileFormData = new FormData();
    fileFormData.append("file", file);
    fileFormData.append("uploadedBy", currentUser?.id);

    try {
      setUploading(true);
      await axios.post(`/auth/tasks/${selectedTask.id}/files`, fileFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchFiles();
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatusOnly = async () => {
    if (!selectedTask) return;
    try {
      await axios.put(`/auth/tasks/${selectedTask.id}/status`, {
        status: tempStatus,
        userId: currentUser?.id,
      });

      // Refresh history in current modal
      fetchStatusHistory();

      // Refresh parent page list
      if (typeof handleUpdateTask === "function") {
        // If handleUpdateTask can be called or parent reloads, we call it if needed, or if loadData
      }

      // Show Toast Popup at bottom-right without closing modal
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: language === "th" ? "อัปเดตสถานะงานสำเร็จ" : "Status updated successfully",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#1e293b",
        color: "#ffffff",
        customClass: {
          popup: "rounded-2xl shadow-2xl border border-slate-700",
        },
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: language === "th" ? "ไม่สามารถอัปเดตสถานะได้" : "Failed to update status",
        showConfirmButton: false,
        timer: 3000,
        background: "#1e293b",
        color: "#ffffff",
      });
    }
  };

  const onSave = async () => {
    if (!selectedTask) return;
    try {
      const typeValue =
        formData.taskType === "อื่นๆ"
          ? formData.customTaskType
          : formData.taskType;

      const payload = {
        title: formData.title,
        description: formData.description,
        taskType: typeValue,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo ? Number(formData.assignedTo) : null,
        projectId: formData.projectId || selectedTask.projectId,
        status: tempStatus,
        userId: currentUser?.id,
      };

      await axios.put(`/auth/tasks/${selectedTask.id}`, payload);

      const assignedUser = users.find(
        (u) => Number(u.id) === Number(formData.assignedTo)
      );
      const assignedName = assignedUser
        ? assignedUser.fullname || assignedUser.username
        : "Unassigned";

      // Directly update selectedTask object in real-time for immediate UI update in modal
      selectedTask.title = formData.title;
      selectedTask.description = formData.description;
      selectedTask.taskType = typeValue;
      selectedTask.task_type = typeValue;
      selectedTask.priority = formData.priority;
      selectedTask.dueDate = formData.dueDate;
      selectedTask.due_date = formData.dueDate;
      selectedTask.displayDueDate = formatDate(formData.dueDate, language);
      selectedTask.assignedTo = formData.assignedTo;
      selectedTask.assigned_to = formData.assignedTo;
      selectedTask.assignee = assignedName;
      selectedTask.assigned_to_name = assignedName;
      selectedTask.status = tempStatus;

      setIsEditing(false);
      fetchStatusHistory();

      // Show Toast Popup at bottom-right without closing modal
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: language === "th" ? "บันทึกการแก้ไขสำเร็จ" : "Changes saved successfully",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#1e293b",
        color: "#ffffff",
        customClass: {
          popup: "rounded-2xl shadow-2xl border border-slate-700",
        },
      });
    } catch (err) {
      console.error("Failed to update task details:", err);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: language === "th" ? "ไม่สามารถบันทึกข้อมูลงานได้" : "Failed to save changes",
        showConfirmButton: false,
        timer: 3000,
        background: "#1e293b",
        color: "#ffffff",
      });
    }
  };

  const formatTaskType = (type) => {
    if (!type) return "";
    if (type === "แปล" || type === "Translate") return t("taskTypeTranslate") || "Translate";
    if (type === "สตอรี่บอร์ด" || type === "Storyboard & Script") return t("taskTypeStoryboard") || "Storyboard & Script";
    if (type === "ออกแบบ" || type === "Graphic & Design") return t("taskTypeGraphicDesign") || "Graphic & Design";
    if (type === "อนิเมชัน" || type === "Animation") return t("taskTypeAnimation") || "Animation";
    if (type === "ตัดต่อ" || type === "Video Editing" || type === "Video Edit") return t("taskTypeVideoEdit") || "Video Edit";
    if (type === "พัฒนาโปรแกรม" || type === "Development") return t("taskTypeDevelopment") || "Development";
    if (type === "อื่นๆ" || type === "Others") return t("taskTypeOthers") || "Others";
    return type;
  };

  const formatPriority = (p) => {
    if (!p) return "";
    const lower = String(p).toLowerCase();
    if (lower === "high") return t("priorityHigh") || "High";
    if (lower === "medium") return t("priorityMedium") || "Medium";
    if (lower === "low") return t("priorityLow") || "Low";
    return p;
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") return "bg-success text-white";
    if (s === "in progress" || s === "in_progress")
      return "bg-primary text-white";
    if (s === "reviewing" || s === "review") return "bg-warning text-dark";
    return "bg-secondary text-white";
  };

  const translateStatus = (status) => {
    const s = String(status || "").toLowerCase().trim();
    if (language === "th") {
      if (s === "completed" || s === "เสร็จสมบูรณ์") return "เสร็จสมบูรณ์";
      if (s === "in progress" || s === "in_progress" || s === "กำลังทำ") return "กำลังทำ";
      if (s === "reviewing" || s === "review" || s === "รอตรวจสอบ") return "รอตรวจสอบ";
      return "รอดำเนินการ";
    } else {
      if (s === "completed" || s === "เสร็จสมบูรณ์") return "Completed";
      if (s === "in progress" || s === "in_progress" || s === "กำลังทำ") return "In Progress";
      if (s === "reviewing" || s === "review" || s === "รอตรวจสอบ") return "Reviewing";
      return "Pending";
    }
  };

  return (
    <Modal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      size="lg"
      centered
    >
      <Modal.Body className="p-4" style={{ borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h5 className="fw-bold mb-0 text-slate-900 d-flex align-items-center gap-1.5">
            {isEditing ? (
              <>
                <ion-icon name="create-outline" style={{ fontSize: "20px" }}></ion-icon>
                <span>{language === "th" ? "แก้ไขข้อมูลงาน" : "Edit Task Info"}</span>
              </>
            ) : (
              <>
                <ion-icon name="search-outline" style={{ fontSize: "20px" }}></ion-icon>
                <span>{t("taskDetailsTitle") || "Task Details"}</span>
              </>
            )}
          </h5>
          <div className="d-flex gap-2">
            {!isEditing && !hideEditInfoButton && (
              <button
                className="btn btn-sm btn-primary px-3 py-1 rounded-xl text-xs fw-bold text-white shadow-sm d-flex align-items-center gap-1"
                onClick={() => setIsEditing(true)}
              >
                <ion-icon name="create-outline" style={{ fontSize: "15px" }}></ion-icon>
                <span>{language === "th" ? "แก้ไขข้อมูล" : "Edit Task"}</span>
              </button>
            )}
            <button
              className="btn-close"
              onClick={() => setShowViewModal(false)}
            ></button>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Task Details */}
          <div className="col-lg-6 border-end pe-lg-4">
            {/* Project Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskProjectLabel") || "Project"}
              </label>
              {isEditing ? (
                <select
                  name="projectId"
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.projectId}
                  onChange={handleInputChange}
                >
                  <option value="">{language === "th" ? "เลือกโครงการ..." : "Select project..."}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? selectedTask.project : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Title / Task Name */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskNameLabel") || "Task Name"}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  className="form-control rounded-lg text-sm py-2"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? selectedTask.title : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Task Type */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskTypeLabel") || "Task Type"}
              </label>
              {isEditing ? (
                <select
                  name="taskType"
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.taskType}
                  onChange={handleInputChange}
                >
                  <option value="แปล">{t("taskTypeTranslate") || "แปล"}</option>
                  <option value="สตอรี่บอร์ด">{t("taskTypeStoryboard") || "สตอรี่บอร์ด"}</option>
                  <option value="ออกแบบ">{t("taskTypeGraphicDesign") || "ออกแบบ"}</option>
                  <option value="อนิเมชัน">{t("taskTypeAnimation") || "อนิเมชัน"}</option>
                  <option value="ตัดต่อ">
                    {t("taskTypeVideoEdit") || "ตัดต่อ"}
                  </option>
                  <option value="พัฒนาโปรแกรม">{t("taskTypeDevelopment") || "พัฒนาโปรแกรม"}</option>
                  <option value="อื่นๆ">
                    {t("taskTypeOthers") || "อื่นๆ"}
                  </option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={
                    selectedTask ? formatTaskType(selectedTask.taskType) : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDescLabel") || "Description"}
              </label>
              {isEditing ? (
                <textarea
                  name="description"
                  className="form-control rounded-lg text-sm py-2"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              ) : (
                <textarea
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  rows="3"
                  value={
                    selectedTask
                      ? selectedTask.description ||
                        t("noDescription") ||
                        "No description provided."
                      : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskPriorityLabel") || "Priority"}
              </label>
              {isEditing ? (
                <select
                  name="priority"
                  className="form-select rounded-lg text-sm py-2"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">{t("priorityLow") || "Low"}</option>
                  <option value="Medium">
                    {t("priorityMedium") || "Medium"}
                  </option>
                  <option value="High">{t("priorityHigh") || "High"}</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={
                    selectedTask ? formatPriority(selectedTask.priority) : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Due Date */}
            <div className="mb-3" lang={language === "th" ? "th-TH" : "en-GB"}>
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskDueDateLabel") || "Due Date"}
              </label>
              {isEditing ? (
                <CustomDateInput
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={selectedTask ? formatDate(selectedTask.dueDate || selectedTask.due_date, language) : ""}
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Assignee */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskAssigneeLabel") || "Assignee"}
              </label>
              {isEditing ? (
                <SearchableUserSelect
                  users={users}
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  allowedRoles={["manager", "project_manager", "storyboard", "animation", "designer", "programmer"]}
                  placeholder={`-- ${t("selectAssignee") || "Select Assignee"} --`}
                />
              ) : (
                <input
                  type="text"
                  className="form-control bg-light rounded-lg text-muted text-sm py-2"
                  value={
                    selectedTask
                      ? selectedTask.assignee || t("noAssignee") || "Unassigned"
                      : ""
                  }
                  readOnly
                  disabled
                />
              )}
            </div>

            {/* Task Status */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted mb-1">
                {t("taskStatusLabel") || "Status"}
              </label>
              <select
                className="form-select rounded-lg text-sm py-2 font-semibold"
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
              >
                <option value="Pending">
                  {t("taskStatusPending") || "Pending"}
                </option>
                <option value="In Progress">
                  {t("taskStatusInProgress") || "In Progress"}
                </option>
                <option value="Reviewing">
                  {t("taskStatusReviewing") || "Reviewing"}
                </option>
                <option value="Completed">
                  {t("taskStatusCompleted") || "Completed"}
                </option>
              </select>
            </div>
          </div>

          {/* Right Column: Files, Comments, History */}
          <div className="col-lg-6 ps-lg-4 d-flex flex-column gap-3 justify-content-between">
            {/* ไฟล์แนบ */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-slate-800 text-sm">
                  {language === "th" ? "ไฟล์แนบ" : "Attachments"} ({files.length})
                </span>
                <input
                  type="file"
                  className="d-none"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary px-3 rounded-xl text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (language === "th" ? "กำลังอัปโหลด..." : "Uploading...") : (language === "th" ? "📤 อัปโหลด" : "📤 Upload")}
                </button>
              </div>

              <div className="border rounded-xl p-2.5 bg-slate-50 max-h-[110px] overflow-y-auto">
                {files.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="d-flex justify-content-between align-items-center text-xs pb-1 border-bottom last:border-0 last:pb-0"
                      >
                        <a
                          href={`${axios.defaults.baseURL || "http://127.0.0.1:3000"}${file.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-truncate fw-bold text-primary"
                          style={{ maxWidth: "70%" }}
                        >
                          📎 {file.filename}
                        </a>
                        <span
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          {language === "th" ? "โดย" : "by"} {file.fullname || file.username}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted text-xs py-3">
                    {language === "th" ? "ไม่มีไฟล์แนบ" : "No attachments"}
                  </div>
                )}
              </div>
            </div>

            {/* ความคิดเห็น */}
            <div>
              <span className="fw-bold text-slate-800 text-sm mb-2 d-block">
                {language === "th" ? "ความคิดเห็น" : "Comments"} ({comments.length})
              </span>

              <form onSubmit={handleAddComment} className="mb-2">
                <textarea
                  className="form-control text-sm rounded-lg mb-2"
                  rows="2"
                  placeholder={language === "th" ? "เขียนความคิดเห็น..." : "Write a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-3 text-xs text-white d-inline-flex align-items-center gap-1"
                >
                  <ion-icon name="send-outline" style={{ fontSize: "14px" }}></ion-icon>
                  <span>{language === "th" ? "ส่งความคิดเห็น" : "Send Comment"}</span>
                </button>
              </form>

              <div className="border rounded-xl p-3 bg-slate-50 max-h-[165px] overflow-y-auto d-flex flex-column gap-2.5 shadow-inner">
                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="text-xs pb-2.5 border-bottom last:border-0 last:pb-0"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark">
                          {c.fullname || c.username} ({c.role})
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          {formatDateTime(c.created_at, language)}
                        </span>
                      </div>
                      <p className="mb-0 text-secondary" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted text-xs py-6">
                    {language === "th" ? "ยังไม่มีความคิดเห็น" : "No comments yet"}
                  </div>
                )}
              </div>
            </div>

            {/* ประวัติการเปลี่ยนสถานะ */}
            <div className="d-flex flex-column flex-grow-1">
              <span className="fw-bold text-slate-800 text-sm mb-2 d-flex align-items-center gap-1.5">
                <ion-icon name="time-outline" style={{ fontSize: "18px" }}></ion-icon>
                <span>{language === "th" ? "ประวัติการเปลี่ยนสถานะ" : "Status History"}</span>
              </span>

              <div className="border rounded-xl p-3 bg-slate-50 flex-grow-1 min-h-[180px] max-h-[220px] overflow-y-auto">
                {statusHistory.length > 0 ? (
                  <div className="position-relative ps-3 border-start">
                    {[...statusHistory].reverse().map((h, revIndex) => {
                      const origIndex = statusHistory.length - 1 - revIndex;
                      const prevStatus = origIndex > 0 ? statusHistory[origIndex - 1].status : null;
                      return (
                        <div
                          key={h.id || revIndex}
                          className="mb-3 position-relative text-xs"
                        >
                          {/* Dot on the timeline */}
                          <div
                            className="position-absolute rounded-circle"
                            style={{
                              width: "10px",
                              height: "10px",
                              left: "-21px",
                              top: "4px",
                              backgroundColor: "#14b8a6",
                              border: "2px solid #fff",
                            }}
                          ></div>
                          <div>
                            <span className="fw-bold text-dark">
                              {h.fullname || h.username || "System"}
                            </span>{" "}
                            {language === "th" ? "เปลี่ยนสถานะ" : "changed status"}
                            {prevStatus ? (
                              <>
                                {" "}
                                {language === "th" ? "จาก" : "from"}{" "}
                                <span
                                  className={`badge px-2 py-0.5 rounded ${getStatusBadgeClass(prevStatus)}`}
                                >
                                  {translateStatus(prevStatus)}
                                </span>{" "}
                                <span className="text-muted">{language === "th" ? "เป็น" : "to"}</span>{" "}
                              </>
                            ) : (
                              language === "th" ? " เป็น " : " to "
                            )}
                            <span
                              className={`badge px-2 py-0.5 rounded ${getStatusBadgeClass(h.status)}`}
                            >
                              {translateStatus(h.status)}
                            </span>
                          </div>
                          <div
                            className="text-muted mt-1 font-mono"
                            style={{ fontSize: "10px" }}
                          >
                            {formatDateTime(h.changed_at, language)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted text-xs py-4">
                    {language === "th" ? "ยังไม่มีประวัติการเปลี่ยนสถานะ" : "No status history yet"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer at the bottom of Modal.Body (spans full width) */}
        <div className="d-flex justify-content-between align-items-center gap-3 pt-3 border-top mt-4">
          {currentUser?.role === "admin" && selectedTask ? (
            <button
              type="button"
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full text-xs font-bold whitespace-nowrap border border-red-500/30 transition-all shadow-sm d-inline-flex align-items-center gap-1"
              onClick={() => {
                if (
                  window.confirm(
                    language === "th" 
                      ? "คุณต้องการลบงานนี้จริงหรือไม่?" 
                      : "Are you sure you want to delete this task?",
                  )
                ) {
                  handleDeleteTask(selectedTask.id);
                }
              }}
            >
              <ion-icon name="trash-outline" style={{ fontSize: "15px" }}></ion-icon>
              <span>{language === "th" ? "ลบงาน" : "Delete Task"}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="d-flex gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-full text-xs font-semibold whitespace-nowrap border border-red-500/30 transition-all cursor-pointer"
                  onClick={() => setIsEditing(false)}
                >
                  {language === "th" ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-md cursor-pointer"
                  onClick={onSave}
                >
                  {language === "th" ? "บันทึกข้อมูล" : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-full text-xs font-semibold whitespace-nowrap border border-red-500/30 transition-all cursor-pointer"
                  onClick={() => setShowViewModal(false)}
                >
                  {t("cancelBtn") || "Cancel"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-md"
                  onClick={handleUpdateStatusOnly}
                >
                  {t("updateStatusBtn") || "Update Status"}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TaskDetailModal;
