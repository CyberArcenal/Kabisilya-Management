// components/Payment/components/PaymentGridView.tsx
import React from 'react';
import type { PaymentData } from '../../../../apis/payment';
import PaymentGridCard from './PaymentGridCard';

interface PaymentGridViewProps {
    payments: PaymentData[];
    selectedPayments: number[];
    toggleSelectPayment: (id: number) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, currentStatus: string, newStatus: string) => void;
    onProcessPayment: (id: number) => void;
    onGenerateSlip: (id: number) => void;
}

const PaymentGridView: React.FC<PaymentGridViewProps> = ({
    payments,
    selectedPayments,
    toggleSelectPayment,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    onProcessPayment,
    onGenerateSlip
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.map((payment) => (
                <PaymentGridCard
                    key={payment.id}
                    payment={payment}
                    isSelected={selectedPayments.includes(payment.id)}
                    onSelect={toggleSelectPayment}
                    onView={onView}
                    onEdit={onEdit}
                    onProcessPayment={onProcessPayment}
                    onGenerateSlip={onGenerateSlip}
                />
            ))}
        </div>
    );
};

export default PaymentGridView;