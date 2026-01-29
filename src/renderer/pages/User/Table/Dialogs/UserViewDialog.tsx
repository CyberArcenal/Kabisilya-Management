// components/User/Dialogs/UserViewDialog.tsx
import React from 'react';
import { X, Edit } from 'lucide-react';

interface UserViewDialogProps {
    id: number;
    onClose: () => void;
    onEdit: (id: number) => void;
}

const UserViewDialog: React.FC<UserViewDialogProps> = ({ id, onClose, onEdit }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">User Details</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(id)}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-medium mb-2">User View Dialog</h3>
                        <p className="text-gray-600 mb-6">
                            Detailed user information for ID: {id} will be displayed here
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserViewDialog;