// components/Payment/hooks/usePaymentActions.ts
import { useCallback } from 'react';
import { showError, showSuccess, showToast } from '../../../../utils/notification';
import paymentAPI from '../../../../apis/payment';
import type { PaymentData } from '../../../../apis/payment';
import { showConfirm } from '../../../../utils/dialogs';

export const usePaymentActions = (
    payments: PaymentData[],
    fetchPayments: () => Promise<void>,
    selectedPayments: number[],
    setSelectedPayments: React.Dispatch<React.SetStateAction<number[]>>
) => {
    const handleDeletePayment = useCallback(async (id: number) => {
        const confirmed = await showConfirm({
            title: 'Delete Payment',
            message: `Are you sure you want to delete payment #${id}?`,
            icon: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting payment...', 'info');
            const response = await paymentAPI.deletePayment(id);

            if (response.status) {
                showSuccess('Payment deleted successfully');
                fetchPayments();
                setSelectedPayments(prev => prev.filter(item => item !== id));
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to delete payment');
        }
    }, [payments, fetchPayments, setSelectedPayments]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedPayments.length === 0) return;

        const confirmed = await showConfirm({
            title: 'Bulk Delete Confirmation',
            message: `Are you sure you want to delete ${selectedPayments.length} selected payment(s)? This action cannot be undone.`,
            icon: 'danger',
            confirmText: 'Delete All',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting selected payments...', 'info');
            const results = await Promise.allSettled(
                selectedPayments.map(id => paymentAPI.deletePayment(id))
            );

            const successful = results.filter(r => r.status === 'fulfilled' && r.value.status);
            const failed = results.filter(r => r.status === 'rejected' || !r.value?.status);

            if (failed.length === 0) {
                showSuccess(`Successfully deleted ${successful.length} payment(s)`);
            } else {
                showError(`Deleted ${successful.length} payment(s), failed to delete ${failed.length} payment(s)`);
            }

            fetchPayments();
            setSelectedPayments([]);
        } catch (err: any) {
            showError(err.message || 'Failed to delete payments');
        }
    }, [selectedPayments, fetchPayments, setSelectedPayments]);

    const handleExportCSV = useCallback(async () => {
        try {
            showToast('Exporting to CSV...', 'info');
            const response = await paymentAPI.exportPaymentsToCSV({
                startDate: '',
                endDate: '',
                status: undefined,
                workerId: undefined
            });

            if (response.status) {
                const link = document.createElement('a');
                const blob = new Blob([response.data.content], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = response.data.fileName || 'payments.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showSuccess(`Exported ${response.data.count} records to CSV`);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to export CSV');
        }
    }, []);

    const handleUpdateStatus = useCallback(async (id: number, currentStatus: string, newStatus: string) => {
        const action = newStatus === 'completed' ? 'complete' :
            newStatus === 'processing' ? 'process' :
                newStatus === 'cancelled' ? 'cancel' : 'update';

        const confirmed = await showConfirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Payment`,
            message: `Are you sure you want to ${action} this payment?`,
            icon: 'warning',
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast(`${action.charAt(0).toUpperCase() + action.slice(1)}ing payment...`, 'info');
            const response = await paymentAPI.updatePaymentStatus(id, { status: newStatus });

            if (response.status) {
                showSuccess(`Payment ${action}ed successfully`);
                fetchPayments();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || `Failed to ${action} payment`);
        }
    }, [fetchPayments]);

    const handleProcessPayment = useCallback(async (id: number) => {
        try {
            showToast('Processing payment...', 'info');
            const response = await paymentAPI.processPayment(id);

            if (response.status) {
                showSuccess('Payment processed successfully');
                fetchPayments();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to process payment');
        }
    }, [fetchPayments]);

    const handleCancelPayment = useCallback(async (id: number) => {
        const confirmed = await showConfirm({
            title: 'Cancel Payment',
            message: 'Are you sure you want to cancel this payment?',
            icon: 'warning',
            confirmText: 'Cancel Payment',
            cancelText: 'Keep Active'
        });

        if (!confirmed) return;

        try {
            showToast('Cancelling payment...', 'info');
            const response = await paymentAPI.cancelPayment(id, 'Cancelled by user');

            if (response.status) {
                showSuccess('Payment cancelled successfully');
                fetchPayments();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to cancel payment');
        }
    }, [fetchPayments]);

    const handleGeneratePaymentSlip = useCallback(async (id: number) => {
        try {
            showToast('Generating payment slip...', 'info');
            const response = await paymentAPI.exportPaymentSlip(id);

            if (response.status) {
                const link = document.createElement('a');
                const blob = new Blob([response.data.content], { type: response.data.contentType });
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = response.data.fileName || `payment-slip-${id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showSuccess('Payment slip generated successfully');
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to generate payment slip');
        }
    }, []);

    return {
        handleDeletePayment,
        handleBulkDelete,
        handleExportCSV,
        handleUpdateStatus,
        handleProcessPayment,
        handleCancelPayment,
        handleGeneratePaymentSlip
    };
};