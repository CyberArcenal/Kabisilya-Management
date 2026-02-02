import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PitakFilters, PitakStatsData, PitakWithDetails } from '../../../../apis/pitak';
import pitakAPI from '../../../../apis/pitak';
import workerAPI from '../../../../apis/worker';

export const usePitakData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pitaks, setPitaks] = useState<PitakWithDetails[]>([]);
  const [allPitaks, setAllPitaks] = useState<PitakWithDetails[]>([]);
  const [stats, setStats] = useState<PitakStatsData | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bukidFilter, setBukidFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedPitaks, setSelectedPitaks] = useState<number[]>([]);

  // Fetch pitaks
  const fetchPitaks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: PitakFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        bukidId: bukidFilter || undefined,
      };

      let response;
      if (searchQuery.trim()) {
        response = await pitakAPI.searchPitaks(searchQuery);
      } else {
        response = await pitakAPI.getAllPitaks(filters);
      }

      if (response.status) {
        const data = response.data as PitakWithDetails[];
        setAllPitaks(data);
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / limit));

        if (response.meta?.stats) {
          setStats(response.meta.stats);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch pitak data');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch pitak data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, bukidFilter]);

  // Apply sorting
  const sortedPitaks = useMemo(() => {
    const sorted = [...allPitaks];
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      if (aValue === bValue) return 0;
      return sortOrder === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
    return sorted;
  }, [allPitaks, sortBy, sortOrder]);

  // Apply pagination
  const paginatedPitaks = useMemo(() => {
    const startIdx = (currentPage - 1) * limit;
    const endIdx = startIdx + limit;
    return sortedPitaks.slice(startIdx, endIdx);
  }, [sortedPitaks, currentPage, limit]);

  // Fetch stats separately
  const fetchStats = async () => {
    try {
      const response = await pitakAPI.getPitakStats();
      if (response.status) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch pitak stats:', err);
    }
  };

  // Fetch available workers
  const fetchAvailableWorkers = async () => {
    try {
      const response = await workerAPI.getActiveWorkers({ limit: 1000 });
      if (response.status && response.data.workers) {
        setAvailableWorkers(response.data.workers);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPitaks(), fetchStats(), fetchAvailableWorkers()]);
  };

  // Status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  // Sort handler
  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
      setCurrentPage(1);
    },
    [sortBy, sortOrder]
  );

  // Initial load
  useEffect(() => {
    fetchPitaks();
    fetchStats();
    fetchAvailableWorkers();
  }, [fetchPitaks]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchPitaks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPitaks]);

  // Reset selections on page change
  useEffect(() => {
    setSelectedPitaks([]);
  }, [currentPage]);

  return {
    pitaks: paginatedPitaks,
    allPitaks,
    stats,
    availableWorkers,
    loading,
    refreshing,
    error,
    currentPage,
    totalPages,
    totalItems,
    limit,
    searchQuery,
    statusFilter,
    viewMode,
    selectedPitaks,
    setSearchQuery,
    setStatusFilter: handleStatusFilterChange,
    setViewMode,
    setSelectedPitaks,
    setCurrentPage,
    setSortBy,
    setSortOrder,
    fetchPitaks,
    handleRefresh,
    handleSort,
  };
};