// components/Payment/hooks/usePaymentData.ts
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import paymentAPI from '../../../../apis/payment';
import type { PaymentData, PaymentStatsData, PaymentSummaryData, PaymentPaginationData } from '../../../../apis/payment';
import { showError } from '../../../../utils/notification';

export const usePaymentData = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStatsData | null>(null);
  const [summary, setSummary] = useState<PaymentSummaryData | null>(null);
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('paymentDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // View options
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        workerId: workerFilter || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
      };

      let response;
      if (searchQuery.trim()) {
        response = await paymentAPI.searchPayments({ query: searchQuery });
      } else {
        response = await paymentAPI.getAllPayments(params);
      }

      if (response.status) {
        const data = response.data as PaymentPaginationData;
        setAllPayments(data.payments || []);
        setTotalItems(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch payments');
      }
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, workerFilter, dateFrom, dateTo, paymentMethodFilter]);

  // Apply sorting
  const sortedPayments = useMemo(() => {
    const sorted = [...allPayments];
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'paymentDate':
          aValue = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
          bValue = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
          break;
        case 'grossPay':
          aValue = a.grossPay || 0;
          bValue = b.grossPay || 0;
          break;
        case 'netPay':
          aValue = a.netPay || 0;
          bValue = b.netPay || 0;
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
  }, [allPayments, sortBy, sortOrder]);

  // Apply pagination
  const paginatedPayments = useMemo(() => {
    const startIdx = (currentPage - 1) * limit;
    const endIdx = startIdx + limit;
    return sortedPayments.slice(startIdx, endIdx);
  }, [sortedPayments, currentPage, limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await paymentAPI.getPaymentStats();
      if (response.status) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch payment stats:', err);
    }
  }, []);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const response = await paymentAPI.getPaymentSummary({
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        workerId: workerFilter || undefined,
      });
      if (response.status) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch payment summary:', err);
    }
  }, [dateFrom, dateTo, workerFilter]);

  // Initial load
  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchSummary();
  }, [fetchPayments, fetchStats, fetchSummary]);

  // Search debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchPayments();
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchPayments]);

  // Reset selections on page change
  useEffect(() => {
    setSelectedPayments([]);
  }, [currentPage]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPayments(), fetchStats(), fetchSummary()]);
  };

  return {
    payments: paginatedPayments,
    allPayments,
    stats,
    summary,
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
    paymentMethodFilter,
    setPaymentMethodFilter,
    viewMode,
    setViewMode,
    selectedPayments,
    setSelectedPayments,
    fetchPayments,
    handleRefresh,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  };
};