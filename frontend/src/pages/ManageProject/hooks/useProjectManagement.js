import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { safeDateString } from "../../../lib/dateUtils";
import { getSocket } from "../../../lib/socket";

export const useProjectManagement = (t) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: "Admin User",
    role: "admin",
  });
  const [roleSimulation, setRoleSimulation] = useState("admin");

  // Projects list state
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // "table" or "board"
  const [sortByPriority, setSortByPriority] = useState("none"); // "none", "desc", "asc"

  // List of Team Leaders from DB
  const [teamLeaders, setTeamLeaders] = useState([]);
  // List of all users from DB
  const [users, setUsers] = useState([]);

  // UI / Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    endDate: "",
    priority: "Medium",
    teamLeaderId: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: "",
    status: "",
    priority: "Medium",
    endDate: "",
    teamLeaderId: "",
  });

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    taskType: "แปล",
    customTaskType: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
  });

  // Load current user profile
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setRoleSimulation(user.role);
      }
    };
    fetchUser();
  }, []);

  // Keep selectedProject in sync with updated projects list
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const updatedProj = projects.find((p) => Number(p.id) === Number(selectedProject.id));
      if (updatedProj) {
        setSelectedProject({ ...updatedProj });
      }
    }
  }, [projects]);

  // Fetch projects and team leaders from DB
  const fetchProjects = async () => {
    try {
      const response = await axios.get("/auth/projects");
      const formatted = response.data.map((p) => {
        if (p.end_date) {
          p.endDate = safeDateString(p.end_date);
        }
        if (p.tasks) {
          p.tasks = p.tasks.map((t) => {
            if (t.due_date) {
              t.dueDate = safeDateString(t.due_date);
            }
            return t;
          });
        }
        return p;
      });
      setProjects(formatted);
      setSelectedProject((prev) => {
        if (!prev) return null;
        const updatedSelected = formatted.find((p) => Number(p.id) === Number(prev.id));
        return updatedSelected || prev;
      });
    } catch (err) {
      console.error("Failed to fetch projects from DB", err);
    }
  };

  const fetchTeamLeaders = async () => {
    try {
      const response = await axios.get("/auth/team-leaders");
      setTeamLeaders(response.data);
    } catch (err) {
      console.error("Failed to fetch team leaders from DB", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users from DB", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamLeaders();
    fetchUsers();

    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchProjects();
    };

    socket.on("task:created", handleRealtimeUpdate);
    socket.on("task:status:updated", handleRealtimeUpdate);
    socket.on("task:updated", handleRealtimeUpdate);
    socket.on("task:deleted", handleRealtimeUpdate);
    socket.on("project:created", handleRealtimeUpdate);
    socket.on("project:updated", handleRealtimeUpdate);
    socket.on("project:deleted", (payload) => {
      fetchProjects();
      setSelectedProject((prev) => {
        if (prev && Number(prev.id) === Number(payload.projectId || payload.id)) {
          setShowDetailModal(false);
          setShowViewTaskModal(false);
          return null;
        }
        return prev;
      });
    });

    return () => {
      socket.off("task:created", handleRealtimeUpdate);
      socket.off("task:status:updated", handleRealtimeUpdate);
      socket.off("task:updated", handleRealtimeUpdate);
      socket.off("task:deleted", handleRealtimeUpdate);
      socket.off("project:created", handleRealtimeUpdate);
      socket.off("project:updated", handleRealtimeUpdate);
      socket.off("project:deleted");
    };
  }, []);

  // Track previous location.search to reset the one-time flag whenever a new notification is clicked
  const prevSearchRef = useRef(location.search);
  const hasHandledUrlParams = useRef(false);

  useEffect(() => {
    if (location.search && location.search !== prevSearchRef.current) {
      hasHandledUrlParams.current = false;
      prevSearchRef.current = location.search;
    }

    const checkAndOpenProject = async () => {
      const params = new URLSearchParams(location.search);
      const targetProjectId = params.get("projectId") || params.get("openProject");
      const targetProjectName = params.get("openProjectName");
      const targetTaskId = params.get("taskId") || params.get("openTask");
      const targetTaskName = params.get("openTaskName");

      if (!targetProjectId && !targetProjectName && !targetTaskId && !targetTaskName) {
        return;
      }

      if (hasHandledUrlParams.current) {
        return;
      }

      let matchedProject = null;

      if (projects.length > 0) {
        matchedProject = projects.find((p) => {
          if (targetProjectId && String(p.id).trim() === String(targetProjectId).trim()) return true;
          if (targetTaskId && p.tasks && p.tasks.some(t => String(t.id).trim() === String(targetTaskId).trim())) return true;
          if (targetTaskName && p.tasks && p.tasks.some(t => (t.title || "").trim().toLowerCase() === targetTaskName.trim().toLowerCase())) return true;
          if (targetProjectName && (p.name || "").trim().toLowerCase() === targetProjectName.trim().toLowerCase()) return true;
          return false;
        });
      }

      // Fallback: If not found in current state or projects still loading, fetch directly
      if (!matchedProject) {
        try {
          const res = await axios.get("/auth/projects");
          matchedProject = res.data.find((p) => {
            if (targetProjectId && String(p.id).trim() === String(targetProjectId).trim()) return true;
            if (targetTaskId && p.tasks && p.tasks.some(t => String(t.id).trim() === String(targetTaskId).trim())) return true;
            if (targetTaskName && p.tasks && p.tasks.some(t => (t.title || "").trim().toLowerCase() === targetTaskName.trim().toLowerCase())) return true;
            if (targetProjectName && (p.name || "").trim().toLowerCase() === targetProjectName.trim().toLowerCase()) return true;
            return false;
          });
          if (matchedProject) {
            if (matchedProject.end_date) matchedProject.endDate = safeDateString(matchedProject.end_date);
            if (matchedProject.tasks) {
              matchedProject.tasks = matchedProject.tasks.map((t) => {
                if (t.due_date) t.dueDate = safeDateString(t.due_date);
                return t;
              });
            }
          }
        } catch (err) {
          console.error("Error auto-opening project:", err);
        }
      }

      if (matchedProject) {
        hasHandledUrlParams.current = true;
        setSelectedProject(matchedProject);
        setShowDetailModal(true);

        // If a task is also targeted, open the task detail modal as well
        if (targetTaskId || targetTaskName) {
          const matchedTask = matchedProject.tasks?.find((t) => {
            if (targetTaskId && String(t.id).trim() === String(targetTaskId).trim()) return true;
            if (targetTaskName && (t.title || "").trim().toLowerCase() === targetTaskName.trim().toLowerCase()) return true;
            return false;
          });
          if (matchedTask) {
            setSelectedTask(matchedTask);
            setTempStatus(matchedTask.status || "Pending");
            setShowViewTaskModal(true);
          }
        }

        // Clean up URL search params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkAndOpenProject();
  }, [location.search, projects]);

  const filteredProjects = projects.filter((p) => {
    const role = (currentUser?.role || roleSimulation || "").toLowerCase().trim().replace(/\s+/g, "_");
    const userId = Number(currentUser?.id);

    if (role === "admin") {
      // Admin sees everything
    } else if (role === "manager" || role === "project_manager") {
      // Project Manager sees projects created by them OR projects where they have assigned task(s)
      const isCreator = Number(p.created_by) === userId;
      const hasAssignedTask = p.tasks && Array.isArray(p.tasks) && p.tasks.some(
        (t) => Number(t.assigned_to) === userId || Number(t.assignedTo) === userId
      );
      if (!isCreator && !hasAssignedTask) return false;
    } else {
      // Staff roles (storyboard, animation, designer, programmer, team_leader, etc.)
      // Can only see projects that are relevant to them (they have a task assigned or are assigned to the project)
      const isLeader = Number(p.teamLeaderId) === userId || Number(p.team_leader_id) === userId;
      const isCreator = Number(p.created_by) === userId;
      const hasAssignedTask = p.tasks && Array.isArray(p.tasks) && p.tasks.some(
        (t) => Number(t.assigned_to) === userId || Number(t.assignedTo) === userId
      );
      if (!isLeader && !isCreator && !hasAssignedTask) {
        return false;
      }
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchId = String(p.id || "").includes(q.replace("#", ""));
      const matchLeader = (p.teamLeaderName || p.teamLeader || "").toLowerCase().includes(q);
      const matchManager = (p.projectManagerName || "").toLowerCase().includes(q);
      const matchStatus = (p.status || "").toLowerCase().includes(q);
      const matchTask =
        p.tasks &&
        Array.isArray(p.tasks) &&
        p.tasks.some((t) => (t.title || "").toLowerCase().includes(q));

      return matchName || matchId || matchLeader || matchManager || matchStatus || matchTask;
    }
    return true;
  });

  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

  filteredProjects.sort((a, b) => {
    // 1. Incomplete projects first, Completed projects last
    const aCompleted = (a.status || "").toLowerCase() === "completed" ? 1 : 0;
    const bCompleted = (b.status || "").toLowerCase() === "completed" ? 1 : 0;

    if (aCompleted !== bCompleted) {
      return aCompleted - bCompleted;
    }

    // 2. Sort by priority
    const weightA = priorityWeight[a.priority] || (a.priority === "Low" ? 1 : a.priority === "High" ? 3 : 2);
    const weightB = priorityWeight[b.priority] || (b.priority === "Low" ? 1 : b.priority === "High" ? 3 : 2);

    if (sortByPriority === "asc") {
      return weightA - weightB;
    }
    // Default or "desc" is High -> Medium -> Low
    return weightB - weightA;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || !formData.endDate || !formData.teamLeaderId) {
      setErrorMessage(t("fillRequiredFieldsProject"));
      return;
    }

    try {
      await axios.post("/auth/projects", {
        name: formData.name,
        endDate: formData.endDate,
        priority: formData.priority,
        teamLeaderId: Number(formData.teamLeaderId),
        createdBy: currentUser?.id || 1,
      });

      setShowCreateModal(false);
      setFormData({
        name: "",
        endDate: "",
        priority: "Medium",
        teamLeaderId: "",
      });

      setSuccessMessage(t("projectCreatedSuccess"));
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Create project failed", err);
      setErrorMessage(t("projectCreateFailed"));
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setEditFormData({
      id: project.id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      endDate: project.endDate,
      teamLeaderId: project.teamLeaderId || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !editFormData.name ||
      !editFormData.endDate ||
      !editFormData.teamLeaderId
    ) {
      setErrorMessage(t("fillRequiredFieldsProject"));
      return;
    }

    try {
      await axios.put(`/auth/projects/${editFormData.id}`, {
        name: editFormData.name,
        status: editFormData.status,
        priority: editFormData.priority,
        endDate: editFormData.endDate,
        teamLeaderId: Number(editFormData.teamLeaderId),
        userId: currentUser?.id || 1,
      });

      const assignedLeader = users.find(
        (u) => Number(u.id) === Number(editFormData.teamLeaderId)
      ) || teamLeaders.find(
        (u) => Number(u.id) === Number(editFormData.teamLeaderId)
      );
      const leaderName = assignedLeader ? (assignedLeader.fullname || assignedLeader.username) : "-";

      setSelectedProject((prev) => {
        if (!prev || Number(prev.id) !== Number(editFormData.id)) return prev;
        return {
          ...prev,
          name: editFormData.name,
          status: editFormData.status,
          priority: editFormData.priority,
          endDate: editFormData.endDate,
          end_date: editFormData.endDate,
          teamLeaderId: Number(editFormData.teamLeaderId),
          teamLeaderName: leaderName,
          team_leader_name: leaderName,
        };
      });

      setShowEditModal(false);
      setSuccessMessage(t("projectUpdatedSuccess"));
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Edit project failed", err);
      setErrorMessage(t("projectUpdateFailed"));
    }
  };

  const handleOpenDelete = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (roleSimulation !== "admin") {
      setErrorMessage(t("noPermissionDeleteProject"));
      setShowDeleteModal(false);
      return;
    }

    try {
      await axios.delete(`/auth/projects/${selectedProject.id}`, {
        params: { userId: currentUser?.id || 1 },
      });

      setShowDeleteModal(false);
      setSuccessMessage(t("projectDeletedSuccess"));
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchProjects();
    } catch (err) {
      console.error("Delete project failed", err);
      setErrorMessage(t("projectDeleteFailed"));
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!taskFormData.title) {
      setErrorMessage("สร้างไม่สำเร็จ: กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    try {
      const typeValue =
        taskFormData.taskType === "อื่นๆ"
          ? taskFormData.customTaskType
          : taskFormData.taskType;

      const payload = {
        projectId: selectedProject.id,
        title: taskFormData.title,
        description: taskFormData.description,
        taskType: typeValue,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate || null,
        assignedTo: taskFormData.assignedTo || null,
        createdBy: currentUser?.id || 1,
      };

      await axios.post("/auth/tasks", payload);

      setSuccessMessage("Create Success");
      setTimeout(() => setSuccessMessage(""), 5000);

      // Reset Form
      setTaskFormData({
        title: "",
        taskType: "แปล",
        customTaskType: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignedTo: "",
      });

      setShowAddTaskModal(false);
      fetchProjects();
    } catch (err) {
      console.error("Failed to create task:", err);
      setErrorMessage(
        err.response?.data?.message || "สร้างไม่สำเร็จ: เกิดข้อผิดพลาดของระบบ",
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return {
    currentUser,
    setCurrentUser,
    roleSimulation,
    setRoleSimulation,
    projects,
    setProjects,
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
    fetchTeamLeaders,
    fetchUsers,
    handleCreateSubmit,
    handleViewDetails,
    handleOpenEdit,
    handleEditSubmit,
    handleOpenDelete,
    handleDeleteConfirm,
    handleAddTaskSubmit,
  };
};
