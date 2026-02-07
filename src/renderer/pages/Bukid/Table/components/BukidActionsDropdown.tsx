// components/Bukid/components/BukidActionsDropdown.tsx
import React, { useRef, useEffect } from "react";
import {
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  BarChart2,
  Upload,
  Download,
  MoreVertical,
  PlusCircle,
  Layers,
  Map,
  BookOpen,
} from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";

interface BukidActionsDropdownProps {
  bukid: any;
  onComplete: (id: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number, name: string) => void;
  onAddNote: (id: number) => void;
  onViewStats: (id: number) => void;
  onImportCSV: (id: number) => void;
  onExportCSV: (id: number) => void;
  onAddPlot: (id: number) => void;
  onViewPlots: (id: number) => void;
  onViewMap?: (id: number) => void; // NEW
  onViewNote?: (id: number) => void; // NEW
}

const BukidActionsDropdown: React.FC<BukidActionsDropdownProps> = ({
  bukid,
  onComplete,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete,
  onAddNote,
  onViewStats,
  onImportCSV,
  onExportCSV,
  onAddPlot,
  onViewPlots,
  onViewMap,
  onViewNote,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleAction = (action: () => void) => {
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
    const dropdownHeight = 440;
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
    <div className="bukid-actions-dropdown-container" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
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
          <div className="py-1">
            {/* General */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Completion",
                    message: `Are you sure you want to mark Bukid ${bukid.name} as completed?`,
                  }))
                )
                  return;
                handleAction(() => onComplete(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />{" "}
              <span>Mark as Completed</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 text-sky-500" /> <span>View Details</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onEdit(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 text-yellow-500" />{" "}
              <span>Edit Bukid</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onAddNote(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <FileText className="w-4 h-4 text-blue-500" />{" "}
              <span>Add Note</span>
            </button>

            {/* Plot Actions */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onAddPlot(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <PlusCircle className="w-4 h-4 text-green-600" />{" "}
              <span>Add Plot</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Statistics */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onViewStats(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <BarChart2 className="w-4 h-4 text-purple-500" />{" "}
              <span>View Stats</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onViewPlots(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Layers className="w-4 h-4 text-purple-600" />{" "}
              <span>View Plots</span>
            </button>

            {bukid.notes && onViewNote && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onViewNote(bukid.id));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>View Note</span>
              </button>
            )}

            {/* Map View (Future) */}
            {onViewMap && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onViewMap(bukid.id));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Map className="w-4 h-4 text-indigo-600" />{" "}
                <span>View Map</span>
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Batch / Import / Export */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onImportCSV(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Upload className="w-4 h-4 text-blue-600" />{" "}
              <span>Import CSV</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onExportCSV(bukid.id));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <Download className="w-4 h-4 text-green-600" />{" "}
              <span>Export CSV</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>
            {/* Status */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() =>
                  onUpdateStatus(
                    bukid.id,
                    bukid.status === "active" ? "inactive" : "active",
                  ),
                );
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
            >
              {bukid.status === "active" ? (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />{" "}
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />{" "}
                  <span>Activate</span>
                </>
              )}
            </button>
            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onDelete(bukid.id, bukid.name));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> <span>Delete Bukid</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BukidActionsDropdown;
