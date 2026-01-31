// components/User/components/UserFilters.tsx
import React from 'react';
import { Search, RefreshCw, Filter, List, Grid, Calendar } from 'lucide-react';

interface UserFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    roleFilter: string;
    setRoleFilter: (role: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;
    handleRefresh: () => void;
    refreshing: boolean;
    clearFilters: () => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (show: boolean) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
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
    handleRefresh,
    refreshing,
    clearFilters,
    showAdvancedFilters,
    setShowAdvancedFilters
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
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'admin', 'manager', 'user'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${roleFilter === role ? '' : 'opacity-70 hover:opacity-100'}`}
                                style={{
                                    background: roleFilter === role ? 'var(--primary-color)' : 'var(--card-secondary-bg)',
                                    color: roleFilter === role ? 'var(--sidebar-text)' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'active', 'inactive'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === status ? '' : 'opacity-70 hover:opacity-100'}`}
                                style={{
                                    background: statusFilter === status ? 'var(--primary-color)' : 'var(--card-secondary-bg)',
                                    color: statusFilter === status ? 'var(--sidebar-text)' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 ${viewMode === 'table' ? 'bg-gray-100' : 'bg-white'}`}
                            style={{ color: viewMode === 'table' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                            style={{ color: viewMode === 'grid' ? 'var(--primary-color)' : 'var(--text-secondary)' }}
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

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                        style={{
                            background: showAdvancedFilters ? 'var(--primary-color)' : 'var(--card-secondary-bg)',
                            color: showAdvancedFilters ? 'var(--sidebar-text)' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Date From
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Date To
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFilters;