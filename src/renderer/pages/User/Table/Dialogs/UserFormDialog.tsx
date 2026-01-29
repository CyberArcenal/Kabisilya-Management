// components/User/Dialogs/UserFormDialog.tsx
import React from 'react';
import { X } from 'lucide-react';

interface UserFormDialogProps {
    id?: number;
    mode: 'add' | 'edit';
    onClose: () => void;
    onSuccess: () => void;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ id, mode, onClose, onSuccess }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {mode === 'add' ? 'Add New User' : 'Edit User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">👤</div>
                        <h3 className="text-lg font-medium mb-2">User Form Dialog</h3>
                        <p className="text-gray-600 mb-6">
                            {mode === 'add' ? 'Add user form will be implemented here' : `Edit user form for ID: ${id} will be implemented here`}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSuccess}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {mode === 'add' ? 'Create User' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserFormDialog;