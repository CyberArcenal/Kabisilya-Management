// components/AuditTrail/components/AuditTrailPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditTrailPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    onPageChange: (page: number) => void;
}

const AuditTrailPagination: React.FC<AuditTrailPaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    limit,
    onPageChange
}) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxVisiblePages; i++) {
                    pages.push(i);
                }
                if (totalPages > maxVisiblePages) {
                    pages.push('...');
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - (maxVisiblePages - 1); i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
            }}
        >
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Showing {startItem} to {endItem} of {totalItems} audit trails
            </div>
            
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                    style={{
                        background: currentPage === 1 ? 'var(--card-secondary-bg)' : 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                    }}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {renderPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2" style={{ color: 'var(--text-tertiary)' }}>
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === page ? '' : 'hover:shadow-md'
                            }`}
                            style={{
                                background: currentPage === page ? 'var(--primary-color)' : 'var(--card-bg)',
                                color: currentPage === page ? 'var(--sidebar-text)' : 'var(--text-primary)',
                                border: `1px solid ${
                                    currentPage === page ? 'var(--primary-color)' : 'var(--border-color)'
                                }`
                            }}
                        >
                            {page}
                        </button>
                    )
                ))}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                    style={{
                        background: currentPage === totalPages ? 'var(--card-secondary-bg)' : 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                    }}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AuditTrailPagination;