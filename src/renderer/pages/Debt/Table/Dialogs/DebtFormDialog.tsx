// components/Debt/Dialogs/DebtFormDialog.tsx
import React from 'react';
import { X, DollarSign } from 'lucide-react';

interface DebtFormDialogProps {
    id?: number;
    mode: 'add' | 'edit';
    onClose: () => void;
    onSuccess: () => void;
}

const DebtFormDialog: React.FC<DebtFormDialogProps> = ({ id, mode, onClose, onSuccess }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            {mode === 'add' ? 'Create New Debt' : `Edit Debt #${id}`}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Debt Form Dialog
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {mode === 'add' 
                                ? 'Form for creating new debt records will be implemented here.'
                                : `Form for editing debt #${id} will be implemented here.`}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Simulate form submission
                                    onSuccess();
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {mode === 'add' ? 'Create Debt' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtFormDialog;