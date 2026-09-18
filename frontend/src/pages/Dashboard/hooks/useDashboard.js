import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";
import { useLanguage } from "../../../lib/LanguageContext";

export const useDashboard = () => {
  const { t, language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    tasks: 0,
    overdueTasks: 0,
    overdueProjects: 0,
    projectStatus: { pending: 0, inProgress: 0, review: 0, completed: 0 },
    taskStatus: { pending: 0, inProgress: 0, reviewing: 0, completed: 0 },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarRange, setCalendarRange] = useState({ start: null, end: null });

  // 1. Initial User Fetch
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchUser();
  }, []);

  const userRole = currentUser?.role
    ? currentUser.role.toLowerCase().trim().replace(/\s+/g, "_")
    : "";
  const isAdmin = userRole === "admin";
  const isAdminOrManager =
    userRole === "admin" ||
    userRole === "manager" ||
    userRole === "project_manager";
  const isTeamLeader = userRole === "team_leader";
  const isManager = userRole === "manager" || userRole === "project_manager";

  // 2. Fetch Stats & Activity Logs based on User & Role
  useEffect(() => {
    if (!currentUser) return;

    const fetchStatsAndActivities = async () => {
      try {
        const [statsRes, actRes] = await Promise.all([
          axios.get("/auth/dashboard-stats", {
            params: {
              role: currentUser.role,
              userId: currentUser.id,
            },
          }),
          axios.get("/auth/activity-logs", {
            params: {
              limit: 20,
              role: currentUser.role,
              userId: currentUser.id,
            },
          }),
        ]);
        setStats(statsRes.data);
        setRecentActivities(actRes.data.slice(0, 20));
      } catch (error) {
        console.error("Error fetching dashboard stats/activities:", error);
      }
    };

    fetchStatsAndActivities();
  }, [currentUser]);

  // 3. Dynamic Range Fetch for Calendar Events (Lazy Loading for visible month)
  const fetchCalendarEvents = useCallback(async (startStr, endStr) => {
    if (!currentUser) return;
    try {
      const res = await axios.get("/auth/calendar-events", {
        params: {
          start: startStr || calendarRange.start,
          end: endStr || calendarRange.end,
          role: currentUser.role,
          userId: currentUser.id,
        },
      });
      setCalendarEvents(res.data);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  }, [currentUser, calendarRange]);

  // Initial calendar fetch when user is ready
  useEffect(() => {
    if (currentUser) {
      fetchCalendarEvents();
    }
  }, [currentUser, fetchCalendarEvents]);

  // Callback when user navigates FullCalendar months
  const onDatesSet = useCallback((arg) => {
    const start = arg.startStr.split("T")[0];
    const end = arg.endStr.split("T")[0];
    setCalendarRange({ start, end });
    fetchCalendarEvents(start, end);
  }, [fetchCalendarEvents]);

  // Status breakdown mappings from backend stats
  const projectStatus = useMemo(() => [
    {
      label: t("statusPending"),
      value: stats.projectStatus?.pending || 0,
      badgeBg: "bg-[#1e293b] text-slate-400",
    },
    {
      label: t("statusInProgress"),
      value: stats.projectStatus?.inProgress || 0,
      badgeBg: "bg-indigo-500/20 text-indigo-300",
    },
    {
      label: t("statusReview"),
      value: stats.projectStatus?.review || 0,
      badgeBg: "bg-amber-500/20 text-amber-300",
    },
    {
      label: t("statusCompleted"),
      value: stats.projectStatus?.completed || 0,
      badgeBg: "bg-emerald-500/20 text-emerald-300",
    },
  ], [stats.projectStatus, t]);

  const taskStatus = useMemo(() => [
    {
      label: t("pending"),
      value: stats.taskStatus?.pending || 0,
      badgeBg: "bg-[#1e293b] text-slate-400",
    },
    {
      label: t("inProgress"),
      value: stats.taskStatus?.inProgress || 0,
      badgeBg: "bg-indigo-500/20 text-indigo-300",
    },
    {
      label: t("reviewing"),
      value: stats.taskStatus?.reviewing || 0,
      badgeBg: "bg-amber-500/20 text-amber-300",
    },
    {
      label: t("completed"),
      value: stats.taskStatus?.completed || 0,
      badgeBg: "bg-emerald-500/20 text-emerald-300",
    },
  ], [stats.taskStatus, t]);

  const statsCards = useMemo(() => {
    if (isAdmin) {
      return [
        {
          title: t("allUsers"),
          value: stats.users,
          link: t("manageUsersBtn") || "จัดการผู้ใช้งาน",
          path: "/ManageUsers",
          icon: "👥",
        },
        {
          title: t("allProjects"),
          value: stats.projects,
          link: t("projectsTitle") || "โปรเจกต์",
          path: "/Projects",
          icon: "📁",
        },
        {
          title: t("totalTasks"),
          value: stats.tasks,
          subtitle: `${t("completedPrefix") || "Completed:"} ${stats.taskStatus?.completed || 0}`,
          icon: "📋",
        },
        {
          title: t("overdueTasks"),
          value: stats.overdueTasks,
          link: t("reportsTitle") || "รายงาน",
          path: "/Reports",
          icon: "⚠️",
        },
        {
          title: t("overdueProjects"),
          value: stats.overdueProjects,
          link: t("reportsTitle") || "รายงาน",
          path: "/Reports",
          icon: "⚠️",
        },
      ];
    }

    if (isManager || isTeamLeader) {
      return [
        {
          title:
            language === "th" ? "โปรเจกต์ทั้งหมดของฉัน" : "All My Projects",
          value: stats.projects,
          link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
          path: "/Projects",
          icon: "📁",
        },
        {
          title: t("pending") || "Pending",
          value: stats.projectStatus?.pending || 0,
          link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
          path: "/Projects",
          icon: "⏳",
        },
        {
          title: t("inProgress") || "In Progress",
          value: stats.projectStatus?.inProgress || 0,
          link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
          path: "/Projects",
          icon: "⚡",
        },
        {
          title: t("completed") || "Completed",
          value: stats.projectStatus?.completed || 0,
          link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
          path: "/Projects",
          icon: "✅",
        },
        {
          title:
            language === "th" ? "โปรเจกต์เกินกำหนด" : "Overdue Projects",
          value: stats.overdueProjects || 0,
          link: language === "th" ? "โปรเจกต์ของฉัน" : "My Project",
          path: "/Projects",
          icon: "⚠️",
        },
      ];
    }

    return [
      {
        title:
          t("allMyTasks") ||
          (language === "th" ? "งานทั้งหมดของฉัน" : "All My Tasks"),
        value: stats.tasks,
        link: t("myTask") || "งานของฉัน",
        path: "/MyTasks",
        icon: "📋",
      },
      {
        title: t("pending") || "Pending",
        value: stats.taskStatus?.pending || 0,
        link: t("myTask") || "งานของฉัน",
        path: "/MyTasks",
        icon: "⏳",
      },
      {
        title: t("inProgress") || "In Progress",
        value: stats.taskStatus?.inProgress || 0,
        link: t("myTask") || "งานของฉัน",
        path: "/MyTasks",
        icon: "⚡",
      },
      {
        title: t("completed") || "Completed",
        value: stats.taskStatus?.completed || 0,
        link: t("myTask") || "งานของฉัน",
        path: "/MyTasks",
        icon: "✅",
      },
      {
        title: t("overdueTasks") || "Overdue Tasks",
        value: stats.overdueTasks || 0,
        link: t("myTask") || "งานของฉัน",
        path: "/MyTasks",
        icon: "⚠️",
      },
    ];
  }, [
    isAdmin,
    isManager,
    isTeamLeader,
    language,
    stats,
    t,
  ]);

  const projectAndTaskActivities = useMemo(() => {
    return recentActivities.filter((activity) => {
      const action = (activity.action || "").toLowerCase();
      return !action.includes("login") && !action.includes("logout");
    });
  }, [recentActivities]);

  return {
    currentUser,
    userRole,
    isAdmin,
    isAdminOrManager,
    isTeamLeader,
    isManager,
    statsCards,
    projectStatus,
    taskStatus,
    recentActivities,
    projectAndTaskActivities,
    calendarEvents,
    onDatesSet,
  };
};
