import { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit2, Trash2, Search, Filter, Download, AlertTriangle,
  MapPin, Clock, TrendingUp, Box, ArrowRight, ChevronRight, Eye,
  Settings, RefreshCw, DownloadCloud, FileText, Database, Menu
} from 'lucide-react';
import { InventoryItem, Rack, Shelf, WarehouseSlot, WMSJob, WMSAlert, WMSCreateJobRequest } from '@/types';
import { realisticInventoryData, realisticRacks } from '@/data/wmsData';
import SplitText from '@/components/common/SplitText';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const WMSManagement = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'inventory' | 'jobs' | 'alerts'>('explorer');
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Use realistic data
  const mockRacks = realisticRacks;
  const mockInventory = realisticInventoryData;

  const mockJobs: WMSJob[] = [
    {
      id: 'job-001',
      type: 'pick',
      itemId: 'ip17pm-50',
      itemName: 'iPhone 17 Pro Max',
      skuCode: 'IP17PM-50',
      quantity: 5,
      priority: 'high',
      status: 'assigned',
      assignedAgv: 'AGV-01',
      sourceLocation: realisticInventoryData[2].location,
      targetLocation: realisticInventoryData[2].location,
      pickupLocation: { x: 10, y: 1, z: 0 },
      dropLocation: { x: 0, y: 0, z: 0 },
      estimatedTime: 5,
      createdBy: 'Operator',
      createdAt: new Date('2025-11-22T10:30:00'),
      assignedAt: new Date('2025-11-22T10:32:00')
    },
    {
      id: 'job-002',
      type: 'restock',
      itemId: 'rtx4090-8',
      itemName: 'RTX 4090 GPU',
      skuCode: 'RTX4090-8',
      quantity: 2,
      priority: 'medium',
      status: 'pending',
      sourceLocation: realisticInventoryData[14].location,
      targetLocation: realisticInventoryData[14].location,
      pickupLocation: { x: 0, y: 0, z: 0 },
      dropLocation: { x: 30, y: 1, z: 0 },
      estimatedTime: 8,
      createdBy: 'System',
      createdAt: new Date('2025-11-22T09:15:00')
    }
  ];

  const mockAlerts: WMSAlert[] = [
    {
      id: 'alert-1',
      type: 'low_stock',
      severity: 'warning',
      title: 'Low Stock Alert',
      message: 'iPhone 16 Pro Max (IP16PM-10) is below minimum stock level',
      itemId: 'ip16pm-10',
      timestamp: new Date('2025-11-22T10:00:00'),
      acknowledged: false
    },
    {
      id: 'alert-2',
      type: 'low_stock',
      severity: 'critical',
      title: 'Critical Stock Alert',
      message: 'RTX 4090 GPU (RTX4090-8) requires immediate restocking',
      itemId: 'rtx4090-8',
      timestamp: new Date('2025-11-22T09:30:00'),
      acknowledged: false
    },
    {
      id: 'alert-3',
      type: 'overloaded',
      severity: 'warning',
      title: 'Rack Utilization Warning',
      message: 'Rack A is at 85% capacity - consider redistributing inventory',
      rackId: 'rack-a',
      timestamp: new Date('2025-11-22T08:45:00'),
      acknowledged: true,
      acknowledgedBy: 'Operator',
      acknowledgedAt: new Date('2025-11-22T09:00:00')
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'assigned': return 'text-purple-600 bg-purple-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'warning': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const renderRackExplorer = () => (
    <div className="space-y-6">
      {/* Rack Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockRacks.map((rack) => (
          <div
            key={rack.id}
            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRack?.id === rack.id 
                ? 'border-blue-500 bg-blue-50' 
                : rack.isAccessible 
                  ? 'border-gray-200 hover:border-blue-300' 
                  : 'border-red-200 bg-red-50 opacity-75'
            }`}
            onClick={() => setSelectedRack(rack)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{rack.name}</h3>
              <div className={`w-3 h-3 rounded-full ${
                rack.isAccessible ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{rack.currentUtilization}/{rack.totalCapacity}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    rack.currentUtilization / rack.totalCapacity > 0.8 
                      ? 'bg-red-500' 
                      : rack.currentUtilization / rack.totalCapacity > 0.6 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${(rack.currentUtilization / rack.totalCapacity) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${rack.isAccessible ? 'text-green-600' : 'text-red-600'}`}>
                  {rack.isAccessible ? 'Accessible' : 'Blocked'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Rack Details */}
      {selectedRack && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedRack.name} - Shelf Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map((shelfName) => (
              <div key={shelfName} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Shelf {shelfName}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((slot) => (
                    <div
                      key={slot}
                      className="aspect-square border border-gray-300 rounded flex items-center justify-center text-xs bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {Math.random() > 0.5 ? (
                        <Package className="w-4 h-4 text-blue-600" />
                      ) : (
                        <span className="text-gray-400">Empty</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInventoryTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Inventory Management</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">SKU Code</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Item Name</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Unit Type</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockInventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-gray-900">{item.skuCode}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-900">{item.name}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600">{item.category}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600">
                    {item.location.rack} → {item.location.shelf} → {item.location.slot}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-sm font-medium ${
                    item.quantity <= item.minStockLevel 
                      ? 'text-red-600' 
                      : item.quantity >= item.maxStockLevel 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                  }`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600 capitalize">{item.unitType.replace('_', ' ')}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.handlingPriority)}`}>
                    {item.handlingPriority.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowJobModal(true)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderJobsList = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Active Jobs</h3>
          <button
            onClick={() => setShowJobModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job</span>
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {mockJobs.map((job) => (
          <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h4 className="font-medium text-gray-900">Job #{job.id}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium capitalize">{job.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Item:</span>
                    <span className="ml-2 font-medium">{job.itemName} ({job.quantity})</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Assigned AGV:</span>
                    <span className="ml-2 font-medium">{job.assignedAgv || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span>From: {job.sourceLocation.rack}{job.sourceLocation.shelf}{job.sourceLocation.slot}</span>
                  <ArrowRight className="inline w-3 h-3 mx-2" />
                  <span>To: {job.targetLocation.rack}{job.targetLocation.shelf}{job.targetLocation.slot}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {mockAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 p-4 rounded-lg ${getSeverityColor(alert.severity)} ${
            !alert.acknowledged ? 'shadow-md' : 'opacity-75'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-semibold">{alert.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'warning' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm opacity-90">{alert.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {alert.timestamp.toLocaleString()}
                {alert.acknowledged && ` • Acknowledged by ${alert.acknowledgedBy}`}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {!alert.acknowledged && (
                <button className="px-3 py-1 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  Acknowledge
                </button>
              )}
              <button className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <SidebarTrigger className="p-3 bg-gray-900 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700" />
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Warehouse Management System
                </h1>
                <p className="text-xs text-gray-500">Inventory & Rack Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-700">System Online</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <DownloadCloud className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Export</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{mockInventory.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Box className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{mockRacks.length}</span>
            </div>
            <p className="text-sm text-gray-600">Active Racks</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{mockJobs.filter(j => j.status === 'pending').length}</span>
            </div>
            <p className="text-sm text-gray-600">Pending Jobs</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">{mockAlerts.filter(a => !a.acknowledged).length}</span>
            </div>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'explorer', label: 'Rack Explorer', icon: <MapPin className="w-4 h-4" /> },
              { id: 'inventory', label: 'Inventory Table', icon: <Database className="w-4 h-4" /> },
              { id: 'jobs', label: 'Job Management', icon: <Clock className="w-4 h-4" /> },
              { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'explorer' && renderRackExplorer()}
          {activeTab === 'inventory' && renderInventoryTable()}
          {activeTab === 'jobs' && renderJobsList()}
          {activeTab === 'alerts' && renderAlerts()}
        </div>
      </div>
      </main>
    </div>
  );
};
