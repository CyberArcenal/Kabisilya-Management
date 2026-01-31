// components/Payment/hooks/usePaymentData.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import paymentAPI from '../../../../apis/payment';
import type { PaymentData, PaymentStatsData, PaymentSummaryData } from '../../../../apis/payment';
import { showError } from '../../../../utils/notification';

export const usePaymentData = () => {
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [stats, setStats] = useState<PaymentStatsData | null>(null);
    const [summary, setSummary] = useState<PaymentSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(20);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [workerFilter, setWorkerFilter] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('paymentDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {
                page: currentPage,
                limit,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                workerId: workerFilter || undefined,
                startDate: dateFrom || undefined,
                endDate: dateTo || undefined,
                sortBy,
                sortOrder
            };

            let response;
            if (searchQuery.trim()) {
                response = await paymentAPI.searchPayments({
                    query: searchQuery,
                    ...params
                });
            } else {
                response = await paymentAPI.getAllPayments(params);
            }

            if (response.status) {
                const data = response.data;
                setPayments(data.payments || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalItems(data.pagination?.total || 0);
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
    }, [currentPage, limit, searchQuery, statusFilter, workerFilter, dateFrom, dateTo, sortBy, sortOrder]);

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

    const fetchSummary = useCallback(async () => {
        try {
            const response = await paymentAPI.getPaymentSummary({
                startDate: dateFrom || undefined,
                endDate: dateTo || undefined,
                workerId: workerFilter || undefined
            });
            if (response.status) {
                setSummary(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch payment summary:', err);
        }
    }, [dateFrom, dateTo, workerFilter]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // Search handler with debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchPayments();
            }
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, fetchPayments, currentPage]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPayments();
        await fetchStats();
        await fetchSummary();
    };

    return {
        payments,
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
        setSortOrder
    };
};