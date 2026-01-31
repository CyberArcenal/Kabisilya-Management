// components/Debt/hooks/useDebtActions.ts
import { useNavigate } from 'react-router-dom';
import type { DebtData } from '../../../../apis/debt';
import debtAPI from '../../../../apis/debt';
import { showError, showSuccess, showToast } from '../../../../utils/notification';
import { showConfirm } from '../../../../utils/dialogs';

export const useDebtActions = (
    debts: DebtData[],
    fetchDebts: () => Promise<void>,
    selectedDebts: number[]
) => {
    const navigate = useNavigate();

    const handleDeleteDebt = async (id: number) => {
        const debt = debts.find(d => d.id === id);
        const confirmed = await showConfirm({
            title: 'Delete Debt',
            message: `Are you sure you want to delete debt #${id}?`,
            icon: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting debt...', 'info');
            const response = await debtAPI.delete(id);

            if (response.status) {
                showSuccess('Debt deleted successfully');
                fetchDebts();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to delete debt');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedDebts.length === 0) return;

        const confirmed = await showConfirm({
            title: 'Bulk Delete Confirmation',
            message: `Are you sure you want to delete ${selectedDebts.length} selected debt(s)? This action cannot be undone.`,
            icon: 'danger',
            confirmText: 'Delete All',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting selected debts...', 'info');
            const results = await Promise.allSettled(
                selectedDebts.map(id => debtAPI.delete(id))
            );

            const successful = results.filter(r => r.status === 'fulfilled' && r.value.status);
            const failed = results.filter(r => r.status === 'rejected' || !r.value?.status);

            if (failed.length === 0) {
                showSuccess(`Successfully deleted ${successful.length} debt(s)`);
            } else {
                showError(`Deleted ${successful.length} debt(s), failed to delete ${failed.length} debt(s)`);
            }

            fetchDebts();
        } catch (err: any) {
            showError(err.message || 'Failed to delete debts');
        }
    };

    const handleExportCSV = async () => {
        try {
            showToast('Exporting to CSV...', 'info');
            const response = await debtAPI.exportToCSV();

            if (response.status) {
                // Create download link
                const link = document.createElement('a');
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = response.data.filePath || 'debts.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showSuccess('Debts exported to CSV successfully');
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to export CSV');
        }
    };

    const handleMakePayment = (id: number) => {
        navigate(`/debt/payment/${id}`);
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        const confirmed = await showConfirm({
            title: 'Update Debt Status',
            message: `Are you sure you want to update this debt's status to "${newStatus}"?`,
            icon: 'warning',
            confirmText: 'Update',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Updating debt status...', 'info');
            const response = await debtAPI.updateStatus(id, newStatus);

            if (response.status) {
                showSuccess('Debt status updated successfully');
                fetchDebts();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to update debt status');
        }
    };

    const handleViewHistory = (id: number) => {
        navigate(`/debt/history/${id}`);
    };

    return {
        handleDeleteDebt,
        handleBulkDelete,
        handleExportCSV,
        handleMakePayment,
        handleUpdateStatus,
        handleViewHistory
    };
};