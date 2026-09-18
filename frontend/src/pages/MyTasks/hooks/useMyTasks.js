import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { useLanguage } from "../../../lib/LanguageContext";
import { safeDateString } from "../../../lib/dateUtils";
import { getSocket } from "../../../lib/socket";

export const useMyTasks = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const prevSearchRef = useRef(location.search);
  const hasHandledUrlParams = useRef(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;
      setCurrentUser(user);

      // Fetch projects and tasks
      const [projectsRes, usersRes] = await Promise.all([
        axios.get("/auth/projects"),
        axios.get("/auth/users"),
      ]);

      const projectsData = projectsRes.data;
      const usersData = usersRes.data;

      setAllProjects(projectsData);
      setAllUsers(usersData);

      // Filter tasks assigned to current user
      const allUserTasks = [];
      projectsData.forEach((project) => {
        if (project.tasks && Array.isArray(project.tasks)) {
          project.tasks.forEach((task) => {
            if (task.assigned_to === user.id) {
              let formattedDueDate = "-";
              let rawDueDate = "-";
              if (task.due_date) {
                formattedDueDate = safeDateString(task.due_date);
                rawDueDate = task.due_date;
              }

              let normalizedPriority = "Medium";
              if (task.priority) {
                const p = task.priority.toLowerCase();
                if (p === "high") normalizedPriority = "High";
                else if (p === "medium") normalizedPriority = "Medium";
                else if (p === "low") normalizedPriority = "Low";
              }

              let normalizedStatus = "Pending";
              if (task.status) {
                const s = task.status.toLowerCase();
                if (s === "pending") normalizedStatus = "Pending";
                else if (s === "in progress" || s === "in_progress") normalizedStatus = "In Progress";
                else if (s === "reviewing" || s === "review") normalizedStatus = "Reviewing";
                else if (s === "completed") normalizedStatus = "Completed";
              }

              allUserTasks.push({
                id: task.id,
                title: task.title,
                project: project.name,
                projectId: project.id,
                assignee: user.name,
                assignedTo: user.id,
                status: normalizedStatus,
                priority: normalizedPriority,
                dueDate: task.due_date ? safeDateString(task.due_date) : "",
                rawDueDate: rawDueDate,
                displayDueDate: formattedDueDate,
                description: task.description || "",
                taskType: task.task_type || "",
              });
            }
          });
        }
      });

      setMyTasks(allUserTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStatusUpdate = () => {
      loadData();
    };

    window.addEventListener("taskStatusUpdated", handleStatusUpdate);

    const socket = getSocket();
    if (socket) {
      socket.on("task:created", handleStatusUpdate);
      socket.on("task:status:updated", handleStatusUpdate);
      socket.on("task:updated", handleStatusUpdate);
      socket.on("task:deleted", handleStatusUpdate);
    }

    return () => {
      window.removeEventListener("taskStatusUpdated", handleStatusUpdate);
      if (socket) {
        socket.off("task:created", handleStatusUpdate);
        socket.off("task:status:updated", handleStatusUpdate);
        socket.off("task:updated", handleStatusUpdate);
        socket.off("task:deleted", handleStatusUpdate);
      }
    };
  }, []);

  // Auto-open modal if taskId, openTask, or openTaskName is present in URL search params
  useEffect(() => {
    if (location.search && location.search !== prevSearchRef.current) {
      hasHandledUrlParams.current = false;
      prevSearchRef.current = location.search;
    }

    const checkAndOpenTask = async () => {
      const params = new URLSearchParams(location.search);
      const targetTaskId = params.get("taskId") || params.get("openTask");
      const targetTaskName = params.get("openTaskName");

      if (!targetTaskId && !targetTaskName) return;
      if (hasHandledUrlParams.current) return;

      let found = null;
      if (myTasks.length > 0) {
        found = myTasks.find((t) => {
          if (targetTaskId && Number(t.id) === Number(targetTaskId)) return true;
          if (targetTaskName && (t.title || "").trim().toLowerCase() === targetTaskName.trim().toLowerCase()) return true;
          return false;
        });
      }

      // Fallback: If not in myTasks (e.g. user is PM/Team Leader or viewing another task in project), find in allProjects
      if (!found) {
        try {
          const res = await axios.get("/auth/projects");
          for (const proj of res.data) {
            if (proj.tasks && Array.isArray(proj.tasks)) {
              const matched = proj.tasks.find((t) => {
                if (targetTaskId && Number(t.id) === Number(targetTaskId)) return true;
                if (targetTaskName && (t.title || "").trim().toLowerCase() === targetTaskName.trim().toLowerCase()) return true;
                return false;
              });
              if (matched) {
                let formattedDueDate = "-";
                if (matched.due_date) formattedDueDate = safeDateString(matched.due_date);
                let normalizedPriority = "Medium";
                if (matched.priority) {
                  const p = matched.priority.toLowerCase();
                  if (p === "high") normalizedPriority = "High";
                  else if (p === "medium") normalizedPriority = "Medium";
                  else if (p === "low") normalizedPriority = "Low";
                }
                let normalizedStatus = "Pending";
                if (matched.status) {
                  const s = matched.status.toLowerCase();
                  if (s === "pending") normalizedStatus = "Pending";
                  else if (s === "in progress" || s === "in_progress") normalizedStatus = "In Progress";
                  else if (s === "reviewing" || s === "review") normalizedStatus = "Reviewing";
                  else if (s === "completed") normalizedStatus = "Completed";
                }
                found = {
                  id: matched.id,
                  title: matched.title,
                  project: proj.name,
                  projectId: proj.id,
                  assignee: matched.assigned_to_name || "Unassigned",
                  assignedTo: matched.assigned_to || "",
                  status: normalizedStatus,
                  priority: normalizedPriority,
                  dueDate: matched.due_date ? safeDateString(matched.due_date) : "",
                  rawDueDate: matched.due_date || "-",
                  displayDueDate: formattedDueDate,
                  description: matched.description || "",
                  taskType: matched.task_type || "",
                };
                break;
              }
            }
          }
        } catch (err) {
          console.error("Error finding task fallback in useMyTasks:", err);
        }
      }

      if (found) {
        hasHandledUrlParams.current = true;
        setSelectedTask(found);
        setTempStatus(found.status);
        setShowViewModal(true);

        // Clear query params from URL so subsequent background updates/re-renders don't re-trigger this auto-open
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    checkAndOpenTask();
  }, [myTasks, location.search]);

  const handleUpdateTask = async (updatedDetails) => {
    if (!selectedTask) return;
    try {
      await axios.put(`/auth/tasks/${selectedTask.id}`, {
        ...updatedDetails,
        userId: currentUser?.id,
      });

      setSuccessMessage(language === "th" ? "อัปเดตข้อมูลงานสำเร็จ" : "Task updated successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setShowViewModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to update task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถอัปเดตข้อมูลงานได้" : "Failed to update task");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/auth/tasks/${taskId}?userId=${currentUser?.id}`);
      setSuccessMessage(language === "th" ? "ลบงานสำเร็จ" : "Task deleted successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
      setShowViewModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to delete task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถลบงานได้" : "Failed to delete task");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const handleManageClick = (task) => {
    setSelectedTask(task);
    setTempStatus(task.status);
    setShowViewModal(true);
  };

  const filteredTasks = myTasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tasksByProject = filteredTasks.reduce((acc, task) => {
    if (!acc[task.project]) {
      acc[task.project] = {
        name: task.project,
        projectId: task.projectId,
        tasks: []
      };
    }
    acc[task.project].tasks.push(task);
    return acc;
  }, {});

  const projectGroups = Object.values(tasksByProject);

  const stats = {
    total: myTasks.length,
    pending: myTasks.filter(t => t.status === "Pending").length,
    inProgress: myTasks.filter(t => t.status === "In Progress").length,
    reviewing: myTasks.filter(t => t.status === "Reviewing").length,
    completed: myTasks.filter(t => t.status === "Completed").length,
  };

  return {
    currentUser,
    loading,
    myTasks,
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
    filteredTasks
  };
};
