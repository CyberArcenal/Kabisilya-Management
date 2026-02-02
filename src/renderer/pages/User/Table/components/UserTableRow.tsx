// components/User/components/UserTableRow.tsx
import React, { useState } from "react";
import {
  Calendar,
  Users,
  Mail,
  Phone,
  Clock,
  ChevronRight,
} from "lucide-react";
import UserActionsDropdown from "./UserActionsDropdown";
import { formatDate } from "../../../../utils/formatters";
import type { UserData } from "../../../../apis/user";

interface UserTableRowProps {
  user: UserData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateRole: (id: number, currentRole: string) => void;
  onUpdateStatus: (id: number, currentStatus: boolean) => void;
  onResetPassword: (id: number, username: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
  onUpdateRole,
  onUpdateStatus,
  onResetPassword,
}) => {
  const getRoleBadge = (role: string = "user") => {
    const roleConfig = {
      admin: {
        text: "Admin",
        bg: "var(--status-completed-bg)",
        color: "var(--status-completed)",
        border: "rgba(128, 90, 213, 0.3)",
      },
      manager: {
        text: "Manager",
        bg: "var(--status-growing-bg)",
        color: "var(--status-growing)",
        border: "rgba(214, 158, 46, 0.3)",
      },
      user: {
        text: "User",
        bg: "var(--status-planted-bg)",
        color: "var(--status-planted)",
        border: "rgba(56, 161, 105, 0.3)",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 status-badge-active">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Active
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 status-badge-inactive">
        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
        Inactive
      </span>
    );
  };

  const ExpandedView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-3 rounded-lg" style={{ background: "var(--card-bg)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            User Details
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Created:
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDate(user.createdAt, "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Updated:
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {formatDate(user.updatedAt, "MMM dd, yyyy HH:mm")}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              User ID:
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {user.id}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg" style={{ background: "var(--card-bg)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4" style={{ color: "var(--accent-sky)" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Contact Information
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Email:
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {user.email}
            </span>
          </div>
          {user.contact && (
            <div className="flex justify-between">
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Contact:
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {user.contact}
              </span>
            </div>
          )}
          {user.address && (
            <div
              className="mt-2 pt-2 border-t"
              style={{ borderColor: "var(--border-color)" }}
            >
              <span
                className="text-sm block mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Address:
              </span>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {user.address}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 rounded-lg" style={{ background: "var(--card-bg)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Activity
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Status:
            </span>
            {getStatusBadge(user.isActive)}
          </div>
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Role:
            </span>
            {getRoleBadge(user.role)}
          </div>
          <div className="flex justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Last Login:
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {user.lastLogin
                ? formatDate(user.lastLogin, "MMM dd, yyyy HH:mm")
                : "Never logged in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors border-b border-gray-200 pointer-events-auto cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <td className="p-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="rounded border-gray-300"
          />
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Calendar
              className="w-4 h-4"
              style={{ color: "var(--text-tertiary)" }}
            />
            <div>
              <div
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {formatDate(user.createdAt, "MMM dd, yyyy")}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                ID: {user.id}
              </div>
            </div>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "var(--accent-sky)" }} />
            <div>
              <div
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {user.username}
              </div>
            </div>
          </div>
        </td>
        <td className="p-4">
          <div>
            <div
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {user.name || "No name"}
            </div>
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
            {user.contact && (
              <div
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <Phone className="w-3 h-3" />
                {user.contact}
              </div>
            )}
          </div>
        </td>
        <td className="p-4">{getRoleBadge(user.role)}</td>
        <td className="p-4">{getStatusBadge(user.isActive)}</td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Clock
              className="w-4 h-4"
              style={{ color: "var(--text-tertiary)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              {user.lastLogin
                ? formatDate(user.lastLogin, "MMM dd, yyyy HH:mm")
                : "Never"}
            </span>
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <UserActionsDropdown
              user={user}
              onView={() => onView(user.id)}
              onEdit={() => onEdit(user.id)}
              onDelete={() => onDelete(user.id)}
              onUpdateRole={() => onUpdateRole(user.id, user.role)}
              onUpdateStatus={() => onUpdateStatus(user.id, user.isActive)}
              onResetPassword={() => onResetPassword(user.id, user.username)}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="More Details"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform cursor-pointer ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Row */}
      {isExpanded && (
        <tr className={isExpanded ? "expanded-row" : "collapsed-row"}>
          <td
            colSpan={7}
            className="p-4"
            style={{ background: "var(--card-secondary-bg)" }}
          >
            <ExpandedView />
          </td>
        </tr>
      )}
    </>
  );
};

export default UserTableRow;
