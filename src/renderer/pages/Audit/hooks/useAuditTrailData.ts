// components/AuditTrail/hooks/useAuditTrailData.ts
import { useState, useEffect, useCallback } from 'react';
import type { AuditTrailRecord, AuditTrailStatsData, FilterParams } from '../../../apis/audit';
import auditAPI from '../../../apis/audit';
import { showError } from '../../../utils/notification';

export const useAuditTrailData = () => {
  const [auditTrails, setAuditTrails] = useState<AuditTrailRecord[]>([]);
  const [stats, setStats] = useState<AuditTrailStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedTrails, setSelectedTrails] = useState<number[]>([]);

  // Fetch audit trails
  const fetchAuditTrails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: FilterParams = {
        action: actionFilter !== 'all' ? actionFilter : undefined,
        actor: actorFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        page: currentPage,
        limit,
        sortBy,
        sortOrder: sortOrder === 'asc' ? 'ASC' : 'DESC',
      };

      let response;
      if (searchQuery.trim()) {
        response = await auditAPI.searchAuditTrails({
          query: searchQuery,
          page: currentPage,
          limit,
          sortBy,
          sortOrder: sortOrder === 'asc' ? 'ASC' : 'DESC',
        });
      } else {
        response = await auditAPI.filterAuditTrails(filters);
      }

      if (response.status) {
        setAuditTrails(response.data.auditTrails || []);
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalItems(response.data.pagination.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch audit trails');
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, limit, searchQuery, actionFilter, actorFilter, dateFrom, dateTo, sortBy, sortOrder, severityFilter]);

  // Fetch stats separately
  const fetchStats = useCallback(async () => {
    try {
      const statsResponse = await auditAPI.getAuditTrailStats();
      if (statsResponse.status) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit trail stats:', err);
    }
  }, []);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAuditTrails();
    await fetchStats();
  };

  // Initial load
  useEffect(() => {
    fetchAuditTrails();
    fetchStats();
  }, [fetchAuditTrails, fetchStats]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchAuditTrails();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchAuditTrails]);

  // Reset selections on page change
  useEffect(() => {
    setSelectedTrails([]);
  }, [currentPage]);

  return {
    auditTrails,
    stats,
    loading,
    refreshing,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchQuery,
    setSearchQuery,
    actionFilter,
    setActionFilter,
    actorFilter,
    setActorFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewMode,
    setViewMode,
    selectedTrails,
    setSelectedTrails,
    fetchAuditTrails,
    handleRefresh,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    severityFilter,
    setSeverityFilter,
  };
};