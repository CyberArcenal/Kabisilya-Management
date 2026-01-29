// components/User/components/UserTableView.tsx
import React, { useState } from 'react';
import { ChevronRight as ChevronRightIcon } from 'lucide-react';
import type { UserData } from '../../../../apis/user';
import UserTableRow from './UserTableRow';

interface UserTableViewProps {
    users: UserData[];
    selectedUsers: number[];
    toggleSelectAll: () => void;
    toggleSelectUser: (id: number) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, currentStatus: boolean) => void;
    onUpdateRole: (id: number, currentRole: string) => void;
    onResetPassword: (id: number, username: string) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
}

const UserTableView: React.FC<UserTableViewProps> = ({
    users,
    selectedUsers,
    toggleSelectAll,
    toggleSelectUser,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    onUpdateRole,
    onResetPassword,
    sortBy,
    sortOrder,
    onSort
}) => {
    const [expandedUser, setExpandedUser] = useState<number | null>(null);

    const toggleExpandUser = (id: number) => {
        setExpandedUser(prev => prev === id ? null : id);
    };

    return (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ background: 'var(--table-header-bg)' }}>
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={toggleSelectAll}
                                    className="rounded"
                                    style={{ borderColor: 'var(--border-color)' }}
                                />
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <button
                                    onClick={() => onSort('createdAt')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    Created
                                    {sortBy === 'createdAt' && (
                                        <ChevronRightIcon className={`w-3 h-3 transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <button
                                    onClick={() => onSort('username')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    Username
                                    {sortBy === 'username' && (
                                        <ChevronRightIcon className={`w-3 h-3 transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Name & Email
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Role
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Status
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                <button
                                    onClick={() => onSort('lastLogin')}
                                    className="flex items-center gap-1 hover:text-primary"
                                >
                                    Last Login
                                    {sortBy === 'lastLogin' && (
                                        <ChevronRightIcon className={`w-3 h-3 transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                                    )}
                                </button>
                            </th>
                            <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <UserTableRow
                                key={user.id}
                                user={user}
                                isSelected={selectedUsers.includes(user.id)}
                                isExpanded={expandedUser === user.id}
                                onSelect={() => toggleSelectUser(user.id)}
                                onToggleExpand={() => toggleExpandUser(user.id)}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onUpdateRole={onUpdateRole}
                                onUpdateStatus={onUpdateStatus}
                                onResetPassword={onResetPassword}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTableView;