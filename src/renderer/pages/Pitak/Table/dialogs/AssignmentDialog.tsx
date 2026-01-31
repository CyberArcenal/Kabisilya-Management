import React, { useState, useEffect } from 'react';
import type { WorkerData } from '../../../../apis/worker';
import workerAPI from '../../../../apis/worker';
import assignmentAPI from '../../../../apis/assignment';
import { 
  Calendar, 
  Check, 
  ChevronDown, 
  FileText, 
  Plus, 
  Search, 
  User, 
  Users, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Info,
  MapPin,
  UserCheck,
  UserX
} from 'lucide-react';

interface AssignmentDialogProps {
  data: any;
  onChange: (data: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({ data, onChange, onSubmit, onClose }) => {
  const [selectedWorkers, setSelectedWorkers] = useState<any[]>(data.workers || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWorkerList, setShowWorkerList] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Workers assigned to THIS pitak (any date, any status except cancelled)
  const [assignedToThisPitak, setAssignedToThisPitak] = useState<any[]>([]);
  
  // Workers assigned to OTHER pitaks on selected date
  const [assignedToOtherPitaks, setAssignedToOtherPitaks] = useState<Map<number, any[]>>(new Map());
  
  // Workers available for assignment (not assigned to any pitak on selected date)
  const [availableForAssignment, setAvailableForAssignment] = useState<number[]>([]);
  
  const [checkingAssignments, setCheckingAssignments] = useState(false);

  // Fetch available workers
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await workerAPI.getActiveWorkers({
          limit: 100,
          sortBy: 'name',
          sortOrder: 'ASC'
        });
        
        if (response.status) {
          setAvailableWorkers(response.data.workers.filter(worker => 
            worker.status === 'active' || worker.status === 'on-leave'
          ));
        } else {
          setError(response.message || 'Failed to load workers');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load workers');
        console.error('Error fetching workers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (showWorkerList) {
      fetchWorkers();
    }
  }, [showWorkerList]);

  // Check worker assignments
  useEffect(() => {
    const checkWorkerAssignments = async () => {
      if (!data.pitakId || !data.assignmentDate) return;
      
      setCheckingAssignments(true);
      const thisPitakAssignments: any[] = [];
      const otherPitakAssignments = new Map<number, any[]>();
      const availableWorkersList: number[] = [];
      
      try {
        // Get all assignments for this pitak (excluding cancelled)
        const pitakResponse = await assignmentAPI.getAssignmentsByPitak(data.pitakId, {
          status: 'active'
        });
        
        if (pitakResponse.status && pitakResponse.data) {
          const assignments = pitakResponse.data.assignments || [];
          
          assignments.forEach((assignment: any) => {
            if (assignment.worker && assignment.worker.id && 
                assignment.status !== 'cancelled' &&
                assignment.assignmentDate <= data.assignmentDate) {
              
              thisPitakAssignments.push({
                workerId: assignment.worker.id,
                workerName: assignment.worker.name,
                workerCode: assignment.worker.code,
                assignmentDate: assignment.assignmentDate,
                luwangCount: assignment.luwangCount,
                assignmentId: assignment.id,
                status: assignment.status
              });
            }
          });
        }

        // Get assignments for the selected date
        const dateResponse = await assignmentAPI.getAssignmentsByDate(data.assignmentDate, {
          status: 'active'
        });
        
        if (dateResponse.status && dateResponse.data) {
          const dateAssignments = dateResponse.data;
          const assignedWorkerIds = new Set<number>();
          
          // Process assignments for other pitaks
          dateAssignments.forEach((assignment: any) => {
            if (assignment.worker && assignment.worker.id) {
              assignedWorkerIds.add(assignment.worker.id);
              
              // Skip if it's for this pitak
              if (assignment.pitak?.id === data.pitakId) return;
              
              if (!otherPitakAssignments.has(assignment.worker.id)) {
                otherPitakAssignments.set(assignment.worker.id, []);
              }
              
              otherPitakAssignments.get(assignment.worker.id)?.push({
                assignmentId: assignment.id,
                pitakId: assignment.pitak?.id,
                pitakName: assignment.pitak?.name || 'Unknown Pitak',
                pitakCode: assignment.pitak?.code || 'N/A',
                status: assignment.status,
                luwangCount: assignment.luwangCount,
                notes: assignment.notes
              });
            }
          });

          // Find available workers (not assigned to any pitak on this date)
          availableWorkers.forEach(worker => {
            if (!assignedWorkerIds.has(worker.id)) {
              availableWorkersList.push(worker.id);
            }
          });
        }
      } catch (err) {
        console.error('Error checking worker assignments:', err);
      } finally {
        setAssignedToThisPitak(thisPitakAssignments);
        setAssignedToOtherPitaks(otherPitakAssignments);
        setAvailableForAssignment(availableWorkersList);
        setCheckingAssignments(false);
      }
    };

    if (data.pitakId && data.assignmentDate && availableWorkers.length > 0) {
      checkWorkerAssignments();
    }
  }, [data.pitakId, data.assignmentDate, availableWorkers]);

  // Filter workers based on search and assignment status
  const filteredWorkers = availableWorkers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleInputChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Check worker assignment status
  const getWorkerAssignmentStatus = (workerId: number) => {
    const isAssignedToThisPitak = assignedToThisPitak.some(a => a.workerId === workerId);
    const otherAssignments = assignedToOtherPitaks.get(workerId) || [];
    const isAvailable = availableForAssignment.includes(workerId);
    
    return {
      isAssignedToThisPitak,
      hasOtherAssignments: otherAssignments.length > 0,
      isAvailable,
      otherAssignments,
      thisPitakAssignment: assignedToThisPitak.find(a => a.workerId === workerId)
    };
  };

  const toggleWorkerSelection = (worker: WorkerData) => {
    const assignmentStatus = getWorkerAssignmentStatus(worker.id);
    
    if (assignmentStatus.hasOtherAssignments) {
      // Show warning but allow selection
      const confirmAdd = window.confirm(
        `This worker is already assigned to other pitaks on ${data.assignmentDate}. Do you want to assign them anyway?`
      );
      if (!confirmAdd) return;
    }
    
    const isSelected = selectedWorkers.some(w => w.id === worker.id);
    let updatedWorkers;
    
    if (isSelected) {
      updatedWorkers = selectedWorkers.filter(w => w.id !== worker.id);
    } else {
      updatedWorkers = [...selectedWorkers, {
        id: worker.id,
        name: worker.name,
        contact: worker.contact,
        email: worker.email,
        status: worker.status,
        assignmentStatus: assignmentStatus
      }];
    }
    
    setSelectedWorkers(updatedWorkers);
    onChange({ ...data, workers: updatedWorkers });
  };

  const removeWorker = (workerId: number) => {
    const updatedWorkers = selectedWorkers.filter(w => w.id !== workerId);
    setSelectedWorkers(updatedWorkers);
    onChange({ ...data, workers: updatedWorkers });
  };

  const clearAllWorkers = () => {
    setSelectedWorkers([]);
    onChange({ ...data, workers: [] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'on-leave': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'inactive': return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
      case 'terminated': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const isSubmitDisabled = selectedWorkers.length === 0 || !data.assignmentDate;

  // Group workers by assignment status for display
  const workersByStatus = {
    assignedToThisPitak: assignedToThisPitak,
    assignedToOtherPitaks: Array.from(assignedToOtherPitaks.entries()).map(([workerId, assignments]) => {
      const worker = availableWorkers.find(w => w.id === workerId);
      return {
        workerId,
        workerName: worker?.name || 'Unknown Worker',
        assignments
      };
    }),
    available: availableWorkers.filter(w => availableForAssignment.includes(w.id))
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Assign Workers to Pitak</h3>
              <p className="text-xs text-gray-600">Select workers and avoid double assignment</p>
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

        {/* Form */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Assignment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Already in This Pitak</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{assignedToThisPitak.length}</div>
              <p className="text-xs text-gray-600 mt-1">Workers already assigned to this pitak</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserX className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Assigned Elsewhere</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">{workersByStatus.assignedToOtherPitaks.length}</div>
              <p className="text-xs text-gray-600 mt-1">Already assigned to other pitaks on {data.assignmentDate || 'selected date'}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Available</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{workersByStatus.available.length}</div>
              <p className="text-xs text-gray-600 mt-1">Available for assignment on {data.assignmentDate || 'selected date'}</p>
            </div>
          </div>

          {/* Section 2: Workers already assigned to THIS pitak - Detailed View */}
          {assignedToThisPitak.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Workers Already Assigned to This Pitak
                <span className="text-xs font-normal text-gray-500">
                  ({assignedToThisPitak.length} worker{assignedToThisPitak.length !== 1 ? 's' : ''})
                </span>
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assignedToThisPitak.map((assignment, index) => (
                    <div
                      key={`already-${assignment.workerId}-${index}`}
                      className="flex items-start gap-2 p-2 rounded bg-white border border-blue-300"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900 truncate">{assignment.workerName}</div>
                          <span className="text-xs font-medium text-blue-700">ID: {assignment.workerCode}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Last assigned: {assignment.assignmentDate}
                          {assignment.luwangCount > 0 && ` • ${assignment.luwangCount} LuWang`}
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            assignment.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  <Info className="w-3 h-3 inline mr-1" />
                  These workers are already working in this pitak. You can still assign them additional work.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Selected Workers for this assignment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900">
                Selected Workers for This Assignment ({selectedWorkers.length})
                <span className="text-red-500 ml-1">*</span>
              </label>
              {selectedWorkers.length > 0 && (
                <button
                  onClick={clearAllWorkers}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {/* Selected Workers List */}
            {selectedWorkers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedWorkers.map(worker => {
                  const assignmentStatus = getWorkerAssignmentStatus(worker.id);
                  const statusColor = getStatusColor(worker.status);
                  
                  return (
                    <div
                      key={worker.id}
                      className={`flex items-start justify-between p-2 rounded border ${
                        assignmentStatus.hasOtherAssignments 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : assignmentStatus.isAssignedToThisPitak 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-green-300 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start gap-2 truncate">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          assignmentStatus.hasOtherAssignments 
                            ? 'bg-yellow-100' 
                            : assignmentStatus.isAssignedToThisPitak 
                            ? 'bg-blue-100' 
                            : 'bg-green-100'
                        }`}>
                          <User className={`w-3 h-3 ${
                            assignmentStatus.hasOtherAssignments 
                              ? 'text-yellow-600' 
                              : assignmentStatus.isAssignedToThisPitak 
                              ? 'text-blue-600' 
                              : 'text-green-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">{worker.name}</span>
                            {assignmentStatus.isAssignedToThisPitak && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                <UserCheck className="w-2.5 h-2.5" />
                                Already Here
                              </span>
                            )}
                            {assignmentStatus.hasOtherAssignments && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Other Assignments
                              </span>
                            )}
                            {!assignmentStatus.isAssignedToThisPitak && !assignmentStatus.hasOtherAssignments && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                <CheckCircle className="w-2.5 h-2.5" />
                                Available
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {worker.contact || worker.email || 'No contact'}
                          </div>
                          
                          {/* Show other assignments details */}
                          {assignmentStatus.hasOtherAssignments && assignmentStatus.otherAssignments.length > 0 && (
                            <div className="mt-1 space-y-1">
                              <div className="text-xs font-medium text-yellow-700">Other Assignments:</div>
                              {assignmentStatus.otherAssignments.slice(0, 2).map((assignment: any, idx: number) => (
                                <div key={idx} className="text-xs text-yellow-700 bg-yellow-100 p-1 rounded">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span className="font-medium">{assignment.pitakName}</span>
                                    <span className="text-yellow-600">({assignment.pitakCode})</span>
                                  </div>
                                  <div className="text-yellow-600 pl-3">
                                    {assignment.luwangCount} LuWang
                                  </div>
                                </div>
                              ))}
                              {assignmentStatus.otherAssignments.length > 2 && (
                                <div className="text-xs text-yellow-600 italic">
                                  +{assignmentStatus.otherAssignments.length - 2} more assignment{assignmentStatus.otherAssignments.length - 2 !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeWorker(worker.id)}
                        className="w-5 h-5 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0 ml-2 mt-0.5"
                      >
                        <X className="w-2.5 h-2.5 text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded border border-dashed border-gray-300 text-center bg-gray-50">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No workers selected for this assignment</p>
                <p className="text-xs text-gray-500 mt-1">Select workers from the list below to assign them to this pitak</p>
              </div>
            )}
          </div>

          {/* Worker Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-900">
                Available Workers ({availableWorkers.length})
              </label>
              <div className="flex items-center gap-2">
                {checkingAssignments && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    Checking assignments...
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowWorkerList(!showWorkerList)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showWorkerList ? 'Hide List' : 'Show List'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showWorkerList ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {showWorkerList && (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search workers by name, contact, or email..."
                    className="w-full px-3 py-2 rounded text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
                
                <div className="max-h-64 overflow-y-auto rounded border border-gray-300 divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-xs text-gray-600 mt-2">Loading workers...</p>
                    </div>
                  ) : error ? (
                    <div className="p-3 text-center bg-red-50">
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  ) : filteredWorkers.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-gray-600">No workers found</p>
                    </div>
                  ) : (
                    filteredWorkers.map(worker => {
                      const isSelected = selectedWorkers.some(w => w.id === worker.id);
                      const assignmentStatus = getWorkerAssignmentStatus(worker.id);
                      const statusColor = getStatusColor(worker.status);
                      
                      return (
                        <div
                          key={worker.id}
                          className={`p-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                            isSelected ? 'bg-blue-50' : ''
                          } ${assignmentStatus.hasOtherAssignments ? 'bg-yellow-50' : ''}`}
                          onClick={() => toggleWorkerSelection(worker)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : assignmentStatus.hasOtherAssignments 
                                ? 'border-yellow-500 bg-yellow-100' 
                                : assignmentStatus.isAssignedToThisPitak 
                                ? 'border-blue-500 bg-blue-100' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              {assignmentStatus.hasOtherAssignments && !isSelected && (
                                <AlertCircle className="w-2.5 h-2.5 text-yellow-600" />
                              )}
                              {assignmentStatus.isAssignedToThisPitak && !isSelected && !assignmentStatus.hasOtherAssignments && (
                                <UserCheck className="w-2.5 h-2.5 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900 truncate">{worker.name}</div>
                                <div className="flex items-center gap-1">
                                  <span 
                                    className="text-xs px-1.5 py-0.5 rounded-full truncate"
                                    style={{
                                      backgroundColor: statusColor.bg,
                                      color: statusColor.text,
                                      border: `1px solid ${statusColor.border}`
                                    }}
                                  >
                                    {worker.status}
                                  </span>
                                  {assignmentStatus.isAssignedToThisPitak && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                      <UserCheck className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                  {assignmentStatus.hasOtherAssignments && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500 truncate">
                                  {worker.contact || worker.email || 'No contact'}
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                  ID: {worker.id || 'N/A'}
                                </span>
                              </div>
                              
                              {/* Assignment Status Info */}
                              {assignmentStatus.isAssignedToThisPitak && (
                                <div className="mt-1">
                                  <div className="text-xs text-blue-700 flex items-center gap-1">
                                    <UserCheck className="w-2.5 h-2.5" />
                                    Already assigned to this pitak
                                    {assignmentStatus.thisPitakAssignment && (
                                      <span className="text-blue-600">
                                        (last: {assignmentStatus.thisPitakAssignment.assignmentDate})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {assignmentStatus.hasOtherAssignments && (
                                <div className="mt-1">
                                  <div className="text-xs text-yellow-700">
                                    <AlertCircle className="w-2.5 h-2.5 inline mr-1" />
                                    Assigned to {assignmentStatus.otherAssignments.length} other pitak{assignmentStatus.otherAssignments.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {!isSelected && (
                            <Plus className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assignment Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Assignment Date
                <span className="text-red-500 ml-1">*</span>
              </div>
            </label>
            <input
              type="date"
              value={data.assignmentDate}
              onChange={(e) => handleInputChange('assignmentDate', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            
            {/* Summary Info */}
            <div className="mt-2 space-y-1">
              {selectedWorkers.some(w => getWorkerAssignmentStatus(w.id).isAssignedToThisPitak) && (
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <UserCheck className="w-3 h-3" />
                  <span>
                    {selectedWorkers.filter(w => getWorkerAssignmentStatus(w.id).isAssignedToThisPitak).length} 
                    worker(s) already assigned to this pitak
                  </span>
                </div>
              )}
              {selectedWorkers.some(w => getWorkerAssignmentStatus(w.id).hasOtherAssignments) && (
                <div className="flex items-center gap-2 text-xs text-yellow-700">
                  <AlertCircle className="w-3 h-3" />
                  <span>
                    {selectedWorkers.filter(w => getWorkerAssignmentStatus(w.id).hasOtherAssignments).length} 
                    worker(s) have other assignments on {data.assignmentDate}
                  </span>
                </div>
              )}
              {selectedWorkers.some(w => {
                const status = getWorkerAssignmentStatus(w.id);
                return !status.isAssignedToThisPitak && !status.hasOtherAssignments;
              }) && (
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  <span>
                    {selectedWorkers.filter(w => {
                      const status = getWorkerAssignmentStatus(w.id);
                      return !status.isAssignedToThisPitak && !status.hasOtherAssignments;
                    }).length} 
                    worker(s) are available for assignment
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                Notes (Optional)
              </div>
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 rounded text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Add any special instructions or notes about this assignment..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              Max 500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Required fields</span> are marked with *
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                className="px-3 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign {selectedWorkers.length} Worker{selectedWorkers.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDialog;