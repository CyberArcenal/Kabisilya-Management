// components/Assignment/hooks/useAssignmentData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import assignmentAPI from '../../../../apis/assignment';
import type { Assignment, AssignmentFilters, AssignmentStats } from '../../../../apis/assignment';

export const useAssignmentData = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [allAssignments, setAllAssignments] = useState<Assignment[]>([]); // Store all fetched assignments
    const [stats, setStats] = useState<AssignmentStats | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10); // Changed to 10 to match the pagination component
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [workerFilter, setWorkerFilter] = useState<number | null>(null);
    const [pitakFilter, setPitakFilter] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('assignmentDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);

    // Apply sorting to assignments
    const sortedAssignments = useMemo(() => {
        const sorted = [...assignments];
        sorted.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'assignmentDate':
                    aValue = new Date(a.assignmentDate).getTime();
                    bValue = new Date(b.assignmentDate).getTime();
                    break;
                case 'worker':
                    aValue = a.worker?.name || '';
                    bValue = b.worker?.name || '';
                    break;
                case 'pitak':
                    aValue = a.pitak?.name || '';
                    bValue = b.pitak?.name || '';
                    break;
                case 'luwangCount':
                    aValue = a.luwangCount || 0;
                    bValue = b.luwangCount || 0;
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                default:
                    aValue = a.id;
                    bValue = b.id;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        return sorted;
    }, [assignments, sortBy, sortOrder]);

    // Apply pagination to sorted assignments
    const paginatedAssignments = useMemo(() => {
        const startIdx = (currentPage - 1) * limit;
        const endIdx = startIdx + limit;
        return sortedAssignments.slice(startIdx, endIdx);
    }, [sortedAssignments, currentPage, limit]);

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const filters: AssignmentFilters = {
                status: statusFilter !== 'all' ? statusFilter as any : undefined,
                workerId: workerFilter || undefined,
                pitakId: pitakFilter || undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined
            };

            let response;
            if (searchQuery.trim()) {
                response = await assignmentAPI.searchAssignments(searchQuery);
            } else {
                response = await assignmentAPI.getAllAssignments(filters);
            }

            if (response.status) {
                const data = response.data as Assignment[] || [];
                setAllAssignments(data); // Store all assignments
                
                // Update total items and pages
                setTotalItems(data.length);
                setTotalPages(Math.ceil(data.length / limit));
                
                // Update stats
                await fetchStats();
            } else {
                throw new Error(response.message || 'Failed to fetch assignments');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to fetch assignments:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchQuery, statusFilter, workerFilter, pitakFilter, dateFrom, dateTo]);

    const fetchStats = async () => {
        try {
            const response = await assignmentAPI.getAssignmentStats();
            if (response.status) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch assignment stats:', err);
        }
    };

    // Update assignments whenever allAssignments changes
    useEffect(() => {
        setAssignments(allAssignments);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [allAssignments, totalPages, currentPage]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // Search handler with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on search
            fetchAssignments();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle filter changes
    useEffect(() => {
        setCurrentPage(1);
        fetchAssignments();
    }, [statusFilter, workerFilter, pitakFilter, dateFrom, dateTo]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAssignments();
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setWorkerFilter(null);
        setPitakFilter(null);
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    return {
        assignments: paginatedAssignments, // Return paginated assignments
        allAssignments, // Also return all assignments for stats
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
        pitakFilter,
        setPitakFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        viewMode,
        setViewMode,
        selectedAssignments,
        setSelectedAssignments,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        fetchAssignments,
        handleRefresh,
        setCurrentPage,
        clearFilters,
    };
};