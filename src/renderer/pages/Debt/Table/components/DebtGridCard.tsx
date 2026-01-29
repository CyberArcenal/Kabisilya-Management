// components/Debt/components/DebtGridCard.tsx
import React from 'react';
import { DollarSign, Calendar, Users, Banknote, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import type { DebtData } from '../../../../apis/debt';

interface DebtGridCardProps {
    debt: DebtData;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onMakePayment: () => void;
    onUpdateStatus: (status: string) => void;
    onViewHistory: () => void;
}

const DebtGridCard: React.FC<DebtGridCardProps> = ({
    debt,
    isSelected,
    onSelect,
    onView,
    onEdit,
    onDelete,
    onMakePayment,
    onUpdateStatus,
    onViewHistory
}) => {
    const getStatusBadge = (status: string = 'pending') => {
        const statusConfig: Record<string, any> = {
            pending: {
                text: 'Pending',
                bg: 'bg-yellow-50',
                color: 'text-yellow-600',
                border: 'border-yellow-200'
            },
            partially_paid: {
                text: 'Partially Paid',
                bg: 'bg-purple-50',
                color: 'text-purple-600',
                border: 'border-purple-200'
            },
            paid: {
                text: 'Paid',
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200'
            },
            cancelled: {
                text: 'Cancelled',
                bg: 'bg-red-50',
                color: 'text-red-600',
                border: 'border-red-200'
            },
            overdue: {
                text: 'Overdue',
                bg: 'bg-red-100',
                color: 'text-red-700',
                border: 'border-red-300'
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}
            >
                {config.text}
            </span>
        );
    };

    return (
        <div
            className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200 relative"
        >
            {/* Selection checkbox */}
            <div className="absolute top-3 right-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="rounded border-gray-300"
                />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-50">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">
                        Debt #{debt.id}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {formatDate(debt.dateIncurred, 'MMM dd, yyyy')}
                        </span>
                    </div>
                    {getStatusBadge(debt.status)}
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                            {debt.worker?.name || 'No worker assigned'}
                        </span>
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-medium ${debt.balance > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatCurrency(debt.balance)}
                        </div>
                        <div className="text-xs text-gray-500">
                            Balance
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Original Amount
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                        {formatCurrency(debt.originalAmount || debt.amount)}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Amount Paid
                    </div>
                    <div className="text-sm font-medium text-green-600">
                        {formatCurrency(debt.totalPaid)}
                    </div>
                </div>

                {debt.dueDate && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Due Date
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                            {formatDate(debt.dueDate, 'MMM dd, yyyy')}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Reason
                    </div>
                    <div className="text-sm font-medium truncate max-w-[150px]" title={debt.reason || ''}>
                        {debt.reason || 'No reason provided'}
                    </div>
                </div>
            </div>

            {/* Interest info */}
            {debt.interestRate > 0 && (
                <div className="mb-4 p-3 rounded bg-yellow-50 border border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                            Interest Rate
                        </div>
                        <div className="text-xs font-medium text-yellow-600">
                            {debt.interestRate}%
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-gray-600">
                            Total Interest
                        </div>
                        <div className="text-xs font-medium text-yellow-600">
                            {formatCurrency(debt.totalInterest)}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    Created {formatDate(debt.createdAt, 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onView}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors text-blue-500"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors text-yellow-500"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {debt.balance > 0 && debt.status !== 'cancelled' && (
                        <button
                            onClick={onMakePayment}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors text-green-500"
                            title="Make Payment"
                        >
                            <DollarSign className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onViewHistory}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors text-purple-500"
                        title="History"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors text-red-500"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebtGridCard;