// components/Payment/components/PaymentFilters.tsx
import React from 'react';
import {
    Search,
    RefreshCw,
    Filter,
    List,
    Grid,
    ChevronRight as ChevronRightIcon,
    Calendar
} from 'lucide-react';
import WorkerSelect from '../../../../components/Selects/Worker';

interface PaymentFiltersProps {
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
    paymentMethodFilter: string;
    setPaymentMethodFilter: (method: string) => void;
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;
    handleRefresh: () => void;
    refreshing: boolean;
    clearFilters: () => void;
    handleStatusFilterChange: (status: string) => void;
    handlePaymentMethodFilterChange: (method: string) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    handleSort: (field: string) => void;
    setCurrentPage: (page: number) => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
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
    handleRefresh,
    refreshing,
    clearFilters,
    handleStatusFilterChange,
    handlePaymentMethodFilterChange,
    sortBy,
    sortOrder,
    handleSort,
    setCurrentPage
}) => {
    return (
        <div className="p-5 rounded-xl space-y-4"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
            }}
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'pending', 'processing', 'completed', 'cancelled', 'partially_paid'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilterChange(status)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === status ? '' : 'opacity-70 hover:opacity-100'}`}
                                style={{
                                    background: statusFilter === status ? 'var(--primary-color)' : 'var(--card-secondary-bg)',
                                    color: statusFilter === status ? 'var(--sidebar-text)' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)'
                                }}
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
                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-gray-100' : 'bg-white'}`}
                            style={{ 
                                color: viewMode === 'table' ? 'var(--primary-color)' : 'var(--text-secondary)',
                                background: viewMode === 'table' ? 'var(--card-secondary-bg)' : 'var(--card-bg)'
                            }}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                            style={{ 
                                color: viewMode === 'grid' ? 'var(--primary-color)' : 'var(--text-secondary)',
                                background: viewMode === 'grid' ? 'var(--card-secondary-bg)' : 'var(--card-bg)'
                            }}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                        style={{
                            background: 'var(--card-secondary-bg)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                        style={{
                            background: 'var(--card-secondary-bg)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Worker
                    </label>
                    <WorkerSelect
                        value={workerFilter}
                        onChange={(id) => {
                            setWorkerFilter(id);
                            setCurrentPage(1);
                        }}
                        placeholder="Filter by worker"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Date From
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Date To
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Payment Method
                    </label>
                    <select
                        value={paymentMethodFilter}
                        onChange={(e) => handlePaymentMethodFilterChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--input-border)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="check">Check</option>
                        <option value="digital">Digital</option>
                    </select>
                </div>
            </div>

            {/* Sort Info */}
            <div className="flex items-center gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sorted by:</span>
                <button
                    onClick={() => handleSort(sortBy)}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {sortBy === 'paymentDate' ? 'Date' :
                     sortBy === 'grossPay' ? 'Gross Pay' :
                     sortBy === 'netPay' ? 'Net Pay' : 'Date'}
                    <ChevronRightIcon className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                </button>
            </div>
        </div>
    );
};

export default PaymentFilters;