// components/User/components/UserGridView.tsx
import React from 'react';
import type { UserData } from '../../../../apis/user';
import UserGridCard from './UserGridCard';

interface UserGridViewProps {
    users: UserData[];
    selectedUsers: number[];
    toggleSelectUser: (id: number) => void;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdateStatus: (id: number, currentStatus: boolean) => void;
}

const UserGridView: React.FC<UserGridViewProps> = ({
    users,
    selectedUsers,
    toggleSelectUser,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
                <UserGridCard
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.includes(user.id)}
                    onSelect={() => toggleSelectUser(user.id)}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </div>
    );
};

export default UserGridView;