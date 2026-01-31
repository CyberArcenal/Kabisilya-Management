// components/User/hooks/useUserActions.ts
import { showError, showSuccess, showToast } from '../../../../utils/notification';
import { showConfirm } from '../../../../utils/dialogs';
import userAPI from '../../../../apis/user';
import type { UserData } from '../../../../apis/user';
import { useNavigate } from 'react-router-dom';

export const useUserActions = (
    users: UserData[],
    fetchUsers: () => Promise<void>,
    selectedUsers: number[] = []
) => {
    const navigate = useNavigate();

    const handleDeleteUser = async (id: number) => {
        const user = users.find(u => u.id === id);
        const confirmed = await showConfirm({
            title: 'Delete User',
            message: `Are you sure you want to delete user "${user?.username}"? This action cannot be undone.`,
            icon: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting user...', 'info');
            const response = await userAPI.deleteUser(id);

            if (response.status) {
                showSuccess('User deleted successfully');
                fetchUsers();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to delete user');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;

        const confirmed = await showConfirm({
            title: 'Bulk Delete Confirmation',
            message: `Are you sure you want to delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`,
            icon: 'danger',
            confirmText: 'Delete All',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Deleting selected users...', 'info');
            const results = await Promise.allSettled(
                selectedUsers.map(id => userAPI.deleteUser(id))
            );

            const successful = results.filter(r => r.status === 'fulfilled' && r.value.status);
            const failed = results.filter(r => r.status === 'rejected' || !r.value?.status);

            if (failed.length === 0) {
                showSuccess(`Successfully deleted ${successful.length} user(s)`);
            } else {
                showError(`Deleted ${successful.length} user(s), failed to delete ${failed.length} user(s)`);
            }

            fetchUsers();
        } catch (err: any) {
            showError(err.message || 'Failed to delete users');
        }
    };

    const handleUpdateStatus = async (id: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'activate' : 'deactivate';

        const confirmed = await showConfirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            message: `Are you sure you want to ${action} this user?`,
            icon: 'warning',
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast(`${action.charAt(0).toUpperCase() + action.slice(1)}ing user...`, 'info');
            const response = await userAPI.updateUserStatus(id, newStatus);

            if (response.status) {
                showSuccess(`User ${action}d successfully`);
                fetchUsers();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || `Failed to ${action} user`);
        }
    };

    const handleUpdateRole = async (id: number, currentRole: string) => {
        const roles = ['admin', 'manager', 'user'];
        const currentIndex = roles.indexOf(currentRole);
        const newRole = roles[(currentIndex + 1) % roles.length];

        const confirmed = await showConfirm({
            title: 'Change User Role',
            message: `Change user role from ${currentRole} to ${newRole}?`,
            icon: 'warning',
            confirmText: 'Change Role',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Updating user role...', 'info');
            const response = await userAPI.updateUserRole(id, newRole as any);

            if (response.status) {
                showSuccess(`User role updated to ${newRole}`);
                fetchUsers();
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to update user role');
        }
    };

    const handleResetPassword = async (id: number, username: string) => {
        const confirmed = await showConfirm({
            title: 'Reset Password',
            message: `Reset password for user "${username}"? A temporary password will be generated.`,
            icon: 'warning',
            confirmText: 'Reset Password',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        try {
            showToast('Resetting password...', 'info');
            const newPassword = Math.random().toString(36).slice(-8);
            const response = await userAPI.changePassword(id, newPassword, newPassword);

            if (response.status) {
                showSuccess(`Password reset successful. New password: ${newPassword}`);
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            showError(err.message || 'Failed to reset password');
        }
    };

    const handleViewUser = (id: number) => {
        navigate(`/user/view/${id}`);
    };

    const handleEditUser = (id: number) => {
        navigate(`/user/edit/${id}`);
    };

    return {
        handleDeleteUser,
        handleBulkDelete,
        handleUpdateStatus,
        handleUpdateRole,
        handleResetPassword,
        handleViewUser,
        handleEditUser
    };
};