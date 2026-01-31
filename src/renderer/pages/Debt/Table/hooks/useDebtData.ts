// components/Debt/hooks/useDebtData.ts
import { useState, useEffect, useCallback } from 'react';
import type { DebtData, DebtStats, DebtFilters } from '../../../../apis/debt';
import debtAPI from '../../../../apis/debt';
import { showError } from '../../../../utils/notification';

export const useDebtData = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [debts, setDebts] = useState<DebtData[]>([]);
    const [stats, setStats] = useState<DebtStats | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(20);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [workerFilter, setWorkerFilter] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('dateIncurred');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedDebts, setSelectedDebts] = useState<number[]>([]);

    const fetchDebts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const filters: DebtFilters = {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                worker_id: workerFilter || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined
            };

            let response;
            if (searchQuery.trim()) {
                response = await debtAPI.search(searchQuery);
            } else {
                response = await debtAPI.getAll(filters);
            }

            if (response.status) {
                const data = response.data;
                setDebts(data || []);
                setTotalItems(data.length || 0);
                setTotalPages(Math.ceil(data.length / limit) || 1);
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
    }, [currentPage, limit, searchQuery, statusFilter, workerFilter, dateFrom, dateTo, sortBy, sortOrder]);

    const fetchStats = async () => {
        try {
            const response = await debtAPI.getStats();
            if (response.status) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch debt stats:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDebts();
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setWorkerFilter(null);
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchDebts();
    }, [fetchDebts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchDebts();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, fetchDebts]);

    useEffect(() => {
        fetchStats();
    }, [debts]);

    return {
        debts,
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
        clearFilters
    };
};