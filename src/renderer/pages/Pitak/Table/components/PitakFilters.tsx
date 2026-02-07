// Alternative version na mas compact para sa mobile
import React from 'react';
import { Search, Filter, RefreshCw, List, Grid, X } from 'lucide-react';
import BukidSelect from '../../../../components/Selects/Bukid';
interface PitakFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  handleRefresh: () => void;
  refreshing: boolean;
  // ✅ New props
  bukidFilter: number | null;
  setBukidFilter: (bukidId: number | null) => void;
}
const PitakFilters: React.FC<PitakFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  handleRefresh,
  refreshing,
  bukidFilter,
  setBukidFilter,
}) => {
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setBukidFilter(null);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || bukidFilter;

  return (
    <div 
      className="p-4 rounded-xl"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Top Row: Search, Bukid Filter, and Clear Button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Search */}
        <div className="md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                   style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search pitak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Bukid Filter */}
        <div className="md:col-span-1">
          <BukidSelect
            value={bukidFilter}
            onChange={setBukidFilter}
            placeholder="Filter by farm"
          />
        </div>

        {/* Clear Button (on desktop) */}
        <div className="hidden md:flex items-center justify-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-md"
              style={{
                background: 'var(--card-secondary-bg)',
                color: 'var(--accent-rust)',
                border: '1px solid var(--accent-rust-light)'
              }}
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filters and Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap mb-3 sm:mb-0">
          {['all', 'active', 'inactive', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${statusFilter === status ? '' : 'opacity-70 hover:opacity-100'}`}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Clear Button (on mobile) */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="md:hidden px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-md"
              style={{
                background: 'var(--card-secondary-bg)',
                color: 'var(--accent-rust)',
                border: '1px solid var(--accent-rust-light)'
              }}
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border" 
               style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-gray-100' : 'bg-white'}`}
              style={{ 
                color: viewMode === 'table' ? 'var(--primary-color)' : 'var(--text-secondary)',
                borderRight: '1px solid var(--border-color)'
              }}
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

          {/* Refresh Button */}
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
        </div>
      </div>
    </div>
  );
};

export default PitakFilters;