// components/Debt/components/DebtTableView.tsx
import React, { useState } from 'react';
import { ChevronRight as ChevronRightIcon } from 'lucide-react';
import type { DebtData } from '../../../../apis/debt';
import DebtTableRow from './DebtTableRow';

interface DebtTableViewProps {
    debts: DebtData[];
    selectedDebts: number[];
    toggleSelectAll: () => void;
    toggleSelectDebt: (id: number) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onMakePayment: (id: number) => void;
    onUpdateStatus: (id: number, status: string) => void;
    onViewHistory: (id: number) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
}

const DebtTableView: React.FC<DebtTableViewProps> = ({
    debts,
    selectedDebts,
    toggleSelectAll,
    toggleSelectDebt,
    onView,
    onEdit,
    onDelete,
    onMakePayment,
    onUpdateStatus,
    onViewHistory,
    sortBy,
    sortOrder,
    onSort
}) => {
    const [expandedDebt, setExpandedDebt] = useState<number | null>(null);

    const toggleExpandDebt = (id: number) => {
        setExpandedDebt(prev => prev === id ? null : id);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedDebts.length === debts.length && debts.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                <button
                                    onClick={() => onSort('dateIncurred')}
                                    className="flex items-center gap-1 hover:text-blue-600"
                                >
                                    Date Incurred
                                    {sortBy === 'dateIncurred' && (
                                        <ChevronRightIcon className={`w-3 h-3 transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                Worker
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                <button
                                    onClick={() => onSort('amount')}
                                    className="flex items-center gap-1 hover:text-blue-600"
                                >
                                    Original Amount
                                    {sortBy === 'amount' && (
                                        <ChevronRightIcon className={`w-3 h-3 transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                <button
                                    onClick={() => onSort('balance')}
                                    className="flex items-center gap-1 hover:text-blue-600"
                                >
                                    Current Balance
                                    {sortBy === 'balance' && (
                                        <ChevronRightIcon className={`w-3 h-3 transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                Reason
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                Due Date
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                Status
                            </th>
                            <th className="p-4 text-left text-sm font-medium text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {debts.map((debt) => (
                            <DebtTableRow
                                key={debt.id}
                                debt={debt}
                                isSelected={selectedDebts.includes(debt.id)}
                                isExpanded={expandedDebt === debt.id}
                                onSelect={() => toggleSelectDebt(debt.id)}
                                onToggleExpand={() => toggleExpandDebt(debt.id)}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMakePayment={onMakePayment}
                                onUpdateStatus={onUpdateStatus}
                                onViewHistory={onViewHistory}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DebtTableView;