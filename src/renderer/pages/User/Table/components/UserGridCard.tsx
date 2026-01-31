// components/User/components/UserGridCard.tsx
import React from 'react';
import { Users, Calendar, Mail, Phone, Clock, Eye, Edit, UserX, UserCheck } from 'lucide-react';
import { formatDate } from '../../../../utils/formatters';
import type { UserData } from '../../../../apis/user';

interface UserGridCardProps {
    user: UserData;
    isSelected: boolean;
    onSelect: () => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, currentStatus: boolean) => void;
}

const UserGridCard: React.FC<UserGridCardProps> = ({
    user,
    isSelected,
    onSelect,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus
}) => {
    const getRoleBadge = (role: string = 'user') => {
        const roleConfig = {
            admin: {
                text: 'Admin',
                bg: 'var(--status-completed-bg)',
                color: 'var(--status-completed)',
                border: 'rgba(128, 90, 213, 0.3)'
            },
            manager: {
                text: 'Manager',
                bg: 'var(--status-growing-bg)',
                color: 'var(--status-growing)',
                border: 'rgba(214, 158, 46, 0.3)'
            },
            user: {
                text: 'User',
                bg: 'var(--status-planted-bg)',
                color: 'var(--status-planted)',
                border: 'rgba(56, 161, 105, 0.3)'
            }
        };

        const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

        return (
            <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                    background: config.bg,
                    color: config.color,
                    border: `1px solid ${config.border}`
                }}
            >
                {config.text}
            </span>
        );
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 status-badge-active">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Active
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 status-badge-inactive">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Inactive
            </span>
        );
    };

    return (
        <div
            className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg relative"
            style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
            }}
        >
            {/* Selection checkbox */}
            <div className="absolute top-3 right-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="rounded"
                    style={{ borderColor: 'var(--border-color)' }}
                />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-lg" style={{ background: 'var(--accent-green-light)' }}>
                    <Users className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {user.username}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Joined {formatDate(user.createdAt, 'MMM dd, yyyy')}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.isActive)}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {user.email}
                    </span>
                </div>
                {user.name && (
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: 'var(--accent-earth)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {user.name}
                        </span>
                    </div>
                )}
                {user.contact && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {user.contact}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Last login: {user.lastLogin ? formatDate(user.lastLogin, 'MMM dd, yyyy') : 'Never'}
                    </span>
                </div>
            </div>

            {/* Address preview */}
            {user.address && (
                <div className="mb-4 p-3 rounded" style={{ background: 'var(--card-secondary-bg)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {user.address.length > 100 ? `${user.address.substring(0, 100)}...` : user.address}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    User ID: {user.id}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(user.id)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
                    </button>
                    <button
                        onClick={() => onEdit(user.id)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                    </button>
                    <button
                        onClick={() => onUpdateStatus(user.id, user.isActive)}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title={user.isActive ? "Deactivate" : "Activate"}
                    >
                        {user.isActive ? (
                            <UserX className="w-4 h-4" style={{ color: 'var(--accent-rust)' }} />
                        ) : (
                            <UserCheck className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserGridCard;