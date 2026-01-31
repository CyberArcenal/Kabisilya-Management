// components/AuditTrail/components/AuditTrailTableRow.tsx
import React, { useState } from 'react';
import { Clock, Users, ChevronRight, Eye, FileText } from 'lucide-react';
import type { AuditTrailRecord } from '../../../apis/audit';
import { formatDate } from '../../../utils/formatters';
import AuditTrailActionsDropdown from './AuditTrailActionsDropdown';

interface AuditTrailTableRowProps {
    auditTrail: AuditTrailRecord;
    isSelected: boolean;
    isExpanded: boolean;
    onSelect: () => void;
    onToggleExpand: () => void;
    onView: (id: number) => void;
}

const AuditTrailTableRow: React.FC<AuditTrailTableRowProps> = ({
    auditTrail,
    isSelected,
    isExpanded,
    onSelect,
    onToggleExpand,
    onView
}) => {
    const getSeverityBadge = (action: string) => {
        // Same severity badge logic from original
        const actionLower = action.toLowerCase();
        let severity = 'system';
        
        if (actionLower.includes('error') || actionLower.includes('fail') || actionLower.includes('exception')) {
            severity = 'error';
        } else if (actionLower.includes('warn') || actionLower.includes('alert')) {
            severity = 'warning';
        }
        
        const config: Record<string, { bg: string; color: string; text: string }> = {
            error: { bg: 'var(--crop-diseased-bg)', color: 'var(--crop-diseased)', text: 'Error' },
            warning: { bg: 'var(--crop-stressed-bg)', color: 'var(--crop-stressed)', text: 'Warning' },
            system: { bg: 'var(--accent-earth-light)', color: 'var(--accent-earth)', text: 'System' }
        };
        
        const style = config[severity] || config.system;
        
        return (
            <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: style.bg, color: style.color }}
            >
                {style.text}
            </span>
        );
    };

    const formatDetails = (details: any) => {
        if (!details) return 'No details';
        if (typeof details === 'string') return details.substring(0, 100);
        if (typeof details === 'object') return JSON.stringify(details).substring(0, 100);
        return String(details).substring(0, 100);
    };

    const ExpandedView = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Audit Details
                    </span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>ID:</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {auditTrail.id}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Timestamp:</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formatDate(auditTrail.timestamp, 'yyyy-MM-dd HH:mm:ss.SSS')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-3 rounded-lg" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Actor Information
                    </span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Actor:</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {auditTrail.actor}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Action:</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {auditTrail.action}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-3 rounded-lg" style={{ background: 'var(--card-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Event Details
                    </span>
                </div>
                <div className="bg-gray-50 p-3 rounded overflow-auto max-h-60">
                    <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                        {typeof auditTrail.details === 'object' 
                            ? JSON.stringify(auditTrail.details, null, 2)
                            : auditTrail.details}
                    </pre>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors"
                style={{ borderBottom: '1px solid var(--border-color)' }}
            >
                <td className="p-4">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        className="rounded border-gray-300"
                    />
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {formatDate(auditTrail.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                ID: {auditTrail.id}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-4">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {auditTrail.action}
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {auditTrail.actor}
                        </span>
                    </div>
                </td>
                <td className="p-4">
                    {getSeverityBadge(auditTrail.action)}
                </td>
                <td className="p-4">
                    <div className="max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {formatDetails(auditTrail.details)}
                        {formatDetails(auditTrail.details).length > 100 && '...'}
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2">
                        <AuditTrailActionsDropdown
                            auditTrail={auditTrail}
                            onView={() => onView(auditTrail.id)}
                        />
                        <button
                            onClick={onToggleExpand}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="More Details"
                        >
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded Row */}
            {isExpanded && (
                <tr>
                    <td colSpan={7} className="p-4 bg-gray-50">
                        <ExpandedView />
                    </td>
                </tr>
            )}
        </>
    );
};

export default AuditTrailTableRow;