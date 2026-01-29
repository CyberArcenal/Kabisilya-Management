// components/AuditTrail/Dialogs/AuditTrailViewDialog.tsx
import React from 'react';
import { X, Eye, Calendar, User, FileText, Activity, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';

interface AuditTrailViewDialogProps {
    id: number;
    onClose: () => void;
}

const AuditTrailViewDialog: React.FC<AuditTrailViewDialogProps> = ({ id, onClose }) => {
    // This is a placeholder - implement actual data fetching
    const auditTrail = {
        id: id,
        timestamp: new Date().toISOString(),
        action: 'user_login',
        actor: 'admin@example.com',
        details: { ip: '192.168.1.1', userAgent: 'Chrome 120.0' },
        severity: 'info'
    };

    const handleCopyDetails = () => {
        navigator.clipboard.writeText(JSON.stringify(auditTrail.details, null, 2));
        // Show toast notification
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ background: 'var(--card-bg)' }}
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-purple-light)' }}>
                            <Eye className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Audit Trail Details
                            </h2>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                ID: {auditTrail.id}
                            </p>
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Basic Info Card */}
                        <div className="p-5 rounded-xl" style={{ 
                            background: 'var(--card-secondary-bg)', 
                            border: '1px solid var(--border-color)' 
                        }}>
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Basic Information
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Event ID
                                    </p>
                                    <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                                        {auditTrail.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Action Type
                                    </p>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {auditTrail.action}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timestamp Card */}
                        <div className="p-5 rounded-xl" style={{ 
                            background: 'var(--card-secondary-bg)', 
                            border: '1px solid var(--border-color)' 
                        }}>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5" style={{ color: 'var(--accent-sky)' }} />
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Timestamp
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Date & Time
                                    </p>
                                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {formatDate(auditTrail.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        ISO Format
                                    </p>
                                    <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                                        {auditTrail.timestamp}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actor Card */}
                        <div className="p-5 rounded-xl" style={{ 
                            background: 'var(--card-secondary-bg)', 
                            border: '1px solid var(--border-color)' 
                        }}>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5" style={{ color: 'var(--accent-earth)' }} />
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Actor Information
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Actor
                                    </p>
                                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {auditTrail.actor}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="p-5 rounded-xl mb-6" style={{ 
                        background: 'var(--card-secondary-bg)', 
                        border: '1px solid var(--border-color)' 
                    }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Event Details
                                </h3>
                            </div>
                            <button
                                onClick={handleCopyDetails}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                                style={{ 
                                    background: 'var(--accent-green-light)', 
                                    color: 'var(--accent-green)',
                                    border: '1px solid var(--border-color)'
                                }}
                            >
                                Copy Details
                            </button>
                        </div>
                        <div className="bg-white p-4 rounded-lg overflow-auto max-h-96">
                            <pre className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                                {JSON.stringify(auditTrail.details, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Placeholder for additional sections */}
                    <div className="p-5 rounded-xl" style={{ 
                        background: 'var(--card-secondary-bg)', 
                        border: '1px solid var(--border-color)' 
                    }}>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />
                            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                Additional Information
                            </h3>
                        </div>
                        <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                            Additional audit trail information will be displayed here in future updates.
                        </p>
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
                        Close
                    </button>
                    <button
                        onClick={() => {/* Implement export */}}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                        style={{ 
                            background: 'var(--primary-color)', 
                            color: 'var(--sidebar-text)'
                        }}
                    >
                        Export as JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditTrailViewDialog;