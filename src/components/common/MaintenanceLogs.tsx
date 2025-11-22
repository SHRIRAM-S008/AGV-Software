import { useState } from 'react';
import { 
  Wrench, Calendar, User, DollarSign, Clock, AlertTriangle, CheckCircle,
  Filter, Search, Download, Plus, Eye, Edit2, Trash2, ChevronRight,
  FileText, Settings, Battery, Activity
} from 'lucide-react';
import { maintenanceLogs } from '@/data/agvData';

interface MaintenanceLog {
  id: string;
  agvId: string;
  date: Date;
  issue: string;
  workDone: string;
  technician: string;
  partsReplaced: string[];
  cost: number;
  downtime: string;
}

export const MaintenanceLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAGV, setSelectedAGV] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredLogs = maintenanceLogs.filter(log => {
    const matchesSearch = log.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.workDone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.technician.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAGV = selectedAGV === 'all' || log.agvId === selectedAGV;
    
    return matchesSearch && matchesAGV;
  });

  const getSeverityColor = (issue: string) => {
    const lowerIssue = issue.toLowerCase();
    if (lowerIssue.includes('critical') || lowerIssue.includes('emergency')) {
      return 'border-red-500 bg-red-50 text-red-800';
    } else if (lowerIssue.includes('warning') || lowerIssue.includes('issue')) {
      return 'border-orange-500 bg-orange-50 text-orange-800';
    } else {
      return 'border-green-500 bg-green-50 text-green-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTotalCost = () => {
    return filteredLogs.reduce((total, log) => total + log.cost, 0);
  };

  const getTotalDowntime = () => {
    // Convert downtime to hours for calculation
    return filteredLogs.reduce((total, log) => {
      const hours = parseInt(log.downtime.split(' ')[0]) || 0;
      return total + hours;
    }, 0);
  };

  const uniqueAGVs = Array.from(new Set(maintenanceLogs.map(log => log.agvId)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Maintenance Logs
                </h1>
                <p className="text-xs text-gray-500">AGV maintenance history and tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{filteredLogs.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Maintenance</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">${getTotalCost()}</span>
            </div>
            <p className="text-sm text-gray-600">Total Cost</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{getTotalDowntime()}h</span>
            </div>
            <p className="text-sm text-gray-600">Total Downtime</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <User className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {new Set(maintenanceLogs.map(log => log.technician)).size}
              </span>
            </div>
            <p className="text-sm text-gray-600">Technicians</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-2">
              <select
                value={selectedAGV}
                onChange={(e) => setSelectedAGV(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All AGVs</option>
                {uniqueAGVs.map(agvId => (
                  <option key={agvId} value={agvId}>{agvId}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search maintenance logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Logs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AGV ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downtime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-3">
                        <Wrench className="w-12 h-12 text-gray-300" />
                        <span>No maintenance logs found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.agvId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.issue}</div>
                        <div className="text-xs text-gray-500">{log.workDone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{log.technician}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${log.cost}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>{log.downtime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed View Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Maintenance Details</h3>
                      <p className="text-sm text-gray-500">Log ID: {showDetails}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {filteredLogs.filter(log => log.id === showDetails).map(log => (
                <div key={log.id} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">General Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">AGV ID:</span>
                          <span className="font-medium">{log.agvId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(log.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Technician:</span>
                          <span className="font-medium">{log.technician}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium text-green-600">${log.cost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Downtime:</span>
                          <span className="font-medium text-orange-600">{log.downtime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Issue & Resolution</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-600">Issue:</span>
                          <p className="text-sm text-gray-900 mt-1">{log.issue}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Work Done:</span>
                          <p className="text-sm text-gray-900 mt-1">{log.workDone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {log.partsReplaced.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Parts Replaced</h4>
                      <div className="flex flex-wrap gap-2">
                        {log.partsReplaced.map((part, index) => (
                          <span key={index} className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            <Wrench className="w-3 h-3 mr-1" />
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
