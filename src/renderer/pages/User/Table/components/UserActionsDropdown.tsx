// components/User/components/UserActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Shield,
  Key,
  UserCheck,
  UserX,
  MoreVertical,
  History,
  Lock,
} from "lucide-react";

interface UserActionsDropdownProps {
  user: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateRole: () => void;
  onUpdateStatus: () => void;
  onResetPassword: () => void;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
  onUpdateRole,
  onUpdateStatus,
  onResetPassword,
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
    const dropdownHeight = 380;
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
              User Actions
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
              <span>Edit User</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account Management
            </div>

            <button
              onClick={(e) => handleAction(e, onUpdateRole)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <Shield className="w-4 h-4 text-purple-600" />{" "}
              <span>Change Role</span>
            </button>
            <button
              onClick={(e) => handleAction(e, onUpdateStatus)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              {user.isActive ? (
                <UserX className="w-4 h-4 text-red-600" />
              ) : (
                <UserCheck className="w-4 h-4 text-green-600" />
              )}
              <span>{user.isActive ? "Deactivate User" : "Activate User"}</span>
            </button>
            <button
              onClick={(e) => handleAction(e, onResetPassword)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <Key className="w-4 h-4 text-green-600" />{" "}
              <span>Reset Password</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Future Features
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
              disabled
            >
              <Lock className="w-4 h-4" /> <span>Permissions</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 cursor-not-allowed"
              disabled
            >
              <History className="w-4 h-4" /> <span>Activity Log</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={(e) => handleAction(e, onDelete)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> <span>Delete User</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActionsDropdown;
