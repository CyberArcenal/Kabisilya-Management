// components/Payment/components/PaymentGridCard.tsx
import React from 'react';
import {
    DollarSign,
    Users,
    Calendar,
    Eye,
    Edit,
    CheckCircle,
    FileText,
    Banknote,
    CreditCard,
    FileText as FileTextIcon,
    Receipt
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../../../utils/formatters';
import type { PaymentData } from '../../../../apis/payment';

interface PaymentGridCardProps {
    payment: PaymentData;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onProcessPayment: (id: number) => void;
    onGenerateSlip: (id: number) => void;
}

const PaymentGridCard: React.FC<PaymentGridCardProps> = ({
    payment,
    isSelected,
    onSelect,
    onView,
    onEdit,
    onProcessPayment,
    onGenerateSlip
}) => {
    const getStatusBadge = (status: string = 'pending') => {
        const statusConfig: Record<string, any> = {
            pending: {
                text: 'Pending',
                bg: 'var(--status-growing-bg)',
                color: 'var(--status-growing)',
                border: 'rgba(214, 158, 46, 0.3)',
            },
            processing: {
                text: 'Processing',
                bg: 'var(--status-irrigation-bg)',
                color: 'var(--status-irrigation)',
                border: 'rgba(49, 130, 206, 0.3)',
            },
            completed: {
                text: 'Completed',
                bg: 'var(--status-planted-bg)',
                color: 'var(--status-planted)',
                border: 'rgba(56, 161, 105, 0.3)',
            },
            cancelled: {
                text: 'Cancelled',
                bg: 'var(--accent-rust-light)',
                color: 'var(--accent-rust)',
                border: 'rgba(197, 48, 48, 0.3)',
            },
            partially_paid: {
                text: 'Partially Paid',
                bg: 'rgba(168, 85, 247, 0.1)',
                color: 'rgb(126, 34, 206)',
                border: 'rgba(168, 85, 247, 0.2)',
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                    background: config.bg,
                    color: config.color,
                    border: `1px solid ${config.border}`
                }}
            >
                {config.text}
            </span>
        );
    };

    const getPaymentMethodIcon = (method: string | null) => {
        const iconConfig: Record<string, any> = {
            cash: { icon: Banknote, color: 'rgb(21, 128, 61)' },
            bank: { icon: CreditCard, color: 'rgb(29, 78, 216)' },
            check: { icon: FileTextIcon, color: 'rgb(180, 83, 9)' },
            digital: { icon: Receipt, color: 'rgb(109, 40, 217)' }
        };

        const config = method && iconConfig[method] ? iconConfig[method] : {
            icon: DollarSign,
            color: 'var(--text-tertiary)'
        };
        const Icon = config.icon;

        return <Icon className="w-4 h-4" style={{ color: config.color }} />;
    };

    return (
        <div
            className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg relative group"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
            }}
        >
            {/* Selection checkbox */}
            <div className="absolute top-3 right-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(payment.id)}
                    className="rounded border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-lg" style={{ background: 'var(--accent-green-light)' }}>
                    <DollarSign className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Payment #{payment.id}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {payment.paymentDate ? formatDate(payment.paymentDate, 'MMM dd, yyyy') : 'Not Paid'}
                        </span>
                    </div>
                    {getStatusBadge(payment.status)}
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {payment.worker?.name || 'No worker assigned'}
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(payment.netPay)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            Net Pay
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Gross Pay
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(payment.grossPay)}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Deductions
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--accent-rust)' }}>
                        {formatCurrency(payment.manualDeduction + payment.totalDebtDeduction + (payment.otherDeductions || 0))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Method
                    </div>
                    <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {payment.paymentMethod === 'cash' ? 'Cash' :
                             payment.paymentMethod === 'bank' ? 'Bank' :
                             payment.paymentMethod === 'check' ? 'Check' :
                             payment.paymentMethod === 'digital' ? 'Digital' : 'Not Specified'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes preview */}
            {payment.notes && (
                <div className="mb-4 p-3 rounded" style={{ background: 'var(--card-secondary-bg)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {payment.notes.length > 100 ? `${payment.notes.substring(0, 100)}...` : payment.notes}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Created {formatDate(payment.createdAt, 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(payment.id)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                    </button>
                    <button
                        onClick={() => onEdit(payment.id)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                    </button>
                    {payment.status === 'pending' && (
                        <button
                            onClick={() => onProcessPayment(payment.id)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Process"
                        >
                            <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                        </button>
                    )}
                    <button
                        onClick={() => onGenerateSlip(payment.id)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Slip"
                    >
                        <FileText className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentGridCard;