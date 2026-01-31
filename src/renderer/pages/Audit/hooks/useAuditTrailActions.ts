// components/AuditTrail/hooks/useAuditTrailActions.ts

import auditAPI from "../../../apis/audit";
import { showConfirm } from "../../../utils/dialogs";
import { showError, showSuccess, showToast } from "../../../utils/notification";

export const useAuditTrailActions = (
    selectedTrails: number[],
    fetchAuditTrails: () => Promise<void>,
    filters: {
        dateFrom: string;
        dateTo: string;
        actionFilter: string;
        actorFilter: string;
    }
) => {
    const handleExportCSV = async () => {
        try {
            showToast('Exporting audit trails to CSV...', 'info');

            const response = await auditAPI.exportAuditTrailsToCSV({
                startDate: filters.dateFrom || undefined,
                endDate: filters.dateTo || undefined,
                filters: {
                    action: filters.actionFilter !== 'all' ? filters.actionFilter : undefined,
                    actor: filters.actorFilter || undefined
                }
            });

            if (response.status) {
                // Create download link
                const link = document.createElement('a');
                const blob = new Blob([response.data.downloadUrl], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = response.data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showSuccess(`Exported ${response.data.recordCount} records to CSV`);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to export to CSV');
        }
    };

    const handleExportJSON = async () => {
        try {
            showToast('Exporting audit trails to JSON...', 'info');

            const response = await auditAPI.exportAuditTrailsToJSON({
                startDate: filters.dateFrom || undefined,
                endDate: filters.dateTo || undefined,
                filters: {
                    action: filters.actionFilter !== 'all' ? filters.actionFilter : undefined,
                    actor: filters.actorFilter || undefined
                },
                format: 'pretty'
            });

            if (response.status) {
                const link = document.createElement('a');
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = response.data.filename || 'audit-trails.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showSuccess(`Exported ${response.data.recordCount} records to JSON`);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to export to JSON');
        }
    };

    const handleGenerateReport = async (reportType: string) => {
        try {
            showToast(`Generating ${reportType} report...`, 'info');

            const response = await auditAPI.generateAuditReport({
                reportType: reportType as any,
                startDate: filters.dateFrom || undefined,
                endDate: filters.dateTo || undefined,
                format: 'pdf'
            });

            if (response.status) {
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.download = response.data.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showSuccess(`Report generated: ${response.data.fileName}`);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to generate report');
        }
    };

    const handleCleanupOldTrails = async () => {
        const confirmed = await showConfirm({
            title: 'Cleanup Old Audit Trails',
            message: 'This will delete audit trails older than 90 days. This action cannot be undone.',
            icon: 'danger',
            confirmText: 'Cleanup',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Cleaning up old audit trails...', 'info');
            const response = await auditAPI.cleanupOldAuditTrails({
                daysToKeep: 90,
                dryRun: false
            });

            if (response.status) {
                showSuccess(`Cleaned up ${response.data.actuallyDeleted} old records`);
                fetchAuditTrails();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to cleanup old trails');
        }
    };

    const handleArchiveTrails = async () => {
        const confirmed = await showConfirm({
            title: 'Archive Audit Trails',
            message: 'This will archive audit trails older than 12 months and remove them from the active database.',
            icon: 'warning',
            confirmText: 'Archive',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Archiving audit trails...', 'info');
            const response = await auditAPI.archiveAuditTrails({
                monthsOld: 12,
                archiveFormat: 'zip',
                compress: true
            });

            if (response.status) {
                showSuccess(`Archived ${response.data.recordsArchived} records`);
                fetchAuditTrails();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to archive trails');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTrails.length === 0) return;

        const confirmed = await showConfirm({
            title: 'Bulk Delete Confirmation',
            message: `Are you sure you want to delete ${selectedTrails.length} selected audit trail(s)? This action is irreversible.`,
            icon: 'danger',
            confirmText: 'Delete All',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting selected audit trails...', 'info');
            // Bulk delete implementation
            showError('Bulk delete functionality not yet implemented');
        } catch (err: any) {
            showError(err.message || 'Failed to delete audit trails');
        }
    };

    const handleCompactTrails = async () => {
        const confirmed = await showConfirm({
            title: 'Compact Audit Trails',
            message: 'This will summarize and compress older audit trail entries to save space while preserving statistics.',
            icon: 'warning',
            confirmText: 'Compact',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Compacting audit trails...', 'info');
            const response = await auditAPI.compactAuditTrails({
                monthsOld: 6,
                compactMethod: 'summarize',
                sampleRate: 0.1
            });

            if (response.status) {
                showSuccess(`Compacted ${response.data.originalCount} records to ${response.data.compactedCount}`);
                fetchAuditTrails();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to compact trails');
        }
    };

    return {
        handleExportCSV,
        handleExportJSON,
        handleGenerateReport,
        handleCleanupOldTrails,
        handleArchiveTrails,
        handleBulkDelete,
        handleCompactTrails
    };
};