// components/Debt/components/DebtGridView.tsx
import React from 'react';
import type { DebtData } from '../../../../apis/debt';
import DebtGridCard from './DebtGridCard';

interface DebtGridViewProps {
    debts: DebtData[];
    selectedDebts: number[];
    toggleSelectDebt: (id: number) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onMakePayment: (id: number) => void;
    onUpdateStatus: (id: number, status: string) => void;
    onViewHistory: (id: number) => void;
}

const DebtGridView: React.FC<DebtGridViewProps> = ({
    debts,
    selectedDebts,
    toggleSelectDebt,
    onView,
    onEdit,
    onDelete,
    onMakePayment,
    onUpdateStatus,
    onViewHistory
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debts.map((debt) => (
                <DebtGridCard
                    key={debt.id}
                    debt={debt}
                    isSelected={selectedDebts.includes(debt.id)}
                    onSelect={() => toggleSelectDebt(debt.id)}
                    onView={() => onView(debt.id)}
                    onEdit={() => onEdit(debt.id)}
                    onDelete={() => onDelete(debt.id)}
                    onMakePayment={() => onMakePayment(debt.id)}
                    onUpdateStatus={(status: string) => onUpdateStatus(debt.id, status)}
                    onViewHistory={() => onViewHistory(debt.id)}
                />
            ))}
        </div>
    );
};

export default DebtGridView;