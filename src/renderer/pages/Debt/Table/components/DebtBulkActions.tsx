// components/Debt/components/DebtBulkActions.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';

interface DebtBulkActionsProps {
    selectedCount: number;
    onBulkDelete: () => void;
    onClearSelection: () => void;
}

const DebtBulkActions: React.FC<DebtBulkActionsProps> = ({
    selectedCount,
    onBulkDelete,
    onClearSelection
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="p-4 rounded-xl flex items-center justify-between bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-800">
                    {selectedCount} debt(s) selected
                </span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onBulkDelete}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center bg-red-600 text-white hover:bg-red-700"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                </button>
                <button
                    onClick={onClearSelection}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    Clear Selection
                </button>
            </div>
        </div>
    );
};

export default DebtBulkActions;