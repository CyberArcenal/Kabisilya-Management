import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MapPin,
  Home,
  Hash,
  Package,
  Users,
  Eye,
  Edit,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import PitakActionsDropdown from "./PitakActionsDropdown";
import { formatDate, formatNumber } from "../../../../utils/formatters";
import assignmentAPI from "../../../../apis/assignment";
import type { Assignment } from "../../../../apis/assignment";
import paymentAPI from "../../../../apis/payment";
import type { PaymentData } from "../../../../apis/payment";
import { getStatusBadge } from "../expanded/utils/statusUtils";
import ExpandedView from "../expanded/ExpandedView";

interface PitakTableRowProps {
  pitak: any;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAssign: (id: number, pitakData: any) => void;
  onUpdateLuWang: (id: number, totalLuwang: number | null) => void;
  onViewAssignedWorkers: (id: number, location?: string) => void;
  onViewReport: (id: number) => void;
  onMarkAsHarvested: (id: number) => void;
  onUpdateStatus: (id: number, currentStatus: string) => void;
  onViewAssignment: (assignmentId: number) => void;
  onViewPitakAssignments: (pitakId: number) => void;
  onViewPayment: (paymentId: number) => void;
}

const PitakTableRow: React.FC<PitakTableRowProps> = ({
  pitak,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onUpdateLuWang,
  onViewAssignedWorkers,
  onViewReport,
  onMarkAsHarvested,
  onUpdateStatus,
  onViewAssignment,
  onViewPitakAssignments,
  onViewPayment,
}) => {
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [assignedWorkers, setAssignedWorkers] = useState<any[]>([]);
  const [assignmentStats, setAssignmentStats] = useState({
    totalAssignments: 0,
    totalLuWang: 0,
    completedCount: 0,
    activeCount: 0,
  });

  const paymentsFetchedRef = useRef(false);

  // Fetch assignments for this pitak on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const response = await assignmentAPI.getAssignmentsByPitak(pitak.id);
        if (response.status && response.data.assignments) {
          const assignmentsData = response.data.assignments;
          setAssignments(assignmentsData);
          
          // Calculate assignment statistics
          const totalLuWang = assignmentsData.reduce(
            (sum: number, assignment: Assignment) => 
              sum + (typeof assignment.luwangCount === 'string' ? 
                parseFloat(assignment.luwangCount) : assignment.luwangCount || 0), 
            0
          );
          
          const completedCount = assignmentsData.filter(
            (a: Assignment) => a.status === 'completed'
          ).length;
          
          const activeCount = assignmentsData.filter(
            (a: Assignment) => a.status === 'active'
          ).length;
          
          setAssignmentStats({
            totalAssignments: assignmentsData.length,
            totalLuWang,
            completedCount,
            activeCount
          });
          
          // Calculate assigned workers
          const workersMap = new Map();
          assignmentsData.forEach((assignment: Assignment) => {
            if (assignment.worker) {
              const workerId = assignment.worker.id;
              if (!workersMap.has(workerId)) {
                workersMap.set(workerId, {
                  id: assignment.worker.id,
                  name: assignment.worker.name,
                  code: assignment.worker.code,
                  totalAssignments: 0,
                  totalLuWang: 0,
                  assignments: [],
                });
              }
              
              const worker = workersMap.get(workerId);
              worker.totalAssignments += 1;
              const luwangCount = typeof assignment.luwangCount === 'string' ? 
                parseFloat(assignment.luwangCount) : assignment.luwangCount || 0;
              worker.totalLuWang += luwangCount;
              worker.assignments.push({
                id: assignment.id,
                date: assignment.assignmentDate,
                luwangCount: luwangCount,
                status: assignment.status,
              });
            }
          });
          
          setAssignedWorkers(Array.from(workersMap.values()));
          
          // Calculate payment details
          const LUWANG_RATE = 230;
          const totalGrossPay = totalLuWang * LUWANG_RATE;
          const estimatedPaid = completedCount * LUWANG_RATE * 0.7;
          const totalPending = totalGrossPay - estimatedPaid;

          setPaymentDetails({
            LUWANG_RATE,
            totalLuWang,
            totalGrossPay,
            totalPaid: estimatedPaid,
            totalPending,
            assignmentsCount: assignmentsData.length,
            completedCount,
            averagePerAssignment: assignmentsData.length > 0 ? 
              totalGrossPay / assignmentsData.length : 0,
          });
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [pitak.id]);

  // Fixed: Fetch payments only when expanded and reset when collapsed
  const fetchPayments = useCallback(async () => {
    if (isExpanded && !paymentsFetchedRef.current) {
      setIsLoadingPayments(true);
      paymentsFetchedRef.current = true;
      
      try {
        const response = await paymentAPI.getPaymentsByPitak(pitak.id);
        if (response.status && response.data.payments) {
          setPayments(response.data.payments);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        paymentsFetchedRef.current = false;
      } finally {
        setIsLoadingPayments(false);
      }
    }
  }, [isExpanded, pitak.id]);

  // Use effect to fetch payments when expanded
  useEffect(() => {
    fetchPayments();
    
    // Reset the fetched flag when collapsed
    if (!isExpanded) {
      paymentsFetchedRef.current = false;
    }
  }, [isExpanded, fetchPayments]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      paymentsFetchedRef.current = false;
    };
  }, []);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-200 pointer-events-auto cursor-pointer" onClick={(e) => {e.stopPropagation(); onToggleExpand()}}>
        <td className="p-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300 focus:ring-blue-500"
            style={{ borderColor: "var(--border-color)" }}
          />
        </td>
        <td className="p-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: "var(--accent-green-light)" }}
            >
              <MapPin
                className="w-4 h-4"
                style={{ color: "var(--accent-green)" }}
              />
            </div>
            <div className="min-w-0">
              <div
                className="font-medium text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {pitak.location || "No location"}
              </div>
              {isLoadingAssignments ? (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    <Package className="w-3 h-3 inline mr-1" />
                    {assignmentStats.totalAssignments} assignments
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    <Users className="w-3 h-3 inline mr-1" />
                    {assignedWorkers.length} workers
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    <CreditCard className="w-3 h-3 inline mr-1" />₱
                    {paymentDetails ? formatNumber(paymentDetails.totalGrossPay) : "0"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Home
              className="w-4 h-4"
              style={{ color: "var(--text-tertiary)" }}
            />
            <span
              className="text-sm truncate"
              style={{ color: "var(--text-secondary)", maxWidth: "150px" }}
            >
              {pitak.bukid?.name || `Bukid #${pitak.bukidId}`}
            </span>
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
            <span
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {formatNumber(pitak.totalLuwang)}
            </span>
          </div>
          {!isLoadingAssignments && assignmentStats.totalLuWang > 0 && (
            <div
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Used: {formatNumber(assignmentStats.totalLuWang)}{" "}
              ({pitak.totalLuwang > 0 ? 
                ((assignmentStats.totalLuWang / pitak.totalLuwang) * 100).toFixed(1) : "0"}%)
            </div>
          )}
        </td>
        <td className="p-3">{getStatusBadge(pitak.status)}</td>
        <td className="p-3">
          <div
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-secondary)" }}
          >
            {formatDate(pitak.createdAt, "MMM dd, yyyy")}
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {e.stopPropagation(); onView(pitak.id)}}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" style={{ color: "var(--accent-sky)" }} />
            </button>
            <button
              onClick={(e) => {e.stopPropagation(); onEdit(pitak.id)}}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Edit
                className="w-4 h-4"
                style={{ color: "var(--accent-gold)" }}
              />
            </button>

            <PitakActionsDropdown
              pitak={pitak}
              onAssign={() => onAssign(pitak.id, pitak)}
              onViewAssignments={() => onViewPitakAssignments(pitak.id)}
              onViewAssignedWorkers={() =>
                onViewAssignedWorkers(pitak.id, pitak.location)
              }
              onUpdateLuWang={() => onUpdateLuWang(pitak.id, pitak.totalLuwang)}
              onViewReport={() => onViewReport(pitak.id)}
              onUpdateStatus={() => onUpdateStatus(pitak.id, pitak.status)}
              onMarkAsHarvested={() => onMarkAsHarvested(pitak.id)}
              onDelete={() => onDelete(pitak.id)}
            />

            <button
              onClick={(e) => {e.stopPropagation(); onToggleExpand()}}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="More Details"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Row */}
      {isExpanded && (
        <tr className={isExpanded ? "expanded-row" : "collapsed-row"}>
          <td colSpan={7} className="p-0 border-b border-gray-200">
            <div
              className="px-4 py-3"
              style={{ background: "var(--card-secondary-bg)" }}
            >
              <ExpandedView
                isLoadingAssignments={isLoadingAssignments}
                isLoadingPayments={isLoadingPayments}
                assignedWorkers={assignedWorkers}
                paymentDetails={paymentDetails}
                payments={payments}
                pitak={pitak}
                onAssign={() => onAssign(pitak.id, pitak)}
                onViewAssignedWorkers={() => onViewAssignedWorkers(pitak.id, pitak.location)}
                onViewReport={() => onViewReport(pitak.id)}
                onViewPitakAssignments={() => onViewPitakAssignments(pitak.id)}
                onViewAssignment={onViewAssignment}
                onViewPayment={onViewPayment}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default PitakTableRow;