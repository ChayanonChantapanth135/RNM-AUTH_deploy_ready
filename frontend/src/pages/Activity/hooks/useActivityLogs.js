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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const u = await getCurrentUser();
      const params = {};
      if (u) {
        params.role = u.role;
        params.userId = u.id;
      }
      const response = await axios.get("/auth/activity-logs", { params });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    fetchLogs,
    filteredLogs,
    currentEntries,
    indexOfFirstEntry,
    indexOfLastEntry,
    totalPages,
  };
};
