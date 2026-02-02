// components/Debt/hooks/useDebtData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DebtData, DebtStats, DebtFilters } from '../../../../apis/debt';
import debtAPI from '../../../../apis/debt';
import { showError } from '../../../../utils/notification';

export const useDebtData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [debts, setDebts] = useState<DebtData[]>([]);
  const [allDebts, setAllDebts] = useState<DebtData[]>([]); // store all fetched debts
  const [stats, setStats] = useState<DebtStats | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dateIncurred');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedDebts, setSelectedDebts] = useState<number[]>([]);

  // Fetch debts
  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: DebtFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        worker_id: workerFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      let response;
      if (searchQuery.trim()) {
        response = await debtAPI.search(searchQuery); // only 1 arg
      } else {
        response = await debtAPI.getAll(filters);
      }

      if (response.status) {
        const data = response.data as DebtData[];
        setAllDebts(data);

        // update totals
        setTotalItems(data.length);
        setTotalPages(Math.ceil(data.length / limit));

      } else {
        throw new Error(response.message || 'Failed to fetch debts');
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
      console.error('Failed to fetch debts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, workerFilter, dateFrom, dateTo]);

  // Apply sorting
  const sortedDebts = useMemo(() => {
    const sorted = [...allDebts];
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'dateIncurred':
          aValue = new Date(a.dateIncurred).getTime();
          bValue = new Date(b.dateIncurred).getTime();
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
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
  }, [allDebts, sortBy, sortOrder]);

  // Apply pagination
  const paginatedDebts = useMemo(() => {
    const startIdx = (currentPage - 1) * limit;
    const endIdx = startIdx + limit;
    return sortedDebts.slice(startIdx, endIdx);
  }, [sortedDebts, currentPage, limit]);

  // Fetch stats separately
  const fetchStats = useCallback(async () => {
    try {
      const response = await debtAPI.getStats();
      if (response.status) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch debt stats:', err);
    }
  }, []);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDebts(), fetchStats()]);
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('all');
    setWorkerFilter(null);
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Initial load
  useEffect(() => {
    fetchDebts();
    fetchStats();
  }, [fetchDebts, fetchStats]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDebts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchDebts]);

  // Reset selections on page change
  useEffect(() => {
    setSelectedDebts([]);
  }, [currentPage]);

  return {
    debts: paginatedDebts,
    allDebts,
    stats,
    loading,
    refreshing,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    workerFilter,
    setWorkerFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewMode,
    setViewMode,
    selectedDebts,
    setSelectedDebts,
    fetchDebts,
    handleRefresh,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearFilters,
  };
};