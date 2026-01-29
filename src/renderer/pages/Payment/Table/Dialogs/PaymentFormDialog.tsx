// components/Payment/Dialogs/PaymentFormDialog.tsx
import React from 'react';
import { X, DollarSign } from 'lucide-react';

interface PaymentFormDialogProps {
    id?: number;
    mode: 'add' | 'edit';
    onClose: () => void;
    onSuccess: () => void;
}

const PaymentFormDialog: React.FC<PaymentFormDialogProps> = ({ 
    id, 
    mode, 
    onClose, 
    onSuccess 
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                        <h2 className="text-xl font-semibold">
                            {mode === 'add' ? 'Create New Payment' : 'Edit Payment'}
                        </h2>
                        {id && <span className="text-sm text-gray-500">(ID: {id})</span>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <DollarSign className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Payment Form Dialog
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {mode === 'add' 
                                ? 'Create payment form will be implemented here'
                                : 'Edit payment form will be implemented here'
                            }
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSuccess}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                {mode === 'add' ? 'Create Payment' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFormDialog;