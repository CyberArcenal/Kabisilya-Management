// components/AuditTrail/components/AuditTrailGridView.tsx
import React from 'react';
import type { AuditTrailRecord } from '../../../apis/audit';
import AuditTrailGridCard from './AuditTrailGridCard';

interface AuditTrailGridViewProps {
    auditTrails: AuditTrailRecord[];
    selectedTrails: number[];
    toggleSelectTrail: (id: number) => void;
    onView: (id: number) => void;
}

const AuditTrailGridView: React.FC<AuditTrailGridViewProps> = ({
    auditTrails,
    selectedTrails,
    toggleSelectTrail,
    onView
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {auditTrails.map((trail) => (
                <AuditTrailGridCard
                    key={trail.id}
                    auditTrail={trail}
                    isSelected={selectedTrails.includes(trail.id)}
                    onSelect={() => toggleSelectTrail(trail.id)}
                    onView={() => onView(trail.id)}
                />
            ))}
        </div>
    );
};

export default AuditTrailGridView;