// components/Dialogs/ViewPlotsDialog.tsx
import React, { useState, useEffect } from 'react';
import { X, Layers, MapPin, Hash, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import pitakAPI from '../../../apis/pitak';
import { showError } from '../../../utils/notification';
import { formatDate } from '../../../utils/formatters';

interface ViewPlotsDialogProps {
  bukidId: number;
  bukidName: string;
  onClose: () => void;
  onAddPlot?: (bukidId: number) => void;
  onViewPlotDetails?: (plotId: number) => void;
}

const ViewPlotsDialog: React.FC<ViewPlotsDialogProps> = ({
  bukidId,
  bukidName,
  onClose,
  onAddPlot,
  onViewPlotDetails
}) => {
  const [loading, setLoading] = useState(true);
  const [plots, setPlots] = useState<any[]>([]);
  const [bukidInfo, setBukidInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  const fetchPlots = async () => {
    try {
      setError(null);
      setRefreshing(true);

      // Fetch plots for this bukid using pitakAPI
      const plotsResponse = await pitakAPI.getPitaksByBukid(bukidId);
      
      if (plotsResponse.status && plotsResponse.data) {
        // IMPORTANT: Check the structure of the response
        // Based on your API response, it might be plotsResponse.data.pitaks
        if (Array.isArray(plotsResponse.data)) {
          // If response.data is already an array
          setPlots(plotsResponse.data);
          setBukidInfo(null); // No separate bukid info in this case
        } else if (plotsResponse.data.pitaks && Array.isArray(plotsResponse.data.pitaks)) {
          // If response.data has a pitaks array
          setPlots(plotsResponse.data.pitaks);
          setBukidInfo(plotsResponse.data.bukid || null);
          setStatistics(plotsResponse.data.statistics || null);
        } else if (plotsResponse.data.data && plotsResponse.data.data.pitaks) {
          // If response.data has a data object with pitaks
          setPlots(plotsResponse.data.data.pitaks);
          setBukidInfo(plotsResponse.data.data.bukid || null);
          setStatistics(plotsResponse.data.data.statistics || null);
        } else {
          // Try to find any array in the response
          const findArrayInObject = (obj: any): any[] => {
            for (const key in obj) {
              if (Array.isArray(obj[key])) {
                return obj[key];
              }
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                const found = findArrayInObject(obj[key]);
                if (found.length > 0) return found;
              }
            }
            return [];
          };
          
          const foundPlots = findArrayInObject(plotsResponse.data);
          if (foundPlots.length > 0) {
            setPlots(foundPlots);
          } else {
            throw new Error('No plots array found in response');
          }
        }
      } else {
        throw new Error(plotsResponse.message || 'Failed to fetch plots');
      }
    } catch (err: any) {
      console.error('Error fetching plots:', err);
      setError(err.message || 'Failed to load plots');
      showError('Failed to load plots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (bukidId) {
      fetchPlots();
    }
  }, [bukidId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        text: 'Active',
        bg: 'rgba(34, 197, 94, 0.1)',
        color: 'rgb(21, 128, 61)',
        border: 'rgba(34, 197, 94, 0.2)',
        icon: CheckCircle,
        tooltip: 'Plot is active and available for assignments'
      },
      inactive: {
        text: 'Inactive',
        bg: 'rgba(107, 114, 128, 0.1)',
        color: 'rgb(75, 85, 99)',
        border: 'rgba(107, 114, 128, 0.2)',
        icon: XCircle,
        tooltip: 'Plot is currently inactive'
      },
      completed: {
        text: 'Completed',
        bg: 'rgba(59, 130, 246, 0.1)',
        color: 'rgb(29, 78, 216)',
        border: 'rgba(59, 130, 246, 0.2)',
        icon: CheckCircle,
        tooltip: 'Plot has been harvested/completed'
      },
      pending: {
        text: 'Pending',
        bg: 'rgba(245, 158, 11, 0.1)',
        color: 'rgb(180, 83, 9)',
        border: 'rgba(245, 158, 11, 0.2)',
        icon: Clock,
        tooltip: 'Plot is pending setup'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <div className="tooltip-wrapper inline-block">
        <span
          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
          style={{
            background: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`
          }}
        >
          <Icon className="w-3 h-3" />
          {config.text}
        </span>
        <span className="tooltip-text">{config.tooltip}</span>
      </div>
    );
  };

  const calculateTotals = () => {
    if (!Array.isArray(plots)) {
      return { totalPlots: 0, totalLuWang: 0, activePlots: 0, averageLuWang: 0 };
    }

    const totalPlots = plots.length;
    const totalLuWang = plots.reduce((sum, plot) => {
      const luwang = parseFloat(plot.totalLuwang) || 0;
      return sum + luwang;
    }, 0);
    const activePlots = plots.filter(plot => plot.status === 'active').length;
    const averageLuWang = totalPlots > 0 ? (totalLuWang / totalPlots).toFixed(1) : 0;

    return { totalPlots, totalLuWang, activePlots, averageLuWang };
  };

  const totals = calculateTotals();

  // Use statistics from API if available, otherwise use calculated totals
  const displayStats = statistics || {
    totalPitaks: totals.totalPlots,
    totalLuWangCapacity: totals.totalLuWang,
    activePitaks: totals.activePlots,
    utilizationRate: 0
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl border border-gray-200">
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading plots...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-xl border border-gray-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Plots in {bukidName}</h3>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {bukidInfo?.location || 'Location not specified'}
                </span>
                <span>•</span>
                <span>Total: {displayStats.totalPitaks || totals.totalPlots} plots</span>
                <span>•</span>
                <span>{displayStats.totalLuWangCapacity || totals.totalLuWang} total luwang</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {plots.length} plot{plots.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-4">
              {onAddPlot && (
                <button
                  onClick={() => onAddPlot(bukidId)}
                  className="px-3 py-1.5 text-sm rounded border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1"
                >
                  <Layers className="w-4 h-4" />
                  Add New Plot
                </button>
              )}
              <button
                onClick={fetchPlots}
                disabled={refreshing}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {error ? (
            <div className="p-12 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-900 mb-1">Error Loading Plots</h4>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchPlots}
                className="px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : !Array.isArray(plots) || plots.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-900 mb-1">No Plots Found</h4>
              <p className="text-sm text-gray-600 mb-4">
                This bukid doesn't have any plots yet. Add your first plot to get started.
              </p>
              {onAddPlot && (
                <button
                  onClick={() => onAddPlot(bukidId)}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Layers className="w-4 h-4" />
                  Add First Plot
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Plots</div>
                  <div className="text-2xl font-bold text-gray-900">{displayStats.totalPitaks || totals.totalPlots}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Luwang</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {displayStats.totalLuWangCapacity ? displayStats.totalLuWangCapacity.toFixed(1) : totals.totalLuWang.toFixed(1)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Active Plots</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {displayStats.activePitaks || totals.activePlots}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4">
                  <div className="text-sm text-gray-600 mb-1">Utilization</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {displayStats.utilizationRate ? `${displayStats.utilizationRate.toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Plots Table */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Plot Details
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Luwang
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Assignments
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      {onViewPlotDetails && (
                        <th className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {plots.map((plot, index) => (
                      <tr key={plot.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                              <Hash className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Plot #{plot.id}</div>
                              <div className="text-xs text-gray-500">Sequence: {index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="tooltip-wrapper">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                {plot.location || 'Not specified'}
                              </span>
                            </div>
                            {plot.location && (
                              <span className="tooltip-text max-w-xs break-words">{plot.location}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-semibold text-green-700">
                                {plot.totalLuwang ? parseFloat(plot.totalLuwang).toFixed(1) : '0'}
                              </div>
                              <div className="text-xs text-gray-500">capacity</div>
                            </div>
                            {plot.assignmentStats && (
                              <div className="text-xs text-gray-600">
                                Assigned: {plot.assignmentStats.totalLuWangAssigned?.toFixed(1) || '0'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(plot.status || 'active')}
                        </td>
                        <td className="p-3">
                          {plot.assignmentStats ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">{plot.assignmentStats.total || 0}</span> total
                              </div>
                              <div className="text-xs text-gray-600">
                                {plot.assignmentStats.active || 0} active, {plot.assignmentStats.completed || 0} completed
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">No assignments</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-gray-600">
                            {plot.createdAt ? formatDate(plot.createdAt, 'MMM dd, yyyy') : 'N/A'}
                          </div>
                        </td>
                        {onViewPlotDetails && (
                          <td className="p-3">
                            <button
                              onClick={() => onViewPlotDetails(plot.id)}
                              className="px-3 py-1 text-sm rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              View Details
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {totals.activePlots} active
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-gray-400" />
                    {plots.length - totals.activePlots} inactive/completed
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4 text-blue-500" />
                    {totals.totalLuWang.toFixed(1)} total luwang capacity
                  </span>
                  {statistics && statistics.totalAssignments && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-4 h-4 text-purple-500" />
                      {statistics.totalAssignments} total assignments
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Bukid ID: #{bukidId} • Last updated: {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPlotsDialog;