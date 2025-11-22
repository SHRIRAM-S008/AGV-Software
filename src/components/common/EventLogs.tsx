import { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, Info, XCircle, Clock, Calendar, Truck,
  Filter, Search, Download, RefreshCw, Eye, ChevronRight, Activity,
  Zap, Battery, Wifi, WifiOff, Settings, MapPin, TrendingUp
} from 'lucide-react';
import { eventLogs } from '@/data/agvData';

interface EventLog {
  id: string;
  timestamp: Date;
  agvId: string;
  eventType: 'obstacle_detected' | 'path_change' | 'low_battery' | 'job_completed' | 'system_update' | 'error' | 'warning' | 'info';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  resolved: boolean;
}

export const EventLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAGV, setSelectedAGV] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showResolved, setShowResolved] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredEvents = eventLogs.filter(event => {
    const matchesSearch = event.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.agvId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAGV = selectedAGV === 'all' || event.agvId === selectedAGV;
    const matchesSeverity = selectedSeverity === 'all' || event.severity === selectedSeverity;
    const matchesType = selectedType === 'all' || event.eventType === selectedType;
    const matchesResolved = showResolved || !event.resolved;
    
    return matchesSearch && matchesAGV && matchesSeverity && matchesType && matchesResolved;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-500';
      case 'warning': return 'text-orange-600 bg-orange-100 border-orange-500';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-500';
      default: return 'text-gray-600 bg-gray-100 border-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'obstacle_detected': return <AlertTriangle className="w-4 h-4" />;
      case 'path_change': return <MapPin className="w-4 h-4" />;
      case 'low_battery': return <Battery className="w-4 h-4" />;
      case 'job_completed': return <CheckCircle className="w-4 h-4" />;
      case 'system_update': return <Settings className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getEventStatistics = () => {
    const total = filteredEvents.length;
    const critical = filteredEvents.filter(event => event.severity === 'critical').length;
    const warning = filteredEvents.filter(event => event.severity === 'warning').length;
    const info = filteredEvents.filter(event => event.severity === 'info').length;
    const unresolved = filteredEvents.filter(event => !event.resolved).length;
    const resolved = filteredEvents.filter(event => event.resolved).length;
    
    return { total, critical, warning, info, unresolved, resolved };
  };

  const uniqueAGVs = Array.from(new Set(eventLogs.map(event => event.agvId)));
  const eventTypes = Array.from(new Set(eventLogs.map(event => event.eventType)));

  const stats = getEventStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Event Logs
                </h1>
                <p className="text-xs text-gray-500">Real-time AGV system events and activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
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
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.critical}</span>
            </div>
            <p className="text-sm text-gray-600">Critical</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.warning}</span>
            </div>
            <p className="text-sm text-gray-600">Warnings</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.resolved}</span>
            </div>
            <p className="text-sm text-gray-600">Resolved</p>
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
              
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Resolved</span>
              </label>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Event Logs List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedAGV !== 'all' || selectedSeverity !== 'all' || selectedType !== 'all'
                  ? 'No events match your current filters'
                  : 'No events have been recorded yet'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`bg-white rounded-xl border-l-4 p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                  getSeverityColor(event.severity)
                }`}
                onClick={() => setShowDetails(showDetails === event.id ? null : event.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${getSeverityColor(event.severity)}`}>
                      {getSeverityIcon(event.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {event.eventType.replace('_', ' ')}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                        {!event.resolved && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        {event.resolved && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{event.message}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Truck className="w-4 h-4" />
                          <span>{event.agvId}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(event.timestamp)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          {getTypeIcon(event.eventType)}
                          <span className="capitalize">{event.eventType.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed View Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${getSeverityColor(filteredEvents.find(e => e.id === showDetails)?.severity || 'info')}`}>
                      {getSeverityIcon(filteredEvents.find(e => e.id === showDetails)?.severity || 'info')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
                      <p className="text-sm text-gray-500">Event ID: {showDetails}</p>
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
              
              {filteredEvents.filter(event => event.id === showDetails).map(event => (
                <div key={event.id} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Event Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{event.eventType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Severity:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">AGV ID:</span>
                          <span className="font-medium">{event.agvId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium">
                            {event.resolved ? (
                              <span className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Resolved</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Unresolved</span>
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Timing Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Timestamp:</span>
                          <span className="font-medium">{formatDate(event.timestamp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Full Date:</span>
                          <span className="font-medium">{event.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Event Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{event.message}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Event Actions</h4>
                    <div className="flex space-x-3">
                      {!event.resolved && (
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as Resolved</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Investigate</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
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
