import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";

export const useActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLogs = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const u = await getCurrentUser();
      const params = {
        page,
        limit: entriesPerPage,
      };
      if (u) {
        params.role = u.role;
        params.userId = u.id;
      }
      const response = await axios.get("/auth/activity-logs", { params });
      
      // ตรวจสอบโครงสร้าง response ว่าเป็นแบบ pagination object หรือ array
      const receivedLogs = response.data?.data ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      const pagination = response.data?.pagination;

      if (append) {
        setLogs((prev) => [...prev, ...receivedLogs]);
      } else {
        setLogs(receivedLogs);
      }

      if (pagination) {
        setHasMore(pagination.hasMore);
      } else {
        setHasMore(receivedLogs.length === entriesPerPage);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchLogs(nextPage, true);
  };

  useEffect(() => {
    fetchLogs(1, false);
  }, [entriesPerPage]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      ((log.fullname || log.username) &&
        (log.fullname || log.username).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details &&
        log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action &&
        log.action.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesAction = true;
    if (actionFilter !== "all") {
      const act = log.action.toLowerCase();
      if (actionFilter === "project") {
        matchesAction = act.includes("project") || act.includes("task");
      } else if (actionFilter === "user") {
        matchesAction = act.includes("user");
      } else if (actionFilter === "system") {
        matchesAction =
          !act.includes("project") &&
          !act.includes("task") &&
          !act.includes("user");
      }
    }

    return matchesSearch && matchesAction;
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  return {
    logs,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    fetchLogs: () => fetchLogs(1, false),
    filteredLogs,
    currentEntries,
    indexOfFirstEntry,
    indexOfLastEntry,
    totalPages,
  };
};
