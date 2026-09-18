import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../../../lib/LanguageContext";
import { getCurrentUser } from "../../../lib/auth";
import { safeDateString } from "../../../lib/dateUtils";
import { getSocket } from "../../../lib/socket";

export const useAllTasks = () => {
  const { language } = useLanguage();
  const location = useLocation();

  // All state hooks grouped together at the top of custom hook
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProjectsList, setAllProjectsList] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [taskHistory, setTaskHistory] = useState({
    lastEditedBy: "ไม่มีข้อมูล / No data",
    lastEditedAt: null,
    assigneeChangesCount: 0,
    historyLogs: [],
  });

  const hasHandledUrlParams = useRef(false);

  // Fetch current logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch tasks and lookup data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/auth/projects");
      const allTasks = [];
      response.data.forEach((project) => {
        if (project.tasks && Array.isArray(project.tasks)) {
          project.tasks.forEach((task) => {
            let formattedDueDate = "-";
            if (task.due_date) {
              formattedDueDate = safeDateString(task.due_date);
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

            allTasks.push({
              id: task.id,
              title: task.title,
              project: project.name,
              projectId: project.id,
              assignee: task.assigned_to_name || "Unassigned",
              assignedTo: task.assigned_to || "",
              status: normalizedStatus,
              priority: normalizedPriority,
              dueDate: formattedDueDate,
              description: task.description || "",
              taskType: task.task_type || "",
            });
          });
        }
      });
      setTasks(allTasks);
      setAllProjectsList(response.data.map(p => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
      setAllUsersList(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    const socket = getSocket();
    if (!socket) return;

    const handleTaskChange = () => {
      fetchTasks();
    };

    socket.on("task:created", handleTaskChange);
    socket.on("task:status:updated", handleTaskChange);
    socket.on("task:updated", handleTaskChange);
    socket.on("task:deleted", handleTaskChange);

    return () => {
      socket.off("task:created", handleTaskChange);
      socket.off("task:status:updated", handleTaskChange);
      socket.off("task:updated", handleTaskChange);
      socket.off("task:deleted", handleTaskChange);
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
        if (tasks.length > 0) {
          found = tasks.find((t) => {
            if (targetTaskId && Number(t.id) === Number(targetTaskId)) return true;
            if (targetTaskName && (t.title || "").trim().toLowerCase() === targetTaskName.trim().toLowerCase()) return true;
            return false;
          });
        }

        // Fallback: If tasks array is empty or not yet loaded, fetch projects to find task
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
                    dueDate: formattedDueDate,
                    description: matched.description || "",
                    taskType: matched.task_type || "",
                  };
                  break;
                }
              }
            }
          } catch (err) {
            console.error("Error auto-opening task from fallback:", err);
          }
        }

        if (found) {
          hasHandledUrlParams.current = true;
          setSelectedTask(found);
          setTempStatus(found.status);
          fetchTaskHistory(found.id);
          setShowViewModal(true);

          // Clear query params from URL so subsequent background updates/re-renders don't re-trigger this auto-open
          window.history.replaceState({}, document.title, window.location.pathname);
        }
    };
    checkAndOpenTask();
  }, [tasks, location.search]);

  // Status order priority: Pending -> In Progress -> Reviewing -> Completed (last)
  const STATUS_SORT_ORDER = {
    Pending: 1,
    "In Progress": 2,
    Reviewing: 3,
    Completed: 4,
  };

  // Priority order: High -> Medium -> Low
  const PRIORITY_SORT_ORDER = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  // Filter & sort tasks based on search, criteria, status order, and priority
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // 1. Sort by Status (Pending -> In Progress -> Reviewing -> Completed)
      const statusA = STATUS_SORT_ORDER[a.status] || 99;
      const statusB = STATUS_SORT_ORDER[b.status] || 99;
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // 2. Sort by Priority (High -> Medium -> Low)
      const priorityA = PRIORITY_SORT_ORDER[a.priority] || 99;
      const priorityB = PRIORITY_SORT_ORDER[b.priority] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 3. Newest task first within same status & priority
      return b.id - a.id;
    });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // Statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    reviewing: tasks.filter((t) => t.status === "Reviewing").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const fetchTaskHistory = async (taskId) => {
    try {
      const response = await axios.get(`/auth/tasks/${taskId}/history`);
      setTaskHistory(response.data);
    } catch (err) {
      console.error("Error fetching task history:", err);
    }
  };

  const handleManageClick = (task) => {
    setSelectedTask(task);
    setTempStatus(task.status);
    fetchTaskHistory(task.id);
    setShowViewModal(true);
  };

  const handleUpdateTask = async (updatedDetails) => {
    if (!selectedTask) return;
    try {
      await axios.put(`/auth/tasks/${selectedTask.id}`, {
        ...updatedDetails,
        userId: currentUser?.id,
      });

      await fetchTasks();

      setSuccessMessage(language === "th" ? "อัปเดตข้อมูลงานสำเร็จ" : "Task updated successfully");
      setTimeout(() => setSuccessMessage(""), 5000);
      setShowViewModal(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถอัปเดตข้อมูลงานได้" : "Failed to update task");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/auth/tasks/${taskId}?userId=${currentUser?.id}`);

      await fetchTasks();

      setSuccessMessage(language === "th" ? "ลบงานสำเร็จ" : "Task deleted successfully");
      setTimeout(() => setSuccessMessage(""), 5000);
      setShowViewModal(false);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setErrorMessage(language === "th" ? "ไม่สามารถลบงานได้" : "Failed to delete task");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return {
    tasks,
    setTasks,
    loading,
    fetchTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    currentPage,
    setCurrentPage,
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
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    handleManageClick,
    handleUpdateTask,
    handleDeleteTask,
    allProjectsList,
    allUsersList,
    currentUser,
    taskHistory,
    fetchTaskHistory,
    totalItems: filteredTasks.length,
  };
};
