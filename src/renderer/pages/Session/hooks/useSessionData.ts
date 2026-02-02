// components/Session/hooks/useSessionData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FilterParams, SessionListData, SessionStatsData } from '../../../apis/session';
import sessionAPI from '../../../apis/session';

type SessionApiShape =
  | SessionListData[] // plain array
  | { sessions: SessionListData[]; pagination?: { total?: number; totalPages?: number } }
  | { items: SessionListData[]; pagination?: { total?: number; totalPages?: number } }
  | Record<string, any>; // fallback for unexpected shapes

export const useSessionData = () => {
  const [allSessions, setAllSessions] = useState<SessionListData[]>([]);
  const [sessions, setSessions] = useState<SessionListData[]>([]);
  const [stats, setStats] = useState<SessionStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(20);

  // Filters / sorting / view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'archived'>('all');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [seasonTypeFilter, setSeasonTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: FilterParams = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        year: yearFilter !== 'all' ? (yearFilter as number) : undefined,
        search: searchQuery.trim() || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
        limit,
        offset: (currentPage - 1) * limit,
      };

      const response = await sessionAPI.getAll(filters as any);

      if (!response || !response.status) {
        throw new Error(response?.message || 'Failed to fetch sessions');
      }

      // Narrow the response.data into a union we can handle
      const data = response.data as SessionApiShape;

      if (Array.isArray(data)) {
        // shape: SessionListData[]
        setAllSessions(data);
        setTotalItems(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
      } else if (data && Array.isArray((data as any).sessions)) {
        // shape: { sessions: SessionListData[], pagination?: {...} }
        const items = (data as any).sessions as SessionListData[];
        const pagination = (data as any).pagination;
        setAllSessions(items);
        setTotalItems(pagination?.total ?? items.length);
        setTotalPages(pagination?.totalPages ?? Math.max(1, Math.ceil(items.length / limit)));
      } else if (data && Array.isArray((data as any).items)) {
        // shape: { items: SessionListData[], pagination?: {...} }
        const items = (data as any).items as SessionListData[];
        const pagination = (data as any).pagination;
        setAllSessions(items);
        setTotalItems(pagination?.total ?? items.length);
        setTotalPages(pagination?.totalPages ?? Math.max(1, Math.ceil(items.length / limit)));
      } else {
        // Fallback: unknown shape — clear results to avoid runtime errors
        setAllSessions([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, searchQuery, statusFilter, yearFilter, seasonTypeFilter, sortBy, sortOrder, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await sessionAPI.getStats();
      if (response?.status) {
        setStats(response.data as SessionStatsData);
      }
    } catch (err) {
      console.error('Failed to fetch session stats:', err);
    }
  }, []);

  // Sorting
  const sortedSessions = useMemo(() => {
    const arr = [...allSessions];
    arr.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate).getTime() : 0;
          bValue = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case 'endDate':
          aValue = a.endDate ? new Date(a.endDate).getTime() : 0;
          bValue = b.endDate ? new Date(b.endDate).getTime() : 0;
          break;
        case 'year':
          aValue = a.year ?? 0;
          bValue = b.year ?? 0;
          break;
        case 'status':
          aValue = a.status ?? '';
          bValue = b.status ?? '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue === bValue) return 0;
      if (sortOrder === 'ASC') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
    return arr;
  }, [allSessions, sortBy, sortOrder]);

  // Pagination (derive visible sessions)
  useEffect(() => {
    const startIdx = (currentPage - 1) * limit;
    const endIdx = startIdx + limit;
    setSessions(sortedSessions.slice(startIdx, endIdx));
  }, [sortedSessions, currentPage, limit]);

  // Initial load
  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [fetchSessions, fetchStats]);

  // Debounced search: reset to page 1 and fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchSessions();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSessions]);

  // Reset selections on page change
  useEffect(() => {
    setSelectedSessions([]);
  }, [currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSessions(), fetchStats()]);
    setRefreshing(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  return {
    sessions,
    allSessions,
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
    statusFilter,
    setStatusFilter,
    yearFilter,
    setYearFilter,
    seasonTypeFilter,
    setSeasonTypeFilter,
    viewMode,
    setViewMode,
    selectedSessions,
    setSelectedSessions,
    fetchSessions,
    handleRefresh,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleSort,
  };
};