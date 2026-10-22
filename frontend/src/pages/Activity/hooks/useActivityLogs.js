import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { getCurrentUser } from "../../../lib/auth";

export const useActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [totalServerEntries, setTotalServerEntries] = useState(0);

  const fetchLogs = useCallback(async (isLoadMore = false, pageToFetch = 1) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const u = await getCurrentUser();
      const params = {
        page: pageToFetch,
        limit: entriesPerPage,
        paginated: 'true',
      };
      if (u) {
        params.role = u.role;
        params.userId = u.id;
      }

      const response = await axios.get("/auth/activity-logs", { params });
      
      if (response.data && response.data.pagination) {
        const newItems = response.data.data || [];
        setTotalServerEntries(response.data.pagination.total);
        setHasMore(response.data.pagination.hasMore);

        if (isLoadMore) {
          setLogs((prev) => [...prev, ...newItems]);
        } else {
          setLogs(newItems);
        }
      } else {
        // Fallback for non-paginated payload
        const arrayData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setLogs(arrayData);
        setTotalServerEntries(arrayData.length);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [entriesPerPage]);

  useEffect(() => {
    fetchLogs(false, currentPage);
  }, [fetchLogs, currentPage]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLogs(true, nextPage);
    }
  };

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

  const totalPages = Math.ceil(totalServerEntries / entriesPerPage) || 1;
  const indexOfFirstEntry = (currentPage - 1) * entriesPerPage;
  const indexOfLastEntry = Math.min(currentPage * entriesPerPage, totalServerEntries);

  return {
    logs,
    loading,
    loadingMore,
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    fetchLogs: () => fetchLogs(false, 1),
    loadMore,
    hasMore,
    filteredLogs,
    currentEntries: filteredLogs,
    indexOfFirstEntry,
    indexOfLastEntry,
    totalPages,
    totalEntries: totalServerEntries,
  };
};
