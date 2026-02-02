import React from 'react';
import { CheckCircle, XCircle, Crop } from 'lucide-react';

export const getStatusBadge = (status: string = "active") => {
  const statusConfig = {
    active: {
      text: "Active",
      bg: "var(--status-planted-bg)",
      color: "var(--status-planted)",
      border: "rgba(56, 161, 105, 0.3)",
      icon: CheckCircle,
    },
    inactive: {
      text: "Inactive",
      bg: "var(--status-fallow-bg)",
      color: "var(--status-fallow)",
      border: "rgba(113, 128, 150, 0.3)",
      icon: XCircle,
    },
    completed: {
      text: "Completed",
      bg: "var(--accent-gold-light)",
      color: "var(--accent-gold)",
      border: "rgba(214, 158, 46, 0.3)",
      icon: Crop,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap"
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};