// components/User/hooks/useUserData.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import userAPI from "../../../../apis/user";
import type { UserData, UserStatsData } from "../../../../apis/user";
import { showError } from "../../../../utils/notification";

type UserApiShape =
  | UserData[]
  | { users: UserData[]; pagination?: { total?: number; totalPages?: number } }
  | { items: UserData[]; pagination?: { total?: number; totalPages?: number } }
  | Record<string, any>;

export const useUserData = () => {
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Sorting
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // View options
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        role: roleFilter !== "all" ? roleFilter : undefined,
        isActive:
          statusFilter !== "all" ? statusFilter === "active" : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchQuery.trim() || undefined,
        sortBy,
        sortOrder: sortOrder === "asc" ? "ASC" : "DESC",
        page: currentPage,
        limit,
      };

      let response;
      if (searchQuery.trim() && typeof userAPI.searchUsers === "function") {
        // If API exposes a dedicated search endpoint, prefer it
        response = await userAPI.searchUsers(
          searchQuery,
          currentPage,
          limit,
          roleFilter !== "all" ? roleFilter : undefined,
          statusFilter !== "all" ? statusFilter === "active" : undefined,
        );
      } else {
        // Fallback to getAllUsers with filters
        // Keep call compatible with existing API signature if it expects positional args
        if (typeof userAPI.getAllUsers === "function") {
          // try to call positional signature first
          try {
            response = await userAPI.getAllUsers(
              currentPage,
              limit,
              sortBy,
              sortOrder === "asc" ? "ASC" : "DESC",
              statusFilter === "inactive",
            );
          } catch {
            // fallback to calling with a filters object if available
            response = await (userAPI as any).getAllUsers(filters);
          }
        } else {
          // If getAllUsers doesn't exist, attempt generic call
          response = await (userAPI as any).getAll(filters);
        }
      }

      if (!response || !response.status) {
        throw new Error(response?.message || "Failed to fetch users");
      }

      const data = response.data as UserApiShape;

      if (Array.isArray(data)) {
        setAllUsers(data);
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      } else if (data && Array.isArray((data as any).users)) {
        const items = (data as any).users as UserData[];
        const pagination = (data as any).pagination;
        setAllUsers(items);
        setTotalItems(pagination?.total ?? items.length);
        setTotalPages(
          pagination?.totalPages ??
            Math.max(1, Math.ceil(items.length / limit)),
        );
      } else if (data && Array.isArray((data as any).items)) {
        const items = (data as any).items as UserData[];
        const pagination = (data as any).pagination;
        setAllUsers(items);
        setTotalItems(pagination?.total ?? items.length);
        setTotalPages(
          pagination?.totalPages ??
            Math.max(1, Math.ceil(items.length / limit)),
        );
      } else if (data && Array.isArray((data as any).users?.data)) {
        // handle nested wrapper like { users: { data: [...] }, pagination: {...} }
        const items = (data as any).users.data as UserData[];
        const pagination = (data as any).pagination;
        setAllUsers(items);
        setTotalItems(pagination?.total ?? items.length);
        setTotalPages(
          pagination?.totalPages ??
            Math.max(1, Math.ceil(items.length / limit)),
        );
      } else {
        setAllUsers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
      showError(err?.message ?? "Failed to fetch users");
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    currentPage,
    limit,
    searchQuery,
    roleFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response?.status) {
        setStats(response.data as UserStatsData);
      }
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  }, []);

  // Sorting
  const sortedUsers = useMemo(() => {
    const arr = [...allUsers];
    arr.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "name":
          aValue = (a.name || "").toLowerCase();
          bValue = (b.name || "").toLowerCase();
          break;
        case "role":
          aValue = (a.role || "").toLowerCase();
          bValue = (b.role || "").toLowerCase();
          break;
        case "status":
          aValue = a.isActive == null ? "" : a.isActive ? "active" : "inactive";
          bValue = b.isActive == null ? "" : b.isActive ? "active" : "inactive";
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue === bValue) return 0;
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });
    return arr;
  }, [allUsers, sortBy, sortOrder]);

  // Pagination: derive visible users
  useEffect(() => {
    const startIdx = (currentPage - 1) * limit;
    const endIdx = startIdx + limit;
    setUsers(sortedUsers.slice(startIdx, endIdx));
  }, [sortedUsers, currentPage, limit]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      await fetchUsers();
      await fetchStats();
    };
    load();
  }, [fetchUsers, fetchStats]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  // Reset selections on page change
  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setRefreshing(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return {
    users,
    allUsers,
    stats,
    loading,
    refreshing,
    error,
    currentPage,
    totalPages,
    totalItems,
    limit,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewMode,
    setViewMode,
    selectedUsers,
    setSelectedUsers,
    fetchUsers,
    handleRefresh,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleSort,
  };
};
