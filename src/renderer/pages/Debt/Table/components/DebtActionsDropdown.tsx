import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  History,
  Percent,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Check,
  FileText,
  CreditCard,
} from "lucide-react";

interface DebtActionsDropdownProps {
  debt: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMakePayment: () => void;
  onUpdateStatus: (status: string) => void;
  onViewHistory: () => void;
}

const DebtActionsDropdown: React.FC<DebtActionsDropdownProps> = ({
  debt,
  onView,
  onEdit,
  onDelete,
  onMakePayment,
  onUpdateStatus,
  onViewHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 400;
    const windowHeight = window.innerHeight;

    if (rect.bottom + dropdownHeight > windowHeight) {
      return {
        bottom: `${windowHeight - rect.top + 5}px`,
        right: `${window.innerWidth - rect.right}px`,
      };
    }
    return {
      top: `${rect.bottom + 5}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle(e);
        }}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors relative cursor-pointer"
        title="More Actions"
      >
        <MoreVertical
          className="w-4 h-4"
          style={{ color: "var(--text-secondary)" }}
        />
      </button>

      {isOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50 max-h-96 overflow-y-auto"
          style={getDropdownPosition()}
        >
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Debt Actions
            </div>

            <button
              onClick={(e) => handleAction(e, onView)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-sky-500" /> <span>View Details</span>
            </button>
            <button
              onClick={(e) => handleAction(e, onEdit)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 text-yellow-500" />{" "}
              <span>Edit Debt</span>
            </button>

            {debt.balance > 0 && debt.status !== "cancelled" && (
              <button
                onClick={(e) => handleAction(e, onMakePayment)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <DollarSign className="w-4 h-4 text-green-600" />{" "}
                <span>Make Payment</span>
              </button>
            )}

            <button
              onClick={(e) => handleAction(e, onViewHistory)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <History className="w-4 h-4 text-purple-600" />{" "}
              <span>View History</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status Actions
            </div>

            {debt.status === "pending" && (
              <>
                <button
                  onClick={(e) =>
                    handleAction(e, () => onUpdateStatus("partially_paid"))
                  }
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  <Percent className="w-4 h-4 text-purple-700" />{" "}
                  <span>Mark as Partially Paid</span>
                </button>
                <button
                  onClick={(e) =>
                    handleAction(e, () => onUpdateStatus("cancelled"))
                  }
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />{" "}
                  <span>Cancel Debt</span>
                </button>
              </>
            )}

            {debt.status === "partially_paid" && (
              <>
                <button
                  onClick={(e) => handleAction(e, () => onUpdateStatus("paid"))}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />{" "}
                  <span>Mark as Fully Paid</span>
                </button>
                <button
                  onClick={(e) =>
                    handleAction(e, () => onUpdateStatus("overdue"))
                  }
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600" />{" "}
                  <span>Mark as Overdue</span>
                </button>
              </>
            )}

            {debt.status === "overdue" && (
              <button
                onClick={(e) =>
                  handleAction(e, () => onUpdateStatus("partially_paid"))
                }
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <Percent className="w-4 h-4 text-purple-700" />{" "}
                <span>Mark as Partially Paid</span>
              </button>
            )}

            {debt.status === "cancelled" && (
              <button
                onClick={(e) =>
                  handleAction(e, () => onUpdateStatus("pending"))
                }
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <Check className="w-4 h-4 text-green-600" />{" "}
                <span>Reactivate Debt</span>
              </button>
            )}

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Reports
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
              disabled
            >
              <FileText className="w-4 h-4" /> <span>Generate Statement</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
              disabled
            >
              <CreditCard className="w-4 h-4" /> <span>Payment Schedule</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={(e) => handleAction(e, onDelete)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> <span>Delete Debt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtActionsDropdown;
