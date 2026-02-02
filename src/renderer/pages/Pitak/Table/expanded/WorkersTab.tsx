import React from 'react';
import { User, Users } from 'lucide-react';
import { formatDate, formatNumber } from '../../../../utils/formatters';

interface WorkersTabProps {
  isLoadingAssignments: boolean;
  assignedWorkers: any[];
  pitak: any;
  onAssign: () => void;
  onViewAssignedWorkers: () => void;
  onViewAssignment: (assignmentId: number) => void;
}

const WorkersTab: React.FC<WorkersTabProps> = ({
  isLoadingAssignments,
  assignedWorkers,
  pitak,
  onAssign,
  onViewAssignedWorkers,
  onViewAssignment,
}) => {
  if (isLoadingAssignments) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assignedWorkers.length > 0 ? (
        assignedWorkers.map((worker: any) => (
          <div
            key={worker.id}
            className="p-4 rounded-lg border hover:shadow-md transition-shadow"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {worker.name}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Worker ID: {worker.code || worker.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onViewAssignedWorkers}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total Luwang:
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatNumber(worker.totalLuWang)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Assignments:
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {worker.totalAssignments}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Est. Payment:
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  ₱{formatNumber(worker.totalLuWang * 230)}
                </span>
              </div>
            </div>

            {/* Recent assignments */}
            {worker.assignments.slice(0, 2).map((assignment: any) => (
              <div
                key={assignment.id}
                className="mt-3 pt-3 border-t text-xs flex justify-between items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => onViewAssignment(assignment.id)}
                style={{ borderColor: "var(--border-light)" }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {formatDate(assignment.date, "MMM dd")}
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {assignment.luwangCount} luwang
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    assignment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : assignment.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
            ))}

            {worker.assignments.length > 2 && (
              <div className="mt-2 text-center">
                <button
                  onClick={onViewAssignedWorkers}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  +{worker.assignments.length - 2} more assignments
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="col-span-3 flex flex-col items-center justify-center p-8 text-center">
          <Users
            className="w-12 h-12 mb-4 opacity-20"
            style={{ color: "var(--text-tertiary)" }}
          />
          <p
            className="text-sm mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            No workers assigned to this pitak
          </p>
          <button
            onClick={onAssign}
            className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          >
            <User className="w-4 h-4" />
            Assign Worker
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkersTab;