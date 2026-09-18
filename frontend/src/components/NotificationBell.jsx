import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { useLanguage } from "../lib/LanguageContext";
import { getSocket } from "../lib/socket";

/**
 * คอมโพเนนต์การแจ้งเตือนในระบบ (In-App Notification Bell & Panel)
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("userToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/auth/notifications`, {
        headers: getAuthHeaders(),
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userTokenExpiresAt");
        window.dispatchEvent(new Event("authChanged"));
        navigate("/login");
        return;
      }
      console.error("Failed to fetch notifications:", error);
    }
  }, [getAuthHeaders, navigate]);

  useEffect(() => {
    // โหลดแจ้งเตือนตอนเริ่มต้น
    fetchNotifications();

    // ฟัง Event เมื่อสถานะ Login มีการเปลี่ยนแปลง
    const handleAuthChanged = () => {
      fetchNotifications();
    };
    window.addEventListener("authChanged", handleAuthChanged);

    // เชื่อมต่อ WebSockets (Socket.io) เพื่อรับแจ้งเตือนแบบ Real-time Push
    const socket = getSocket();

    const handleNewNotification = (newNotif) => {
      if (!newNotif) return;
      setNotifications((prev) => {
        // ป้องกันแจ้งเตือนซ้ำ ID
        if (newNotif.id && prev.some((n) => n.id === newNotif.id)) {
          return prev;
        }
        return [newNotif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);

      // Dispatch event แจ้งเตือนคอมโพเนนต์อื่น เช่น Dashboard หรือ MyTasks
      window.dispatchEvent(new Event("notificationReceived"));
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
      socket.off("notification:new", handleNewNotification);
    };
  }, [fetchNotifications]);

  // ปิด Popover เมื่อคลิกภายนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (item) => {
    const id = item.id;
    const link = item.link;
    const taskId = item.task_id;

    try {
      await axios.put(
        `${API_URL}/auth/notifications/${id}/read`,
        {},
        { headers: getAuthHeaders() },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event("taskStatusUpdated"));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }

    // หากเป็นการแจ้งเตือนงานเกินกำหนดส่ง (task_overdue) หรือไม่มี link ไม่ต้องทำการ redirect หน้า
    if (item.type === "task_overdue" || !link) {
      return;
    }

    // Determine the navigation target
    let targetLink = link;
    try {
      const userData = localStorage.getItem("userData");
      const user = userData ? JSON.parse(userData) : null;
      const role = (user?.role || "").toLowerCase();
      const isAdmin = role === "admin";

      const titleAndMsg = `${item.title || ""} ${item.message || ""}`;
      const isTeamLeaderNotif = /Team Leader|หัวหน้าโปรเจกต์/i.test(titleAndMsg);
      const isProjectReviewingNotif = /Project Reviewing|โปรเจกต์รอตรวจสอบ|Reviewing|รอตรวจสอบ/i.test(titleAndMsg);
      const isTaskStatusUpdatedNotif = /Task Status Updated|อัปเดตสถานะงาน/i.test(titleAndMsg) || (item.type === "task" && /สถานะ/i.test(titleAndMsg));
      const isCommentNotif = /Comment|ความคิดเห็น/i.test(titleAndMsg) || item.type === "comment";
      const isProjectNotif = item.type === "project" || isTeamLeaderNotif || isProjectReviewingNotif || isCommentNotif || /งานใหม่ในโปรเจกต์|New task in project|โปรเจกต์/i.test(titleAndMsg) || (targetLink && targetLink.startsWith("/Projects"));
      const isTaskNotif = item.type === "task" || /New Task Assigned|งานใหม่ที่ได้รับมอบหมาย|ได้รับมอบหมายงานใหม่/i.test(titleAndMsg) || taskId;

      const timestamp = Date.now();

      if (isProjectReviewingNotif || isTaskStatusUpdatedNotif || isCommentNotif) {
        // Redirect to Projects page and open Project Detail + Task Detail
        let projId = item.project_id;
        if (!projId && targetLink && targetLink.includes("projectId=")) {
          const match = targetLink.match(/projectId=([^&]+)/);
          if (match) projId = match[1];
        }

        let notifTaskId = taskId || item.task_id;
        if (!notifTaskId && targetLink && targetLink.includes("taskId=")) {
          const tMatch = targetLink.match(/taskId=([^&]+)/);
          if (tMatch) notifTaskId = tMatch[1];
        }

        if (projId) {
          targetLink = `/Projects?projectId=${projId}${notifTaskId ? `&taskId=${notifTaskId}` : ""}&_t=${timestamp}`;
        } else if (targetLink && targetLink.startsWith("/Projects")) {
          const separator = targetLink.includes("?") ? "&" : "?";
          targetLink = `${targetLink}${separator}${notifTaskId ? `taskId=${notifTaskId}&` : ""}_t=${timestamp}`;
        } else {
          // Extract project and task from message
          const matches = item.message?.match(/["“'`](.*?)["”'`]/g);
          let taskName = null;
          let projName = null;

          if (matches && matches.length >= 2) {
            taskName = matches[0].replace(/["“'"`]/g, "").trim();
            projName = matches[1].replace(/["“'"`]/g, "").trim();
          } else if (matches && matches.length === 1) {
            taskName = matches[0].replace(/["“'"`]/g, "").trim();
          }

          if (projName) {
            targetLink = `/Projects?openProjectName=${encodeURIComponent(projName)}${notifTaskId ? `&taskId=${notifTaskId}` : ""}${taskName ? `&openTaskName=${encodeURIComponent(taskName)}` : ""}&_t=${timestamp}`;
          } else if (taskName) {
            targetLink = `/Projects?${notifTaskId ? `taskId=${notifTaskId}&` : ""}openTaskName=${encodeURIComponent(taskName)}&_t=${timestamp}`;
          } else {
            targetLink = `/Projects?${notifTaskId ? `taskId=${notifTaskId}&` : ""}_t=${timestamp}`;
          }
        }
      } else if (isTeamLeaderNotif || (isProjectNotif && !taskId)) {
        if (targetLink && targetLink.startsWith("/Projects") && targetLink.includes("projectId=")) {
          const separator = targetLink.includes("?") ? "&" : "?";
          targetLink = `${targetLink}${separator}_t=${timestamp}`;
        } else if (item.project_id) {
          targetLink = `/Projects?projectId=${item.project_id}&_t=${timestamp}`;
        } else {
          // Extract project name from message if link has no ID
          const projMatch = item.message?.match(/["“'`](.*?)["”'`]/);
          if (projMatch && projMatch[1]) {
            targetLink = `/Projects?openProjectName=${encodeURIComponent(projMatch[1].trim())}&_t=${timestamp}`;
          } else {
            targetLink = `/Projects?_t=${timestamp}`;
          }
        }
      } else if (isTaskNotif || taskId) {
        const basePath = isAdmin ? "/AllTasks" : "/MyTasks";
        if (taskId) {
          targetLink = `${basePath}?taskId=${taskId}&_t=${timestamp}`;
        } else {
          // Extract task name if taskId is missing
          const taskMatch = item.message?.match(/["“'`](.*?)["”'`]/);
          if (taskMatch && taskMatch[1]) {
            targetLink = `${basePath}?openTaskName=${encodeURIComponent(taskMatch[1].trim())}&_t=${timestamp}`;
          } else {
            targetLink = `${basePath}?_t=${timestamp}`;
          }
        }
      } else if (!targetLink) {
        targetLink = "/Dashboard";
      } else {
        // Non-admin users: redirect /AllTasks to /MyTasks
        if (!isAdmin && targetLink.startsWith("/AllTasks")) {
          targetLink = targetLink.replace("/AllTasks", "/MyTasks");
        }

        // If notification has a task_id and targetLink is MyTasks or AllTasks without taskId param yet
        if (taskId && (targetLink.includes("/MyTasks") || targetLink.includes("/AllTasks"))) {
          if (!targetLink.includes("taskId=")) {
            const separator = targetLink.includes("?") ? "&" : "?";
            targetLink = `${targetLink}${separator}taskId=${taskId}&_t=${timestamp}`;
          } else {
            const separator = targetLink.includes("?") ? "&" : "?";
            targetLink = `${targetLink}${separator}_t=${timestamp}`;
          }
        }
      }
    } catch (e) {
      targetLink = link || "/Dashboard";
    }

    setIsOpen(false);
    navigate(targetLink);
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/auth/notifications/read-all`,
        {},
        { headers: getAuthHeaders() },
      );
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: 1 })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("taskStatusUpdated"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/auth/notifications/${id}`, {
        headers: getAuthHeaders(),
      });
      const targetItem = notifications.find((item) => item.id === id);
      if (targetItem && !targetItem.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/auth/notifications/clear-all`, {
        headers: getAuthHeaders(),
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return t("justNow") || "เพิ่งเมื่อครู่";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} ${t("minutesAgo") || "นาทีที่แล้ว"}`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ${t("hoursAgo") || "ชม.ที่แล้ว"}`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ${t("daysAgo") || "วันที่แล้ว"}`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationTitle = (item) => {
    const title = (item.title || "").trim();
    if (/Team Leader/i.test(title)) {
      return t("notifAssignedTeamLeader");
    }
    if (/งานใหม่ในโปรเจกต์|New Task in Project/i.test(title)) {
      return t("notifNewTaskInProject");
    }
    if (
      /งานใหม่ที่ได้รับมอบหมาย|ได้รับมอบหมายงานใหม่|New Task Assigned/i.test(
        title,
      )
    ) {
      return t("newTaskAssigned");
    }
    if (/อัปเดตสถานะงาน|Task Status Updated/i.test(title)) {
      return t("notifTaskStatusUpdated");
    }
    if (/โปรเจกต์รอตรวจสอบ|Project Reviewing/i.test(title)) {
      return t("notifProjectReviewing");
    }
    if (/อัปเดตข้อมูลโปรเจกต์|Project Updated/i.test(title)) {
      return t("notifProjectUpdated");
    }
    if (/อัปเดตสถานะโปรเจกต์|Project Status Updated/i.test(title)) {
      return t("projectStatusUpdated");
    }
    if (/ความคิดเห็นใหม่ในงาน|New Comment on Task/i.test(title)) {
      return t("notifNewComment");
    }
    if (/แจ้งเตือนจากระบบ|System Notification/i.test(title)) {
      return t("systemNotification");
    }
    return title || t("systemNotification");
  };

  const getNotificationMessage = (item) => {
    const msg = (item.message || "").trim();

    // 1. Team Leader: คุณได้รับมอบหมายให้เป็นหัวหน้าโปรเจกต์ "ProjectName"
    const tlMatch = msg.match(
      /(?:คุณได้รับมอบหมายให้เป็นหัวหน้าโปรเจกต์|You have been assigned as Team Leader for project)\s*["“'`](.*?)["”'`]/i,
    );
    if (tlMatch) {
      return t("notifAssignedTeamLeaderMsg").replace("{project}", tlMatch[1]);
    }

    // 2. New Task in Project: มีงานใหม่ "TaskName" ในโปรเจกต์ "ProjectName"
    const newTaskProjMatch = msg.match(
      /(?:มีงานใหม่|New task)\s*["“'`](.*?)["”'`]\s*(?:ในโปรเจกต์|in project)\s*["“'`](.*?)["”'`]/i,
    );
    if (newTaskProjMatch) {
      return t("notifNewTaskInProjectMsg")
        .replace("{task}", newTaskProjMatch[1])
        .replace("{project}", newTaskProjMatch[2]);
    }

    // 3. New Task Assigned: คุณได้รับมอบหมายงานใหม่: "TaskName" ในโปรเจกต์ "ProjectName"
    const assignedTaskMatch = msg.match(
      /(?:คุณได้รับมอบหมายงาน(?:ใหม่)?[:\s]*|You have been assigned a new task[:\s]*)\s*["“'`](.*?)["”'`]\s*(?:ในโปรเจกต์|in project)\s*["“'`](.*?)["”'`]/i,
    );
    if (assignedTaskMatch) {
      return t("notifNewTaskAssignedMsg")
        .replace("{task}", assignedTaskMatch[1])
        .replace("{project}", assignedTaskMatch[2]);
    }

    // 4. Task status updated: งาน "TaskName" ในโปรเจกต์ "ProjectName" ถูกอัปเดตสถานะเป็น "Status"
    const taskStatusMatch = msg.match(
      /(?:งาน|Task)\s*["“'`](.*?)["”'`]\s*(?:ในโปรเจกต์|in project)\s*["“'`](.*?)["”'`]\s*(?:ถูกอัปเดตสถานะเป็น|status changed to)\s*["“'`](.*?)["”'`]/i,
    );
    if (taskStatusMatch) {
      let statusVal = taskStatusMatch[3];
      if (/Pending|รอดำเนินการ/i.test(statusVal))
        statusVal = t("statusPending") || statusVal;
      else if (/In Progress|กำลังดำเนินการ/i.test(statusVal))
        statusVal = t("statusInProgress") || statusVal;
      else if (/Reviewing|รอตรวจสอบ/i.test(statusVal))
        statusVal = t("statusReview") || statusVal;
      else if (/Completed|เสร็จสิ้น|เสร็จสมบูรณ์/i.test(statusVal))
        statusVal = t("statusCompleted") || statusVal;

      return t("notifTaskStatusUpdatedMsg")
        .replace("{task}", taskStatusMatch[1])
        .replace("{project}", taskStatusMatch[2])
        .replace("{status}", statusVal);
    }

    // 5. Project Reviewing: โปรเจกต์ "ProjectName" มีสถานะเป็น Reviewing (รอตรวจสอบ)
    const projReviewingMatch = msg.match(
      /(?:โปรเจกต์|Project)\s*["“'`](.*?)["”'`]\s*(?:มีสถานะเป็น Reviewing \(รอตรวจสอบ\)|is currently reviewing|has status reviewing)/i,
    );
    if (projReviewingMatch) {
      return t("notifProjectReviewingMsg").replace(
        "{project}",
        projReviewingMatch[1],
      );
    }

    // 6. Project updated: โปรเจกต์ "ProjectName" มีการอัปเดตข้อมูลใหม่
    const projUpdateMatch = msg.match(
      /(?:โปรเจกต์|Project)\s*["“'`](.*?)["”'`]\s*(?:มีการอัปเดตข้อมูลใหม่|has been updated)/i,
    );
    if (projUpdateMatch) {
      return t("notifProjectUpdatedMsg").replace(
        "{project}",
        projUpdateMatch[1],
      );
    }

    // 7. Comment: มีความคิดเห็นใหม่ในงาน "TaskName"
    const commentMatch = msg.match(
      /(?:มีความคิดเห็นใหม่ในงาน|New comment on task)\s*["“'`](.*?)["”'`]/i,
    );
    if (commentMatch) {
      return t("notifNewCommentMsg").replace("{task}", commentMatch[1]);
    }

    return msg;
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.is_read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        );
      case "project":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
        );
      case "task_overdue":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "alert":
        return (
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl transition-all focus:outline-none flex items-center justify-center cursor-pointer shadow-sm"
        style={{
          background: "var(--bg-surface-hover)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-surface)",
        }}
        title={t("notifications") || "Notifications"}
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge counter */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-rose-500 to-pink-600 text-[10px] font-bold text-white items-center justify-center shadow-lg">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Popover Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-x-3 sm:absolute sm:inset-x-auto sm:right-0 mt-3 max-w-sm mx-auto sm:mx-0 sm:w-96 rounded-3xl shadow-2xl z-50 overflow-hidden animate-fade-in"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-surface)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{
              background: "var(--bg-surface-hover)",
              borderBottom: "1px solid var(--border-surface)",
            }}
          >
            <h3 className="text-base font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
              {t("notifications") || "การแจ้งเตือน"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-colors"
                style={{
                  background: "rgba(14, 165, 233, 0.15)",
                  color: "var(--brand-color)",
                }}
              >
                {t("markAllAsRead") || "อ่านทั้งหมดแล้ว"}
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div 
            className="flex items-center px-3 py-2 gap-2 text-xs"
            style={{
              borderBottom: "1px solid var(--border-surface)",
            }}
          >
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === "all"
                  ? "notif-filter-active shadow-md"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={
                filter === "all"
                  ? { background: "var(--brand-color)", color: "#ffffff" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <span style={{ color: filter === "all" ? "#ffffff" : "inherit" }}>
                {t("all") || "All"} ({notifications.length})
              </span>
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === "unread"
                  ? "notif-filter-active shadow-md"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={
                filter === "unread"
                  ? { background: "var(--brand-color)", color: "#ffffff" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <span style={{ color: filter === "unread" ? "#ffffff" : "inherit" }}>
                {t("unread") || "Unread"} ({unreadCount})
              </span>
            </button>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="ml-auto px-2.5 py-1.5 rounded-xl font-semibold text-rose-500 hover:text-rose-600 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                style={{ background: "rgba(244, 63, 94, 0.1)" }}
                title={t("clearAll") || "ล้างทั้งหมด"}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {t("clearAll") || "ล้างทั้งหมด"}
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y custom-scrollbar" style={{ borderColor: "var(--border-surface)" }}>
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
                <svg
                  className="w-12 h-12 mx-auto mb-3 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm font-medium">
                  {t("noNotifications") || "ยังไม่มีการแจ้งเตือน"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item)}
                  className="p-3.5 flex gap-3 transition-colors cursor-pointer relative group"
                  style={{
                    backgroundColor: !item.is_read ? "var(--bg-surface-hover)" : "transparent",
                    borderBottom: "1px solid var(--border-surface)",
                  }}
                >
                  {/* Unread Glow Dot */}
                  {!item.is_read && (
                    <span 
                      className="absolute left-1.5 top-5 w-2 h-2 rounded-full shadow-sm"
                      style={{ background: "var(--brand-color)", boxShadow: "0 0 6px var(--brand-color)" }}
                    ></span>
                  )}

                  {getNotificationIcon(item.type)}

                  <div className="flex-1 min-w-0 pr-4">
                    <h4
                      className="text-xs font-bold truncate mb-0.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {getNotificationTitle(item)}
                    </h4>
                    <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {getNotificationMessage(item)}
                    </p>
                    <span className="text-[10px] mt-1 block font-medium" style={{ color: "var(--text-secondary)", opacity: 0.75 }}>
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteNotification(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1 self-start rounded-md hover:bg-slate-800"
                    title={t("deleteNotification") || "ลบ"}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
