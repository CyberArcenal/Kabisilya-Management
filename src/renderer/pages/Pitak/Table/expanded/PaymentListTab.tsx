import React from 'react';
import { CreditCard, Calendar, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatNumber } from '../../../../utils/formatters';

interface PaymentListTabProps {
  isLoadingPayments: boolean;
  payments: any[];
  onViewPayment: (paymentId: number) => void;
}

const PaymentListTab: React.FC<PaymentListTabProps> = ({
  isLoadingPayments,
  payments,
  onViewPayment,
}) => {
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (isLoadingPayments) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CreditCard className="w-16 h-16 mb-4 opacity-20 text-gray-400" />
        <h3 className="text-lg font-medium mb-2 text-gray-700">No Payments Found</h3>
        <p className="text-sm text-gray-500 mb-4">
          There are no payment records for this pitak yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Total Payments</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {payments.length}
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Total Amount</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₱{formatNumber(payments.reduce((sum, payment) => sum + (payment.netPay || 0), 0))}
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {payments.filter(p => p.status === 'completed').length}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-color)" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Pay
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Pay
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr 
                  key={payment.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewPayment(payment.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.worker?.name || 'Unknown Worker'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {payment.worker?.id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {payment.periodStart ? formatDate(payment.periodStart, "MMM dd") : 'N/A'}
                        {' - '}
                        {payment.periodEnd ? formatDate(payment.periodEnd, "MMM dd") : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₱{formatNumber(payment.grossPay || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-700">
                      ₱{formatNumber(payment.netPay || 0)}
                    </div>
                    {payment.grossPay && payment.netPay && (
                      <div className="text-xs text-gray-500">
                        Deductions: ₱{formatNumber(payment.grossPay - payment.netPay)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getPaymentStatusBadge(payment.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.paymentDate ? formatDate(payment.paymentDate, "MMM dd, yyyy") : 'Not Paid'}
                    </div>
                    {!payment.paymentDate && (
                      <div className="text-xs text-gray-500">
                        Awaiting payment
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPayment(payment.id);
                      }}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Showing {payments.length} payment{payments.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default PaymentListTab;