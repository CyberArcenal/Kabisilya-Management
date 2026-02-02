// components/Session/components/SessionActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  Archive,
  Copy,
  Lock,
  Unlock,
  MoreVertical,
  FileText,
  History,
  Users,
  Home,
  TrendingUp,
} from "lucide-react";

interface SessionActionsDropdownProps {
  session: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose?: () => void;
  onArchive?: () => void;
  onDuplicate?: () => void;
  onActivate?: () => void;
}

const SessionActionsDropdown: React.FC<SessionActionsDropdownProps> = ({
  session,
  onView,
  onEdit,
  onDelete,
  onClose,
  onArchive,
  onDuplicate,
  onActivate,
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
              Actions
            </div>

            <button
              onClick={(e) => handleAction(e, onView)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-sky-500" /> <span>View Details</span>
            </button>
            <button
              onClick={(e) => handleAction(e, onEdit)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 text-yellow-500" /> <span>Edit</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Session Management
            </div>

            {session?.status === "active" && onClose && (
              <button
                onClick={(e) => handleAction(e, onClose)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Lock className="w-4 h-4 text-brown-600" />{" "}
                <span>Close Session</span>
              </button>
            )}

            {session?.status === "closed" && onActivate && (
              <button
                onClick={(e) => handleAction(e, onActivate)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Unlock className="w-4 h-4 text-green-600" />{" "}
                <span>Activate Session</span>
              </button>
            )}

            {session?.status !== "archived" && onArchive && (
              <button
                onClick={(e) => handleAction(e, onArchive)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Archive className="w-4 h-4 text-purple-600" />{" "}
                <span>Archive Session</span>
              </button>
            )}

            {onDuplicate && (
              <button
                onClick={(e) => handleAction(e, onDuplicate)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 text-teal-600" />{" "}
                <span>Duplicate Session</span>
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
              <FileText className="w-4 h-4" /> <span>Generate Report</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
              disabled
            >
              <TrendingUp className="w-4 h-4" /> <span>View Analytics</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={(e) => handleAction(e, onDelete)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionActionsDropdown;
