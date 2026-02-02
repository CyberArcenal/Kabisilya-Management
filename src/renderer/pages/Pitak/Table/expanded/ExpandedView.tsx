import React, { useState } from 'react';
import { UserCheck, CreditCard, FileText } from 'lucide-react';
import WorkersTab from './WorkersTab';
import PaymentSummaryTab from './PaymentSummaryTab';
import PaymentListTab from './PaymentListTab';

interface ExpandedViewProps {
  isLoadingAssignments: boolean;
  isLoadingPayments: boolean;
  assignedWorkers: any[];
  paymentDetails: any;
  payments: any[];
  pitak: any;
  onAssign: () => void;
  onViewAssignedWorkers: () => void;
  onViewReport: () => void;
  onViewPitakAssignments: () => void;
  onViewAssignment: (assignmentId: number) => void;
  onViewPayment: (paymentId: number) => void;
}

const ExpandedView: React.FC<ExpandedViewProps> = ({
  isLoadingAssignments,
  isLoadingPayments,
  assignedWorkers,
  paymentDetails,
  payments,
  pitak,
  onAssign,
  onViewAssignedWorkers,
  onViewReport,
  onViewPitakAssignments,
  onViewAssignment,
  onViewPayment,
}) => {
  const [activeTab, setActiveTab] = useState<"workers" | "summary" | "payments">("workers");

  return (
    <div className="py-3 px-4">
      {/* Tabs */}
      <div
        className="flex gap-4 mb-4 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <button
          onClick={() => setActiveTab("workers")}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "workers" ? "text-green-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Assigned Workers ({assignedWorkers.length})
          </span>
          {activeTab === "workers" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "summary" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Payment Summary
          </span>
          {activeTab === "summary" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "payments" ? "text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments List ({payments.length})
          </span>
          {activeTab === "payments" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "workers" ? (
        <WorkersTab
          isLoadingAssignments={isLoadingAssignments}
          assignedWorkers={assignedWorkers}
          pitak={pitak}
          onAssign={onAssign}
          onViewAssignedWorkers={onViewAssignedWorkers}
          onViewAssignment={onViewAssignment}
        />
      ) : activeTab === "summary" ? (
        <PaymentSummaryTab
          paymentDetails={paymentDetails}
          pitak={pitak}
          onViewReport={onViewReport}
          onAssign={onAssign}
          onViewPitakAssignments={onViewPitakAssignments}
        />
      ) : (
        <PaymentListTab
          isLoadingPayments={isLoadingPayments}
          payments={payments}
          onViewPayment={onViewPayment}
        />
      )}
    </div>
  );
};

export default ExpandedView;