// components/Payment/components/PaymentActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  Download,
  MoreVertical,
  CreditCard,
  Banknote,
  Receipt,
  Calendar,
  TrendingUp,
  TrendingDown,
  Percent,
} from "lucide-react";
import type { PaymentData } from "../../../../apis/payment";

interface PaymentActionsDropdownProps {
  payment: PaymentData;
  onView: () => void;
  onUpdateStatus: (newStatus: string) => void;
  onProcessPayment: () => void;
  onCancelPayment: () => void;
  onGenerateSlip: () => void;
}

const PaymentActionsDropdown: React.FC<PaymentActionsDropdownProps> = ({
  payment,
  onView,
  onUpdateStatus,
  onProcessPayment,
  onCancelPayment,
  onGenerateSlip,
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
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50 max-h-80 overflow-y-auto"
          style={getDropdownPosition()}
        >
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Basic Actions
            </div>

            <button
              onClick={(e) => handleAction(e, onView)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-sky-500" /> <span>View Details</span>
            </button>
            <button
              onClick={(e) => handleAction(e, onGenerateSlip)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 text-purple-600" />{" "}
              <span>Generate Slip</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status Actions
            </div>

            {payment.status === "pending" && (
              <button
                onClick={(e) => handleAction(e, onProcessPayment)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />{" "}
                <span>Process Payment</span>
              </button>
            )}

            {payment.status === "pending" && (
              <button
                onClick={(e) =>
                  handleAction(e, () => onUpdateStatus("processing"))
                }
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />{" "}
                <span>Mark as Processing</span>
              </button>
            )}

            {(payment.status === "pending" ||
              payment.status === "processing") && (
              <button
                onClick={(e) => handleAction(e, onCancelPayment)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <XCircle className="w-4 h-4 text-red-600" />{" "}
                <span>Cancel Payment</span>
              </button>
            )}

            {payment.status === "processing" && (
              <button
                onClick={(e) =>
                  handleAction(e, () => onUpdateStatus("completed"))
                }
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 text-green-700" />{" "}
                <span>Mark as Completed</span>
              </button>
            )}

            {payment.status === "completed" &&
              payment.netPay < payment.grossPay && (
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

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Export
            </div>

            <button
              onClick={(e) => handleAction(e, onGenerateSlip)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <Download className="w-4 h-4 text-sky-500" />{" "}
              <span>Download Slip (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentActionsDropdown;
