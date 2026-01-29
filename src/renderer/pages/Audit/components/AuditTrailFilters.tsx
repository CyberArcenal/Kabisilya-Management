// components/AuditTrail/components/AuditTrailFilters.tsx
import React from 'react';
import { Search, RefreshCw, Filter, List, Grid, Calendar, User, Activity, Trash2, Archive, HardDrive } from 'lucide-react';

interface AuditTrailFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    actionFilter: string;
    setActionFilter: (filter: string) => void;
    actorFilter: string;
    setActorFilter: (filter: string) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;
    handleRefresh: () => void;
    refreshing: boolean;
    handleActionFilterChange: (action: string) => void;
    handleSeverityFilterChange: (severity: string) => void;
    sortBy: string;
    setSortBy: (field: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
    setCurrentPage: (page: number) => void;
    severityFilter: string;
    clearFilters: () => void;
    showAdvancedFilters: boolean;
    setShowAdvancedFilters: (show: boolean) => void;
    onCleanupClick: () => void;
    onArchiveClick: () => void;
    onCompactClick: () => void;
    availableActions?: string[];
    availableActors?: string[];
}

const AuditTrailFilters: React.FC<AuditTrailFiltersProps> = ({
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
    handleRefresh,
    refreshing,
    handleActionFilterChange,
    handleSeverityFilterChange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    setCurrentPage,
    severityFilter,
    clearFilters,
    showAdvancedFilters,
    setShowAdvancedFilters,
    onCleanupClick,
    onArchiveClick,
    onCompactClick,
    availableActions = [],
    availableActors = []
}) => {
    const severityOptions = [
        { value: 'all', label: 'All Severities' },
        { value: 'error', label: 'Errors' },
        { value: 'warning', label: 'Warnings' },
        { value: 'security', label: 'Security' },
        { value: 'login', label: 'Authentication' },
        { value: 'system', label: 'System' },
        { value: 'data', label: 'Data Operations' }
    ];

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
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                            style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search audit trails..."
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

                    {/* Action Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={actionFilter}
                            onChange={(e) => handleActionFilterChange(e.target.value)}
                            className="px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="all">All Actions</option>
                            {availableActions.slice(0, 10).map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                            {availableActions.length > 10 && (
                                <option value="more">... {availableActions.length - 10} more</option>
                            )}
                        </select>
                    </div>

                    {/* Actor Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={actorFilter}
                            onChange={(e) => setActorFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="">All Actors</option>
                            {availableActors.slice(0, 10).map(actor => (
                                <option key={actor} value={actor}>{actor}</option>
                            ))}
                            {availableActors.length > 10 && (
                                <option value="more">... {availableActors.length - 10} more</option>
                            )}
                        </select>
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

                    {/* Toggle Advanced Filters */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="p-2 rounded-lg transition-all duration-200 hover:shadow-md"
                        style={{
                            background: showAdvancedFilters ? 'var(--primary-color)' : 'var(--card-secondary-bg)',
                            color: showAdvancedFilters ? 'var(--sidebar-text)' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t" 
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    {/* Date From */}
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Date From
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                                style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Date To
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                                style={{ color: 'var(--text-tertiary)' }} />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 rounded-lg text-sm"
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Severity Filter */}
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Severity
                        </label>
                        <select
                            value={severityFilter}
                            onChange={(e) => handleSeverityFilterChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {severityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Maintenance Actions */}
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Maintenance
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={onCleanupClick}
                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center gap-1"
                                style={{
                                    background: 'var(--accent-rust-light)',
                                    color: 'var(--accent-rust)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <Trash2 className="w-3 h-3" />
                                Cleanup
                            </button>
                            <button
                                onClick={onArchiveClick}
                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center gap-1"
                                style={{
                                    background: 'var(--accent-sky-light)',
                                    color: 'var(--accent-sky)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <Archive className="w-3 h-3" />
                                Archive
                            </button>
                            <button
                                onClick={onCompactClick}
                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center gap-1"
                                style={{
                                    background: 'var(--accent-earth-light)',
                                    color: 'var(--accent-earth)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                <HardDrive className="w-3 h-3" />
                                Compact
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sort Options */}
            {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t" 
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="timestamp">Timestamp</option>
                            <option value="action">Action</option>
                            <option value="actor">Actor</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Sort Order
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value as 'asc' | 'desc');
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditTrailFilters;