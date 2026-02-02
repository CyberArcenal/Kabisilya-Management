import React from 'react';
import { CreditCard, TrendingUp, Calendar, FileText, User, List } from 'lucide-react';
import { formatNumber } from '../../../../utils/formatters';

interface PaymentSummaryTabProps {
  paymentDetails: any;
  pitak: any;
  onViewReport: () => void;
  onAssign: () => void;
  onViewPitakAssignments: () => void;
}

const PaymentSummaryTab: React.FC<PaymentSummaryTabProps> = ({
  paymentDetails,
  pitak,
  onViewReport,
  onAssign,
  onViewPitakAssignments,
}) => {
  if (!paymentDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No payment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Payment Summary Card */}
      <div
        className="p-4 rounded-lg border"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CreditCard
            className="w-4 h-4"
            style={{ color: "var(--accent-gold)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Payment Summary
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Total Luwang:
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {formatNumber(paymentDetails.totalLuWang)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Rate per Luwang:
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              ₱{paymentDetails.LUWANG_RATE}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Gross Pay:
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              ₱{formatNumber(paymentDetails.totalGrossPay)}
            </span>
          </div>
          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Status:
              </span>
              <span
                className={`text-sm font-semibold ${
                  paymentDetails.totalPending === 0
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {paymentDetails.totalPending === 0
                  ? "Fully Paid"
                  : "Pending Payment"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Card */}
      <div
        className="p-4 rounded-lg border"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "var(--accent-sky)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Payment Breakdown
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Paid Amount:
            </span>
            <span className="font-semibold text-sm text-green-600">
              ₱{formatNumber(paymentDetails.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Pending Amount:
            </span>
            <span className="font-semibold text-sm text-yellow-600">
              ₱{formatNumber(paymentDetails.totalPending)}
            </span>
          </div>
          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Completion:
              </span>
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {paymentDetails.totalGrossPay > 0
                  ? `${((paymentDetails.totalPaid / paymentDetails.totalGrossPay) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Card */}
      <div
        className="p-4 rounded-lg border"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar
            className="w-4 h-4"
            style={{ color: "var(--accent-earth)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Activity
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Total Assignments:
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {paymentDetails.assignmentsCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Completed:
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {paymentDetails.completedCount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Avg per Assignment:
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              ₱{formatNumber(paymentDetails.averagePerAssignment)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div
        className="p-4 rounded-lg border"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText
            className="w-4 h-4"
            style={{ color: "var(--accent-green)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Quick Actions
          </span>
        </div>
        <div className="space-y-2">
          <button
            onClick={onViewReport}
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <FileText className="w-4 h-4" />
            Generate Payment Report
          </button>
          <button
            onClick={onAssign}
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <User className="w-4 h-4" />
            Assign More Workers
          </button>
          <button
            onClick={onViewPitakAssignments}
            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <List className="w-4 h-4" />
            View All Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryTab;