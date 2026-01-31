// components/AuditTrail/components/AuditTrailBulkActions.tsx
import React from 'react';
import { Trash2, X, Download, Archive, FileText } from 'lucide-react';

interface AuditTrailBulkActionsProps {
    selectedCount: number;
    onBulkDelete: () => void;
    onClearSelection: () => void;
    onExportSelected?: () => void;
    onArchiveSelected?: () => void;
    onGenerateReport?: () => void;
}

const AuditTrailBulkActions: React.FC<AuditTrailBulkActionsProps> = ({
    selectedCount,
    onBulkDelete,
    onClearSelection,
    onExportSelected,
    onArchiveSelected,
    onGenerateReport
}) => {
    return (
        <div className="p-4 rounded-xl flex items-center justify-between"
            style={{
                background: 'var(--card-hover-bg)',
                border: '1px solid var(--border-color)'
            }}
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                        background: 'var(--primary-color)',
                        color: 'var(--sidebar-text)'
                    }}
                >
                    {selectedCount}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedCount} audit trail{selectedCount !== 1 ? 's' : ''} selected
                </span>
            </div>
            <div className="flex gap-2">
                {onGenerateReport && (
                    <button
                        onClick={onGenerateReport}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center"
                        style={{
                            background: 'var(--card-secondary-bg)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                    </button>
                )}

                {onExportSelected && (
                    <button
                        onClick={onExportSelected}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center"
                        style={{
                            background: 'var(--card-secondary-bg)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Selected
                    </button>
                )}

                {onArchiveSelected && (
                    <button
                        onClick={onArchiveSelected}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center"
                        style={{
                            background: 'var(--accent-sky-light)',
                            color: 'var(--accent-sky)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Selected
                    </button>
                )}

                <button
                    onClick={onBulkDelete}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center"
                    style={{
                        background: 'var(--accent-rust)',
                        color: 'white'
                    }}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                </button>

                <button
                    onClick={onClearSelection}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center"
                    style={{
                        background: 'var(--card-secondary-bg)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear Selection
                </button>
            </div>
        </div>
    );
};

export default AuditTrailBulkActions;