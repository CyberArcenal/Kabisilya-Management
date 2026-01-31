// components/User/components/UserStats.tsx
import React from 'react';
import { Users, UserCheck, Shield, Activity } from 'lucide-react';
import type { UserStatsData } from '../../../../apis/user';

interface UserStatsProps {
    stats: UserStatsData | null;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--accent-green-light)' }}>
                        <Users className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                            background: 'var(--accent-green-light)',
                            color: 'var(--accent-green)'
                        }}
                    >
                        Total
                    </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats?.totalUsers || 0}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Total Users</p>
            </div>

            <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--accent-sky-light)' }}>
                        <UserCheck className="w-6 h-6" style={{ color: 'var(--accent-sky)' }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                            background: 'var(--accent-sky-light)',
                            color: 'var(--accent-sky)'
                        }}
                    >
                        Active
                    </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats?.activeUsers || 0}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Active Users</p>
            </div>

            <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--accent-earth-light)' }}>
                        <Shield className="w-6 h-6" style={{ color: 'var(--accent-earth)' }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                            background: 'var(--accent-gold-light)',
                            color: 'var(--accent-gold)'
                        }}
                    >
                        Admins
                    </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats?.usersByRole?.find(r => r.role === 'admin')?.count || 0}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Administrators</p>
            </div>

            <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                }}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--accent-gold-light)' }}>
                        <Activity className="w-6 h-6" style={{ color: 'var(--accent-gold)' }} />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                            background: 'var(--accent-purple-light)',
                            color: 'var(--accent-purple)'
                        }}
                    >
                        Recent
                    </span>
                </div>
                <h3 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stats?.recentRegistrations || 0}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Recent Registrations</p>
            </div>
        </div>
    );
};

export default UserStats;