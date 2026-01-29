// components/AuditTrail/components/AuditTrailTableView.tsx
import React, { useState } from 'react';
import { ChevronRight as ChevronRightIcon } from 'lucide-react';
import AuditTrailTableRow from './AuditTrailTableRow';
import type { AuditTrailRecord } from '../../../apis/audit';

interface AuditTrailTableViewProps {
    auditTrails: AuditTrailRecord[];
    selectedTrails: number[];
    toggleSelectAll: () => void;
    toggleSelectTrail: (id: number) => void;
    onView: (id: number) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
}

const AuditTrailTableView: React.FC<AuditTrailTableViewProps> = ({
    auditTrails,
    selectedTrails,
    toggleSelectAll,
    toggleSelectTrail,
    onView,
    sortBy,
    sortOrder,
    onSort
}) => {
    const [expandedTrail, setExpandedTrail] = useState<number | null>(null);

    const toggleExpandTrail = (id: number) => {
        setExpandedTrail(prev => prev === id ? null : id);
    };

    const sortableHeaders = [
        { field: 'timestamp', label: 'Timestamp' },
        { field: 'action', label: 'Action' },
        { field: 'actor', label: 'Actor' }
    ];

    return (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ background: 'var(--table-header-bg)' }}>
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedTrails.length === auditTrails.length && auditTrails.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded"
                                    style={{ borderColor: 'var(--border-color)' }}
                                />
                            </th>
                            
                            {sortableHeaders.map((header) => (
                                <th key={header.field} className="p-4 text-left text-sm font-medium" 
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <button
                                        onClick={() => onSort(header.field)}
                                        className="flex items-center gap-1 hover:text-primary w-full text-left"
                                    >
                                        {header.label}
                                        {sortBy === header.field && (
                                            <ChevronRightIcon className={`w-3 h-3 transform ${
                                                sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'
                                            }`} />
                                        )}
                                    </button>
                                </th>
                            ))}
                            
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Severity
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Details
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditTrails.map((trail) => (
                            <AuditTrailTableRow
                                key={trail.id}
                                auditTrail={trail}
                                isSelected={selectedTrails.includes(trail.id)}
                                isExpanded={expandedTrail === trail.id}
                                onSelect={() => toggleSelectTrail(trail.id)}
                                onToggleExpand={() => toggleExpandTrail(trail.id)}
                                onView={onView}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditTrailTableView;