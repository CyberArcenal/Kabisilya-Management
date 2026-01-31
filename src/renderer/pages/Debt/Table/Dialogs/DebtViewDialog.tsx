// components/Debt/Dialogs/DebtViewDialog.tsx
import React from 'react';
import { X, DollarSign, Edit, History } from 'lucide-react';

interface DebtViewDialogProps {
    id: number;
    onClose: () => void;
    onEdit: (id: number) => void;
    onMakePayment: (id: number) => void;
    onViewHistory: (id: number) => void;
}

const DebtViewDialog: React.FC<DebtViewDialogProps> = ({ id, onClose, onEdit, onMakePayment, onViewHistory }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Debt Details #{id}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Debt View Dialog
                        </h3>
                        <p className="text-gray-600 mb-8">
                            Detailed view of debt #{id} will be implemented here.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 border border-gray-200 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-800">₱10,000</div>
                                <div className="text-sm text-gray-600">Original Amount</div>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">₱3,500</div>
                                <div className="text-sm text-gray-600">Amount Paid</div>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-600">₱6,500</div>
                                <div className="text-sm text-gray-600">Balance</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => onEdit(id)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Debt
                            </button>
                            <button
                                onClick={() => onMakePayment(id)}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <DollarSign className="w-4 h-4" />
                                Make Payment
                            </button>
                            <button
                                onClick={() => onViewHistory(id)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <History className="w-4 h-4" />
                                View History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtViewDialog;