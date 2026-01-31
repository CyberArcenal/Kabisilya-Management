// components/AuditTrail/components/AuditTrailStats.tsx
import React from 'react';
import { Database, Activity, Users, BarChart3 } from 'lucide-react';
import type { AuditTrailStatsData } from '../../../apis/audit';
import { formatNumber } from '../../../utils/formatters';

interface AuditTrailStatsProps {
    stats: AuditTrailStatsData | null;
}

const AuditTrailStats: React.FC<AuditTrailStatsProps> = ({ stats }) => {
    const statsCards = [
        {
            title: 'Total Audit Records',
            value: stats?.totalCount || 0,
            icon: Database,
            color: 'var(--accent-green)',
            bgColor: 'var(--accent-green-light)',
            badgeText: 'Total',
            badgeColor: 'var(--accent-green-light)',
            badgeTextColor: 'var(--accent-green)'
        },
        {
            title: "Today's Activities",
            value: stats?.todayCount || 0,
            icon: Activity,
            color: 'var(--accent-sky)',
            bgColor: 'var(--accent-sky-light)',
            badgeText: 'Today',
            badgeColor: 'var(--accent-sky-light)',
            badgeTextColor: 'var(--accent-sky)'
        },
        {
            title: 'Unique Actors',
            value: stats?.topActors?.length || 0,
            icon: Users,
            color: 'var(--accent-earth)',
            bgColor: 'var(--accent-earth-light)',
            badgeText: 'Active Users',
            badgeColor: 'var(--accent-gold-light)',
            badgeTextColor: 'var(--accent-gold)'
        },
        {
            title: 'Recent Activities',
            value: stats?.recentActivityCount || 0,
            icon: BarChart3,
            color: 'var(--accent-gold)',
            bgColor: 'var(--accent-gold-light)',
            badgeText: 'Activity',
            badgeColor: 'var(--accent-purple-light)',
            badgeTextColor: 'var(--accent-purple)'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg"
                        style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div 
                                className="p-3 rounded-lg"
                                style={{ background: card.bgColor }}
                            >
                                <Icon className="w-6 h-6" style={{ color: card.color }} />
                            </div>
                            <span 
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                    background: card.badgeColor,
                                    color: card.badgeTextColor
                                }}
                            >
                                {card.badgeText}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {formatNumber(card.value)}
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            {card.title}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default AuditTrailStats;