// components/Debt/components/DebtFilters.tsx
import React from 'react';
import { Search, RefreshCw, Filter, List, Grid } from 'lucide-react';
import WorkerSelect from '../../../../components/Selects/Worker';

interface DebtFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    workerFilter: number | null;
    setWorkerFilter: (id: number | null) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;
    handleRefresh: () => void;
    refreshing: boolean;
    handleStatusFilterChange: (status: string) => void;
    clearFilters: () => void;
    sortBy: string;
    setSortBy: (field: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
    setCurrentPage: (page: number) => void;
}

const DebtFilters: React.FC<DebtFiltersProps> = ({
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
    handleRefresh,
    refreshing,
    handleStatusFilterChange,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setCurrentPage
}) => {
    return (
        <div className="p-5 rounded-xl space-y-4 bg-white border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search debts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'pending', 'partially_paid', 'paid', 'cancelled', 'overdue'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilterChange(status)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                    statusFilter === status 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                {status === 'all' ? 'All' :
                                    status === 'partially_paid' ? 'Partially Paid' :
                                        status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg transition-all duration-200 hover:shadow-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="p-2 rounded-lg transition-all duration-200 hover:shadow-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                        Worker
                    </label>
                    <WorkerSelect
                        value={workerFilter}
                        onChange={setWorkerFilter}
                        placeholder="Filter by worker"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-2 text-gray-600">
                        Sort By
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="dateIncurred">Date Incurred</option>
                        <option value="amount">Original Amount</option>
                        <option value="balance">Current Balance</option>
                        <option value="dueDate">Due Date</option>
                        <option value="createdAt">Created Date</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default DebtFilters;