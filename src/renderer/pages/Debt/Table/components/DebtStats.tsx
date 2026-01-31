// components/Debt/components/DebtStats.tsx
import React from 'react';
import { 
    DollarSign, 
    TrendingDown, 
    Banknote, 
    BarChart3,
    Clock,
    Percent,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';
import type { DebtStats as DebtStatsType } from '../../../../apis/debt';

interface DebtStatsProps {
    stats: DebtStatsType | null;
}

const DebtStats: React.FC<DebtStatsProps> = ({ stats }) => {
    return (
        <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-blue-50">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                            Total
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-gray-800">
                        {formatCurrency(stats?.totalAmount || 0)}
                    </h3>
                    <p className="text-sm text-gray-600">Total Debt Amount</p>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-green-50">
                            <TrendingDown className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                            Balance
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-gray-800">
                        {formatCurrency(stats?.totalBalance || 0)}
                    </h3>
                    <p className="text-sm text-gray-600">Total Outstanding</p>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-amber-50">
                            <Banknote className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                            Paid
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-gray-800">
                        {formatCurrency(stats?.totalPaid || 0)}
                    </h3>
                    <p className="text-sm text-gray-600">Total Amount Paid</p>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-yellow-50">
                            <BarChart3 className="w-6 h-6 text-yellow-600" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                            Active
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-gray-800">
                        {stats?.activeCount || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Active Debts</p>
                </div>
            </div>

            {/* Status Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">Pending</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-500">
                            {stats?.pendingCount || 0}
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">Partially Paid</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                            {stats?.partiallyPaidCount || 0}
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Paid</span>
                        </div>
                        <span className="text-2xl font-bold text-green-500">
                            {stats?.paidCount || 0}
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-medium text-gray-700">Cancelled</span>
                        </div>
                        <span className="text-2xl font-bold text-red-500">
                            {stats?.cancelledCount || 0}
                        </span>
                    </div>
                </div>

                <div className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-gray-700">Overdue</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">
                            {stats?.overdueCount || 0}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DebtStats;