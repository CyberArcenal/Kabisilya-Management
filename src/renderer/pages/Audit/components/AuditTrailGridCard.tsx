// components/AuditTrail/components/AuditTrailGridCard.tsx
import React from 'react';
import { Clock, Users, Eye, Activity, AlertCircle, AlertTriangle, Shield, UserCheck, Database, HardDrive } from 'lucide-react';
import type { AuditTrailRecord } from '../../../apis/audit';
import { formatDate } from '../../../utils/formatters';

interface AuditTrailGridCardProps {
    auditTrail: AuditTrailRecord;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
}

const AuditTrailGridCard: React.FC<AuditTrailGridCardProps> = ({
    auditTrail,
    isSelected,
    onSelect,
    onView
}) => {
    const getSeverityConfig = (action: string) => {
        const actionLower = action.toLowerCase();
        
        if (actionLower.includes('error') || actionLower.includes('fail') || actionLower.includes('exception')) {
            return {
                icon: AlertCircle,
                color: 'var(--crop-diseased)',
                bgColor: 'var(--crop-diseased-bg)',
                text: 'Error'
            };
        }
        
        if (actionLower.includes('warn') || actionLower.includes('alert')) {
            return {
                icon: AlertTriangle,
                color: 'var(--crop-stressed)',
                bgColor: 'var(--crop-stressed-bg)',
                text: 'Warning'
            };
        }
        
        if (actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('auth')) {
            return {
                icon: UserCheck,
                color: 'var(--accent-sky)',
                bgColor: 'var(--accent-sky-light)',
                text: 'Authentication'
            };
        }
        
        if (actionLower.includes('security') || actionLower.includes('breach') || actionLower.includes('access')) {
            return {
                icon: Shield,
                color: 'var(--accent-purple)',
                bgColor: 'var(--accent-purple-light)',
                text: 'Security'
            };
        }
        
        if (actionLower.includes('create') || actionLower.includes('update') || actionLower.includes('delete')) {
            return {
                icon: Database,
                color: 'var(--accent-green)',
                bgColor: 'var(--accent-green-light)',
                text: 'Data'
            };
        }
        
        return {
            icon: HardDrive,
            color: 'var(--accent-earth)',
            bgColor: 'var(--accent-earth-light)',
            text: 'System'
        };
    };

    const formatDetails = (details: any) => {
        if (!details) return 'No details';
        if (typeof details === 'string') return details.substring(0, 150);
        if (typeof details === 'object') return JSON.stringify(details).substring(0, 150);
        return String(details).substring(0, 150);
    };

    const severityConfig = getSeverityConfig(auditTrail.action);
    const SeverityIcon = severityConfig.icon;
    const details = formatDetails(auditTrail.details);

    return (
        <div
            className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg relative group"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)'
            }}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-4 right-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="rounded border-gray-300"
                />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div 
                    className="p-3 rounded-lg"
                    style={{ background: severityConfig.bgColor }}
                >
                    <SeverityIcon className="w-6 h-6" style={{ color: severityConfig.color }} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {auditTrail.action}
                        </span>
                        <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                                background: severityConfig.bgColor,
                                color: severityConfig.color
                            }}
                        >
                            {severityConfig.text}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(auditTrail.timestamp, 'HH:mm:ss')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actor */}
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {auditTrail.actor}
                </span>
            </div>

            {/* Details */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Details
                    </span>
                </div>
                <div className="p-3 rounded text-xs" 
                    style={{ 
                        background: 'var(--card-secondary-bg)', 
                        color: 'var(--text-secondary)',
                        minHeight: '60px'
                    }}
                >
                    {details}
                    {details.length > 150 && '...'}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t" 
                style={{ borderColor: 'var(--border-color)' }}
            >
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(auditTrail.timestamp, 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="View Details"
                        style={{ color: 'var(--accent-sky)' }}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditTrailGridCard;