// ViewAssignedWorkersDialog.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, Users, Calendar, Hash, MapPin, Phone, CheckCircle, 
  AlertCircle, Clock, Download, Filter, ChevronRight, Trash2,
  UserMinus, AlertTriangle
} from 'lucide-react';
import assignmentAPI from '../../../../apis/assignment';
import type { Assignment } from '../../../../apis/assignment';
import { dialogs } from '../../../../utils/dialogs';

interface ViewAssignedWorkersDialogProps {
  pitakId: number;
  pitakLocation?: string;
  onClose: () => void;
  onViewAssignment?: (assignmentId: number) => void;
  onWorkerRemoved?: (workerId: number) => void;
}

interface WorkerSummary {
  id: number;
  name: string;
  code: string;
  contactNumber?: string;
  totalAssignments: number;
  totalLuWang: number;
  activeAssignments: number;
  completedAssignments: number;
  assignments: Assignment[];
}

const ViewAssignedWorkersDialog: React.FC<ViewAssignedWorkersDialogProps> = ({
  pitakId,
  pitakLocation = 'Unknown Location',
  onClose,
  onViewAssignment,
  onWorkerRemoved
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [removingWorkerId, setRemovingWorkerId] = useState<number | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);
  const [removeConfirmData, setRemoveConfirmData] = useState<{
    workerId: number;
    workerName: string;
    activeAssignments: number;
  } | null>(null);

  useEffect(() => {
    fetchAssignedWorkers();
  }, [pitakId]);

  const fetchAssignedWorkers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await assignmentAPI.getAssignmentsByPitak(pitakId);
      
      if (response.status && response.data && response.data.assignments) {
        // Group assignments by worker
        const workerMap = new Map<number, WorkerSummary>();
        
        response.data.assignments.forEach((assignment: Assignment) => {
          if (assignment.worker) {
            const workerId = assignment.worker.id;
            
            if (!workerMap.has(workerId)) {
              workerMap.set(workerId, {
                id: workerId,
                name: assignment.worker.name,
                code: assignment.worker.code,
                contactNumber: assignment.worker.contactNumber,
                totalAssignments: 0,
                totalLuWang: 0,
                activeAssignments: 0,
                completedAssignments: 0,
                assignments: []
              });
            }
            
            const worker = workerMap.get(workerId)!;
            worker.assignments.push(assignment);
            worker.totalAssignments++;
            worker.totalLuWang += (assignment.luwangCount as unknown as number || 0);
            
            if (assignment.status === 'active') worker.activeAssignments++;
            if (assignment.status === 'completed') worker.completedAssignments++;
          }
        });
        
        setWorkers(Array.from(workerMap.values()));
      } else {
        setWorkers([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned workers');
      console.error('Error fetching assigned workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWorker = (workerId: number, workerName: string, activeAssignments: number) => {
    setRemoveConfirmData({
      workerId,
      workerName,
      activeAssignments
    });
    setShowRemoveConfirm(workerId);
  };

  const confirmRemoveWorker = async () => {
    if (!removeConfirmData) return;
    
    const { workerId, workerName } = removeConfirmData;
    setRemovingWorkerId(workerId);
    
    try {
      // First, get all active assignments for this worker in this pitak
      const workerAssignments = workers.find(w => w.id === workerId)?.assignments || [];
      const activeAssignments = workerAssignments.filter(a => a.status === 'active');
      
      if (activeAssignments.length === 0) {
        dialogs.warning(`No active assignments found for ${workerName}.`);
        setRemovingWorkerId(null);
        setShowRemoveConfirm(null);
        return;
      }
      
      // Update each active assignment to cancelled status
      const updatePromises = activeAssignments.map(assignment => 
        assignmentAPI.updateAssignmentStatus(
          assignment.id, 
          'cancelled', 
          `Worker ${workerName} (${workerId}) removed from pitak by user`
        )
      );
      
      const results = await Promise.all(updatePromises);
      const successCount = results.filter(r => r.status).length;
      
      if (successCount > 0) {
        // Refresh the workers list
        await fetchAssignedWorkers();
        
        // Notify parent component if callback provided
        if (onWorkerRemoved) {
          onWorkerRemoved(workerId);
        }
        
        dialogs.success(`Successfully removed ${workerName} from ${successCount} assignment(s).`);
      } else {
        dialogs.error(`Failed to remove ${workerName} from assignments. Please try again.`);
      }
      
    } catch (err: any) {
      console.error('Error removing worker:', err);
      dialogs.error(`Error removing worker: ${err.message || 'Unknown error'}`);
    } finally {
      setRemovingWorkerId(null);
      setShowRemoveConfirm(null);
      setRemoveConfirmData(null);
    }
  };

  const cancelRemoveWorker = () => {
    setShowRemoveConfirm(null);
    setRemoveConfirmData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#d1fae5', text: '#065f46' };
      case 'completed': return { bg: '#dbeafe', text: '#1e40af' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredWorkers = workers.filter(worker => {
    // Apply status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active' && worker.activeAssignments === 0) return false;
      if (selectedStatus === 'completed' && worker.completedAssignments === 0) return false;
      if (selectedStatus === 'has-assignments' && worker.totalAssignments === 0) return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        worker.name.toLowerCase().includes(searchLower) ||
        worker.code.toLowerCase().includes(searchLower) ||
        (worker.contactNumber && worker.contactNumber.includes(searchTerm))
      );
    }
    
    return true;
  });

  const totalWorkers = workers.length;
  const totalAssignments = workers.reduce((sum, worker) => sum + worker.totalAssignments, 0);
  const totalLuWang = workers.reduce((sum, worker) => sum + worker.totalLuWang, 0);
  const activeWorkers = workers.filter(worker => worker.activeAssignments > 0).length;

  const handleExport = async () => {
    try {
      const response = await assignmentAPI.exportAssignmentsToCSV({ pitakId });
      if (response.status) {
        // Create download link for CSV
        const blob = new Blob([response.data.fileInfo?.content || ''], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.fileInfo?.filename || `pitak-${pitakId}-assignments.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        dialogs.error('Export failed: ' + response.message);
      }
    } catch (err: any) {
      dialogs.error('Export failed: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-lg border border-gray-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Assigned Workers</h3>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Pitak: {pitakLocation} (ID: #{pitakId})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Close"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search workers by name, code, or contact..."
                className="w-full px-3 py-2 rounded text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none pl-9"
              />
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Workers</option>
                <option value="active">With Active Assignments</option>
                <option value="completed">With Completed Assignments</option>
                <option value="has-assignments">Has Any Assignments</option>
              </select>
              
              <button
                onClick={handleExport}
                className="px-3 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading assigned workers...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Error Loading Workers</p>
              <p className="text-xs text-gray-600 mb-3">{error}</p>
              <button
                onClick={fetchAssignedWorkers}
                className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retry
              </button>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No Workers Assigned</p>
              <p className="text-xs text-gray-600">
                {searchTerm ? `No workers found for "${searchTerm}"` : 'No workers are currently assigned to this pitak'}
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Total Workers</div>
                    <div className="font-semibold text-gray-900">{totalWorkers}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Active Workers</div>
                    <div className="font-semibold text-green-600">{activeWorkers}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Total Assignments</div>
                    <div className="font-semibold text-blue-600">{totalAssignments}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Total LuWang</div>
                    <div className="font-semibold text-gray-900">{totalLuWang.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Workers List */}
              <div className="divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <div key={worker.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-600">
                            {worker.name.charAt(0)}
                          </span>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {worker.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {worker.code}
                            </span>
                            {worker.activeAssignments > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                {worker.activeAssignments} active
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                            {worker.contactNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {worker.contactNumber}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {worker.totalAssignments} assignments
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {worker.totalLuWang} total LuWang
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {worker.activeAssignments > 0 && (
                          <button
                            onClick={() => handleRemoveWorker(worker.id, worker.name, worker.activeAssignments)}
                            disabled={removingWorkerId === worker.id}
                            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                              removingWorkerId === worker.id
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300'
                            }`}
                            title={`Remove ${worker.name} from pitak assignments`}
                          >
                            {removingWorkerId === worker.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                Removing...
                              </>
                            ) : (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                Remove from Pitak
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Recent Assignments Preview */}
                    {worker.assignments.slice(0, 2).map((assignment) => (
                      <div 
                        key={assignment.id} 
                        className="mt-2 ml-13 pl-3 border-l-2 border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => onViewAssignment?.(assignment.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">
                              {formatDate(assignment.assignmentDate)}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{assignment.luwangCount} LuWang</span>
                            <span className="mx-2">•</span>
                            <span 
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: getStatusColor(assignment.status).bg,
                                color: getStatusColor(assignment.status).text
                              }}
                            >
                              {assignment.status}
                            </span>
                          </div>
                          {assignment.notes && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              "{assignment.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {worker.assignments.length > 2 && (
                      <div className="mt-2 ml-13 pl-3">
                        <button
                          onClick={() => onViewAssignment?.(worker.assignments[0]?.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          + {worker.assignments.length - 2} more assignments...
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {filteredWorkers.length} of {workers.length} workers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </button>
              <button
                onClick={fetchAssignedWorkers}
                className="px-3 py-1.5 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Remove Confirmation Modal */}
        {showRemoveConfirm && removeConfirmData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Remove Worker</h3>
                  <p className="text-xs text-gray-600">Confirm removal action</p>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to remove <span className="font-semibold">{removeConfirmData.workerName}</span> from this pitak?
                </p>
                
                {removeConfirmData.activeAssignments > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-yellow-800 mb-1">Important:</p>
                        <p className="text-xs text-yellow-700">
                          This will cancel <span className="font-semibold">{removeConfirmData.activeAssignments} active assignment(s)</span> for this worker.
                          Completed assignments will not be affected.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelRemoveWorker}
                    className="px-3 py-1.5 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700"
                    disabled={removingWorkerId !== null}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoveWorker}
                    disabled={removingWorkerId !== null}
                    className={`px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1 ${
                      removingWorkerId !== null
                        ? 'bg-red-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {removingWorkerId !== null ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-3.5 h-3.5" />
                        Remove Worker
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAssignedWorkersDialog;