// components/Payment/Dialogs/PaymentViewDialog.tsx
import React from 'react';
import { X, DollarSign, Calendar, Users, FileText, CheckCircle } from 'lucide-react';

interface PaymentViewDialogProps {
    id: number;
    onClose: () => void;
    onEdit: (id: number) => void;
}

const PaymentViewDialog: React.FC<PaymentViewDialogProps> = ({ 
    id, 
    onClose, 
    onEdit 
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                        <h2 className="text-xl font-semibold">
                            Payment Details
                        </h2>
                        <span className="text-sm text-gray-500">(ID: {id})</span>
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
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Payment View Dialog
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Detailed payment information will be displayed here
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 border rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600 mb-2" />
                                <h4 className="font-medium">Payment Date</h4>
                                <p className="text-sm text-gray-500">To be implemented</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <Users className="w-5 h-5 text-green-600 mb-2" />
                                <h4 className="font-medium">Worker Info</h4>
                                <p className="text-sm text-gray-500">To be implemented</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600 mb-2" />
                                <h4 className="font-medium">Payment Slip</h4>
                                <p className="text-sm text-gray-500">To be implemented</p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => onEdit(id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Edit Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentViewDialog;