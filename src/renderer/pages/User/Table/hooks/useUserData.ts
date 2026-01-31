// components/User/hooks/useUserData.ts
import { useState, useCallback, useEffect } from 'react';
import userAPI from '../../../../apis/user';
import type { UserData, UserStatsData } from '../../../../apis/user';
import { showError } from '../../../../utils/notification';

export const useUserData = () => {
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
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    // Sorting
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // View options
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const filters = {
                role: roleFilter !== 'all' ? roleFilter : undefined,
                isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined
            };

            let response;
            if (searchQuery.trim()) {
                response = await userAPI.searchUsers(
                    searchQuery,
                    currentPage,
                    limit,
                    roleFilter !== 'all' ? roleFilter : undefined,
                    statusFilter !== 'all' ? statusFilter === 'active' : undefined
                );
            } else {
                response = await userAPI.getAllUsers(
                    currentPage,
                    limit,
                    sortBy,
                    sortOrder === 'asc' ? 'ASC' : 'DESC',
                    statusFilter === 'inactive'
                );
            }

            if (response.status) {
                const data = response.data;
                setUsers(data.users);
                setTotalPages(data.pagination.totalPages);
                setTotalItems(data.pagination.total);
            } else {
                throw new Error(response.message || 'Failed to fetch users');
            }

        } catch (err: any) {
            setError(err.message);
            showError(err.message);
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, limit, searchQuery, roleFilter, statusFilter, dateFrom, dateTo, sortBy, sortOrder]);

    const fetchStats = async () => {
        try {
            const response = await userAPI.getUserStats();
            if (response.status) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        await fetchStats();
    };

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            await fetchUsers();
            await fetchStats();
        };
        loadData();
    }, [fetchUsers]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, fetchUsers]);

    return {
        users,
        stats,
        loading,
        refreshing,
        error,
        currentPage,
        totalPages,
        totalItems,
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
        setSortOrder
    };
};