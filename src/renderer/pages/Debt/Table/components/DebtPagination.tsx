// components/Debt/components/DebtPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DebtPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    onPageChange: (page: number) => void;
}

const DebtPagination: React.FC<DebtPaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    limit,
    onPageChange
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} debts
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === pageNum 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'border border-gray-300 bg-white text-gray-700 hover:shadow-md hover:bg-gray-50'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default DebtPagination;