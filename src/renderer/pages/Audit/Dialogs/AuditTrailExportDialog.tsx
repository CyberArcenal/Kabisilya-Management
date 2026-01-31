// components/AuditTrail/Dialogs/AuditTrailExportDialog.tsx
import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Filter } from 'lucide-react';

interface AuditTrailExportDialogProps {
    onClose: () => void;
    onExport: (format: 'csv' | 'json' | 'pdf', options: any) => void;
    filters: {
        dateFrom: string;
        dateTo: string;
        actionFilter: string;
        actorFilter: string;
    };
}

const AuditTrailExportDialog: React.FC<AuditTrailExportDialogProps> = ({
    onClose,
    onExport,
    filters
}) => {
    const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
    const [includeDetails, setIncludeDetails] = useState(true);
    const [compress, setCompress] = useState(false);
    const [dateRange, setDateRange] = useState<'all' | 'custom'>('all');

    const handleExport = () => {
        const options = {
            format: exportFormat,
            includeDetails,
            compress,
            filters: dateRange === 'custom' ? filters : undefined
        };
        onExport(exportFormat, options);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
                style={{ background: 'var(--card-bg)' }}
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-green-light)' }}>
                            <Download className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Export Audit Trails
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Export Format */}
                        <div>
                            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                                Export Format
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'csv', label: 'CSV', icon: FileText, color: 'var(--accent-green)' },
                                    { value: 'json', label: 'JSON', icon: FileText, color: 'var(--accent-purple)' },
                                    { value: 'pdf', label: 'PDF', icon: FileText, color: 'var(--accent-rust)' }
                                ].map((format) => (
                                    <button
                                        key={format.value}
                                        onClick={() => setExportFormat(format.value as any)}
                                        className={`p-4 rounded-lg border transition-all duration-200 ${
                                            exportFormat === format.value ? 'ring-2 ring-offset-1' : ''
                                        }`}
                                        style={{
                                            background: exportFormat === format.value 
                                                ? format.color + '20' 
                                                : 'var(--card-secondary-bg)',
                                            borderColor: exportFormat === format.value 
                                                ? format.color 
                                                : 'var(--border-color)',
                                            color: exportFormat === format.value 
                                                ? format.color 
                                                : 'var(--text-primary)'
                                        }}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-6 h-6" />
                                            <span className="text-sm font-medium">{format.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                                Date Range
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDateRange('all')}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                        dateRange === 'all' ? 'ring-2 ring-offset-1' : ''
                                    }`}
                                    style={{
                                        background: dateRange === 'all' 
                                            ? 'var(--accent-sky-light)' 
                                            : 'var(--card-secondary-bg)',
                                        borderColor: dateRange === 'all' 
                                            ? 'var(--accent-sky)' 
                                            : 'var(--border-color)',
                                        color: dateRange === 'all' 
                                            ? 'var(--accent-sky)' 
                                            : 'var(--text-primary)'
                                    }}
                                >
                                    All Data
                                </button>
                                <button
                                    onClick={() => setDateRange('custom')}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                        dateRange === 'custom' ? 'ring-2 ring-offset-1' : ''
                                    }`}
                                    style={{
                                        background: dateRange === 'custom' 
                                            ? 'var(--accent-earth-light)' 
                                            : 'var(--card-secondary-bg)',
                                        borderColor: dateRange === 'custom' 
                                            ? 'var(--accent-earth)' 
                                            : 'var(--border-color)',
                                        color: dateRange === 'custom' 
                                            ? 'var(--accent-earth)' 
                                            : 'var(--text-primary)'
                                    }}
                                >
                                    Current Filters
                                </button>
                            </div>
                            {dateRange === 'custom' && filters.dateFrom && filters.dateTo && (
                                <div className="mt-2 p-3 rounded-lg text-sm"
                                    style={{ 
                                        background: 'var(--card-secondary-bg)',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {filters.dateFrom} to {filters.dateTo}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={includeDetails}
                                    onChange={(e) => setIncludeDetails(e.target.checked)}
                                    className="rounded"
                                    style={{ borderColor: 'var(--border-color)' }}
                                />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Include Full Details
                                </span>
                            </label>

                            {exportFormat === 'json' && (
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={compress}
                                        onChange={(e) => setCompress(e.target.checked)}
                                        className="rounded"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        Compress (ZIP)
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{ 
                            background: 'var(--card-secondary-bg)', 
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center"
                        style={{ 
                            background: 'var(--primary-color)', 
                            color: 'var(--sidebar-text)'
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export {exportFormat.toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditTrailExportDialog;