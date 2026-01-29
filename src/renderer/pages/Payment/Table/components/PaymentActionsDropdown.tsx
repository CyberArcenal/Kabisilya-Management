// components/Payment/components/PaymentActionsDropdown.tsx
import React, { useRef, useEffect, useState } from 'react';
import {
    Eye, Edit, Trash2, CheckCircle, XCircle,
    FileText, RefreshCw, Download, MoreVertical,
    CreditCard, Banknote, Receipt, Calendar,
    TrendingUp, TrendingDown, Percent
} from 'lucide-react';
import type { PaymentData } from '../../../../apis/payment';

interface PaymentActionsDropdownProps {
    payment: PaymentData;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUpdateStatus: (newStatus: string) => void;
    onProcessPayment: () => void;
    onCancelPayment: () => void;
    onGenerateSlip: () => void;
}

const PaymentActionsDropdown: React.FC<PaymentActionsDropdownProps> = ({
    payment,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    onProcessPayment,
    onCancelPayment,
    onGenerateSlip
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDropdownPosition = () => {
        if (!buttonRef.current) return {};

        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 400;
        const windowHeight = window.innerHeight;

        if (rect.bottom + dropdownHeight > windowHeight) {
            return {
                bottom: `${windowHeight - rect.top + 5}px`,
                right: `${window.innerWidth - rect.right}px`,
            };
        }

        return {
            top: `${rect.bottom + 5}px`,
            right: `${window.innerWidth - rect.right}px`,
        };
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors relative"
                title="More Actions"
            >
                <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>

            {isOpen && (
                <div
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50 max-h-80 overflow-y-auto"
                    style={getDropdownPosition()}
                >
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Basic Actions
                        </div>

                        <button
                            onClick={() => handleAction(onView)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Eye className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                            <span>View Details</span>
                        </button>
                        <button
                            onClick={() => handleAction(onEdit)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Edit className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                            <span>Edit Payment</span>
                        </button>
                        <button
                            onClick={() => handleAction(onGenerateSlip)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <FileText className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                            <span>Generate Slip</span>
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status Actions
                        </div>

                        {payment.status === 'pending' && (
                            <button
                                onClick={() => handleAction(onProcessPayment)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span>Process Payment</span>
                            </button>
                        )}

                        {payment.status === 'pending' && (
                            <button
                                onClick={() => handleAction(() => onUpdateStatus('processing'))}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <RefreshCw className="w-4 h-4" style={{ color: 'var(--status-irrigation)' }} />
                                <span>Mark as Processing</span>
                            </button>
                        )}

                        {(payment.status === 'pending' || payment.status === 'processing') && (
                            <button
                                onClick={() => handleAction(onCancelPayment)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <XCircle className="w-4 h-4" style={{ color: 'var(--accent-rust)' }} />
                                <span>Cancel Payment</span>
                            </button>
                        )}

                        {payment.status === 'processing' && (
                            <button
                                onClick={() => handleAction(() => onUpdateStatus('completed'))}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <CheckCircle className="w-4 h-4" style={{ color: 'var(--status-planted)' }} />
                                <span>Mark as Completed</span>
                            </button>
                        )}

                        {payment.status === 'completed' && payment.netPay < payment.grossPay && (
                            <button
                                onClick={() => handleAction(() => onUpdateStatus('partially_paid'))}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Percent className="w-4 h-4" style={{ color: 'rgb(126, 34, 206)' }} />
                                <span>Mark as Partially Paid</span>
                            </button>
                        )}

                        <div className="border-t border-gray-100 my-1"></div>

                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Export
                        </div>

                        <button
                            onClick={() => handleAction(onGenerateSlip)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                            <span>Download Slip (PDF)</span>
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                            onClick={() => handleAction(onDelete)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Payment</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentActionsDropdown;