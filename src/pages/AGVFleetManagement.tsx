import { useState, useEffect } from 'react';
import { 
  Truck, Battery, Wifi, WifiOff, AlertTriangle, Play, Pause, Square,
  Navigation, MapPin, Activity, Settings, Zap, Target, Clock, TrendingUp,
  Wrench, BatteryCharging, StopCircle, Move, Radio, Thermometer,
  Package, ChevronRight, Eye, Download, RefreshCw, Shield, Gauge
} from 'lucide-react';
import { AGV, Position, Job } from '@/types';
import { realisticAGVFleet, batteryTelemetry, maintenanceLogs, jobHistory, eventLogs } from '@/data/agvData';
import SplitText from '@/components/common/SplitText';
import { TopMenu } from '@/components/layout/TopMenu';

export const AGVFleetManagement = () => {
  const [selectedAGV, setSelectedAGV] = useState<AGV | null>(null);
  const [activeView, setActiveView] = useState<'fleet' | 'individual' | 'map'>('fleet');
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Use realistic AGV fleet data
  const mockAGVFleet = realisticAGVFleet;

  const menuItems = [
    { label: '01. Home', ariaLabel: 'Go to home', link: '/' },
    { label: '02. Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
    { label: '03. Warehouse', ariaLabel: 'View warehouse map', link: '/warehouse' },
    { label: '04. Analytics', ariaLabel: 'View analytics and statistics', link: '/analytics' },
    { label: '05. Job Creation', ariaLabel: 'Create new jobs', link: '/job-creation' },
    { label: '06. WMS Management', ariaLabel: 'Warehouse management system', link: '/wms' },
    { label: '07. Settings', ariaLabel: 'System settings', link: '/settings' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'moving': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-yellow-600 bg-yellow-100';
      case 'charging': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-orange-600 bg-orange-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'manual': return 'text-purple-600 bg-purple-100';
      case 'locked': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-600';
    if (battery > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthColor = (health: number) => {
    if (health > 80) return 'text-green-600';
    if (health > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderFleetOverview = () => (
    <div className="space-y-6">
      {/* Fleet Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{mockAGVFleet.length}</span>
          </div>
          <p className="text-sm text-gray-600">Total Fleet</p>
          <div className="mt-2 text-xs text-gray-500">
            {mockAGVFleet.filter(agv => agv.status === 'moving' || agv.status === 'idle').length} Active
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">
              {mockAGVFleet.filter(agv => agv.status === 'moving').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">In Operation</p>
          <div className="mt-2 text-xs text-gray-500">
            {Math.round((mockAGVFleet.filter(agv => agv.status === 'moving').length / mockAGVFleet.length) * 100)}% Utilization
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Battery className="w-8 h-8 text-amber-600" />
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(mockAGVFleet.reduce((acc, agv) => acc + agv.battery, 0) / mockAGVFleet.length)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Avg Battery</p>
          <div className="mt-2 text-xs text-gray-500">
            {mockAGVFleet.filter(agv => agv.battery < 30).length} Low Battery
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">
              {mockAGVFleet.filter(agv => agv.status === 'error').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Need Attention</p>
          <div className="mt-2 text-xs text-red-500">
            {mockAGVFleet.filter(agv => agv.isObstacleDetected).length} Obstacles Detected
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Fleet Status</h3>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Play className="w-4 h-4" />
                <span>Start All</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Pause className="w-4 h-4" />
                <span>Pause All</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">AGV ID</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Battery</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Position</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Current Task</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockAGVFleet.map((agv) => (
                <tr 
                  key={agv.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAGV(agv)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="text-sm font-bold text-gray-900">{agv.id}</div>
                      {agv.isObstacleDetected && (
                        <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{agv.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 capitalize">{agv.type.replace('_', ' ')}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(agv.status)}`}>
                      {agv.status.charAt(0).toUpperCase() + agv.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Battery className="w-4 h-4 mr-2 text-gray-400" />
                      <span className={`text-sm font-medium ${getBatteryColor(agv.battery)}`}>{agv.battery}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      ({agv.position.x.toFixed(1)}, {agv.position.y.toFixed(1)})
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      {agv.currentJob ? `${agv.currentJob.itemName} (${agv.currentJob.quantity})` : 'None'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAGV(agv);
                          setActiveView('individual');
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIndividualAGV = () => {
    if (!selectedAGV) return null;

    return (
      <div className="space-y-6">
        {/* AGV Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedAGV.name}</h2>
                <p className="text-sm text-gray-600">{selectedAGV.id} • {selectedAGV.type.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedAGV.status)}`}>
                {selectedAGV.status.charAt(0).toUpperCase() + selectedAGV.status.slice(1)}
              </span>
              <button 
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                <span>Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Battery className="w-5 h-5 text-gray-600" />
                <span className={`text-lg font-bold ${getBatteryColor(selectedAGV.battery)}`}>{selectedAGV.battery}%</span>
              </div>
              <p className="text-xs text-gray-600">Battery Level</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    selectedAGV.battery > 60 ? 'bg-green-500' :
                    selectedAGV.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedAGV.battery}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Gauge className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-900">{selectedAGV.speed} m/s</span>
              </div>
              <p className="text-xs text-gray-600">Current Speed</p>
              <p className="text-xs text-gray-500 mt-1">Heading: {selectedAGV.heading}°</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-900">{selectedAGV.loadWeight} kg</span>
              </div>
              <p className="text-xs text-gray-600">Load Weight</p>
              <p className="text-xs text-gray-500 mt-1">Capacity: 50 kg</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="w-5 h-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-900">{selectedAGV.temperature}°C</span>
              </div>
              <p className="text-xs text-gray-600">Temperature</p>
              <p className="text-xs text-gray-500 mt-1">Normal: 35-45°C</p>
            </div>
          </div>
        </div>

        {/* Position & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Position & Navigation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Current Position</span>
                <span className="text-sm font-medium text-gray-900">
                  ({selectedAGV.position.x.toFixed(1)}, {selectedAGV.position.y.toFixed(1)}, {selectedAGV.position.z.toFixed(1)})
                </span>
              </div>
              {selectedAGV.nextWaypoint && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Next Waypoint</span>
                  <span className="text-sm font-medium text-gray-900">
                    ({selectedAGV.nextWaypoint.x.toFixed(1)}, {selectedAGV.nextWaypoint.y.toFixed(1)})
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Distance Traveled</span>
                <span className="text-sm font-medium text-gray-900">{selectedAGV.distanceTraveled.toFixed(1)} m</span>
              </div>
              {selectedAGV.estimatedCompletionTime && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">ETA Completion</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedAGV.estimatedCompletionTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Control Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <BatteryCharging className="w-4 h-4" />
                <span>Send to Charge</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <StopCircle className="w-4 h-4" />
                <span>Emergency Stop</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Move className="w-4 h-4" />
                <span>Manual Nav</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Target className="w-4 h-4" />
                <span>Assign Job</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Job */}
        {selectedAGV.currentJob && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Job</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-600">Job ID</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAGV.currentJob.id}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Item</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAGV.currentJob.itemName}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Quantity</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAGV.currentJob.quantity}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Priority</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedAGV.currentJob.priority === 'high' ? 'text-red-600 bg-red-100' :
                    selectedAGV.currentJob.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {selectedAGV.currentJob.priority}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Route Progress</span>
                  <span className="font-medium text-gray-900">
                    {selectedAGV.path ? `${selectedAGV.path.length - 1} waypoints remaining` : 'Direct route'}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance & Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Maintenance & Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Battery className="w-5 h-5 text-gray-600" />
                <span className={`text-sm font-bold ${getHealthColor(selectedAGV.batteryHealth)}`}>
                  {selectedAGV.batteryHealth}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Battery Health</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <span className={`text-sm font-bold ${getHealthColor(selectedAGV.motorHealth)}`}>
                  {selectedAGV.motorHealth}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Motor Health</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-bold text-gray-900">{selectedAGV.totalRunHours}h</span>
              </div>
              <p className="text-xs text-gray-600">Total Run Hours</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Firmware Version</span>
              <span className="font-medium text-gray-900">{selectedAGV.firmwareVersion}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Service</span>
              <span className="font-medium text-gray-900">{selectedAGV.lastServiceDate.toLocaleDateString()}</span>
            </div>
            {selectedAGV.maintenanceNotes && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-600">Maintenance Notes</span>
                <span className="font-medium text-gray-900 text-right max-w-xs">{selectedAGV.maintenanceNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">System Diagnostics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">LIDAR System</span>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Motor Torque</span>
                  <span className="text-sm font-medium text-green-600">Normal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Wheel Alignment</span>
                  <span className="text-sm font-medium text-yellow-600">Slight Drift</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Battery Performance</span>
                  <span className="text-sm font-medium text-green-600">Good</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Sensor Response</span>
                  <span className="text-sm font-medium text-green-600">Optimal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Communication</span>
                  <span className="text-sm font-medium text-green-600">Strong Signal</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Run Full Diagnostic</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFleetMap = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Fleet Map View</h3>
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl h-96 flex items-center justify-center relative overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1) 76%, transparent 77%, transparent)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Interactive Fleet Map</h3>
          <p className="text-sm text-gray-600">Real-time AGV positions and routes</p>
          
          {/* AGV Position Indicators */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto">
            {mockAGVFleet.slice(0, 6).map((agv) => (
              <div 
                key={agv.id}
                className="bg-white/90 backdrop-blur rounded-xl p-3 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedAGV(agv);
                  setActiveView('individual');
                }}
              >
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 animate-pulse ${
                  agv.status === 'moving' ? 'bg-emerald-500' :
                  agv.status === 'error' ? 'bg-red-500' :
                  agv.status === 'charging' ? 'bg-blue-500' :
                  agv.status === 'idle' ? 'bg-amber-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="text-xs font-bold text-gray-900">{agv.id}</div>
                <div className="text-xs text-gray-500">{agv.battery}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TopMenu menuItems={menuItems} socialItems={socialItems}>
      <div style={{ height: '100vh', background: '#f8fafc' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  AGV Fleet Management
                </h1>
                <p className="text-xs text-gray-500">Real-time fleet monitoring & control</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">Live</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'fleet', label: 'Fleet Overview', icon: <Truck className="w-4 h-4" /> },
              { id: 'individual', label: 'Individual AGV', icon: <Eye className="w-4 h-4" /> },
              { id: 'map', label: 'Fleet Map', icon: <MapPin className="w-4 h-4" /> }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeView === view.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {view.icon}
                <span className="font-medium">{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Content */}
        {activeView === 'fleet' && renderFleetOverview()}
        {activeView === 'individual' && renderIndividualAGV()}
        {activeView === 'map' && renderFleetMap()}
      </main>
    </div>
    </div>
    </TopMenu>
  );
};
