import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Clock, User, AlertTriangle, Plus, Trash2, Save,
  ArrowLeft, CheckCircle, Info, Calendar, TrendingUp, BarChart3,
  Upload, ArrowRight, RefreshCw, HelpCircle, Search, Minus, Target,
  Eye, X, ChevronRight, Navigation, Zap, Shield, Truck, Battery,
  Activity, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import SplitText from '@/components/common/SplitText';
import { AGV, Position } from '@/types/agv';
import { InventoryItem, WMSJob } from '@/types';
import { realisticAGVFleet } from '@/data/agvData';
import { realisticInventoryData } from '@/data/wmsData';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface JobFormData {
  jobType: 'pick' | 'restock' | 'move' | 'return';
  skuCode: string;
  quantity: number;
  pickupLocation: {
    rack: string;
    shelf: string;
  };
  dropLocation: {
    type: 'packing_area' | 'qc_desk' | 'conveyor' | 'rack';
    rack?: string;
    shelf?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgv?: string;
  notes?: string;
}

export const JobCreation: React.FC = () => {
  const [formData, setFormData] = useState<JobFormData>({
    jobType: 'pick',
    skuCode: '',
    quantity: 1,
    pickupLocation: { rack: '', shelf: '' },
    dropLocation: { type: 'packing_area' },
    priority: 'medium'
  });

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [availableAGVs, setAvailableAGVs] = useState<AGV[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdJobs, setCreatedJobs] = useState<WMSJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get available AGVs (idle and moving)
  useEffect(() => {
    const available = realisticAGVFleet.filter(agv => 
      agv.status === 'idle' || agv.status === 'moving'
    );
    setAvailableAGVs(available);
  }, []);

  // Filter inventory based on search
  const filteredInventory = realisticInventoryData.filter(item =>
    item.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get racks and shelves from inventory
  const racks = Array.from(new Set(realisticInventoryData.map(item => item.location.rack)));
  const getShelvesForRack = (rack: string) => {
    return Array.from(new Set(
      realisticInventoryData
        .filter(item => item.location.rack === rack)
        .map(item => item.location.shelf)
    ));
  };

  const handleSKUSelect = (skuCode: string) => {
    const item = realisticInventoryData.find(inv => inv.skuCode === skuCode);
    setSelectedItem(item || null);
    setFormData(prev => ({
      ...prev,
      skuCode,
      pickupLocation: item ? {
        rack: item.location.rack,
        shelf: item.location.shelf
      } : prev.pickupLocation
    }));
  };

  const handleJobTypeChange = (jobType: JobFormData['jobType']) => {
    setFormData(prev => ({
      ...prev,
      jobType,
      dropLocation: jobType === 'move' ? { type: 'rack', rack: '', shelf: '' } : { type: 'packing_area' }
    }));
  };

  const validateForm = (): boolean => {
    return !!(
      formData.jobType &&
      formData.skuCode &&
      formData.quantity > 0 &&
      formData.pickupLocation.rack &&
      formData.pickupLocation.shelf &&
      (formData.dropLocation.type !== 'rack' || (formData.dropLocation.rack && formData.dropLocation.shelf))
    );
  };

  const calculateEstimatedTime = (): number => {
    if (!selectedItem) return 0;
    
    // Base time calculation (in minutes)
    let baseTime = 5; // Base pickup time
    
    // Add travel time based on distance
    if (formData.dropLocation.type === 'rack' && formData.dropLocation.rack) {
      const pickupRack = formData.pickupLocation.rack.charCodeAt(0);
      const dropRack = formData.dropLocation.rack.charCodeAt(0);
      const distance = Math.abs(pickupRack - dropRack);
      baseTime += distance * 2; // 2 minutes per rack distance
    } else {
      baseTime += 8; // Fixed time for non-rack destinations
    }
    
    // Add quantity-based time
    baseTime += Math.ceil(formData.quantity / 10) * 2;
    
    return baseTime;
  };

  const generateOptimizedPath = (): Position[] => {
    const path: Position[] = [];
    
    // Start position (AGV current location or home)
    path.push({ x: 0, y: 0, z: 0 });
    
    // Pickup location
    const rackX = 10 + (formData.pickupLocation.rack.charCodeAt(0) - 65) * 10;
    const shelfY = parseInt(formData.pickupLocation.shelf.replace(/[^\d]/g, ''));
    path.push({ x: rackX, y: shelfY, z: 0 });
    
    // Drop location
    if (formData.dropLocation.type === 'rack' && formData.dropLocation.rack) {
      const dropRackX = 10 + (formData.dropLocation.rack.charCodeAt(0) - 65) * 10;
      const dropShelfY = parseInt(formData.dropLocation.shelf?.replace(/[^\d]/g, '') || '1');
      path.push({ x: dropRackX, y: dropShelfY, z: 0 });
    } else {
      // Fixed destination coordinates
      const destinations = {
        packing_area: { x: 0, y: 0, z: 0 },
        qc_desk: { x: 5, y: 0, z: 0 },
        conveyor: { x: 50, y: 25, z: 0 }
      };
      path.push(destinations[formData.dropLocation.type]);
    }
    
    return path;
  };

  const createJob = async () => {
    if (!validateForm() || !selectedItem) return;
    
    setIsCreating(true);
    
    // Simulate job creation API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newJob: WMSJob = {
      id: `JOB-${Date.now()}`,
      type: formData.jobType,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      skuCode: formData.skuCode,
      quantity: formData.quantity,
      priority: formData.priority,
      status: 'pending',
      assignedAgv: formData.assignedAgv,
      sourceLocation: selectedItem.location,
      targetLocation: selectedItem.location,
      pickupLocation: { 
        x: 10 + (formData.pickupLocation.rack.charCodeAt(0) - 65) * 10, 
        y: parseInt(formData.pickupLocation.shelf.replace(/[^\d]/g, '')), 
        z: 0 
      },
      dropLocation: formData.dropLocation.type === 'rack' && formData.dropLocation.rack ? 
        { x: 10 + (formData.dropLocation.rack.charCodeAt(0) - 65) * 10, 
          y: parseInt(formData.dropLocation.shelf?.replace(/[^\d]/g, '') || '1'), 
          z: 0 } :
        { x: 0, y: 0, z: 0 },
      estimatedTime: calculateEstimatedTime(),
      createdBy: 'Operator',
      createdAt: new Date()
    };
    
    setCreatedJobs(prev => [newJob, ...prev]);
    setIsCreating(false);
    
    // Reset form
    setFormData({
      jobType: 'pick',
      skuCode: '',
      quantity: 1,
      pickupLocation: { rack: '', shelf: '' },
      dropLocation: { type: 'packing_area' },
      priority: 'medium'
    });
    setSelectedItem(null);
    setShowPreview(false);
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'pick': return <Package className="w-5 h-5" />;
      case 'restock': return <Upload className="w-5 h-5" />;
      case 'move': return <ArrowRight className="w-5 h-5" />;
      case 'return': return <RefreshCw className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 text-red-800';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const optimizedPath = generateOptimizedPath();
  const estimatedTime = calculateEstimatedTime();

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <SidebarTrigger className="p-3 bg-gray-900 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700" />
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Job Creation
                </h1>
                <p className="text-xs text-gray-500">Mission planner for AGV operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Type Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Type</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'pick', label: 'Pick Item', description: 'Retrieve items from rack' },
                  { type: 'restock', label: 'Restock Item', description: 'Add items to rack' },
                  { type: 'move', label: 'Transfer', description: 'Move between racks' },
                  { type: 'return', label: 'Return Empty Bin', description: 'Return empty containers' }
                ].map(({ type, label, description }) => (
                  <button
                    key={type}
                    onClick={() => handleJobTypeChange(type as JobFormData['jobType'])}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.jobType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getJobTypeIcon(type)}
                      <div className="text-left">
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-gray-500">{description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SKU Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">SKU Selection</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by SKU, name, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={formData.skuCode}
                  onChange={(e) => handleSKUSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select SKU...</option>
                  {filteredInventory.map(item => (
                    <option key={item.id} value={item.skuCode}>
                      {item.skuCode} - {item.name} ({item.category})
                    </option>
                  ))}
                </select>
                
                {selectedItem && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">{selectedItem.name}</div>
                        <div className="text-sm text-blue-700">
                          SKU: {selectedItem.skuCode} | Stock: {selectedItem.quantity} units
                        </div>
                      </div>
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    quantity: Math.max(1, prev.quantity - 1) 
                  }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedItem?.quantity || 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: Math.max(1, parseInt(e.target.value) || 1) 
                  }))}
                  className="w-20 px-3 py-2 text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    quantity: Math.min(selectedItem?.quantity || 999, prev.quantity + 1) 
                  }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">
                  {selectedItem && `Available: ${selectedItem.quantity} units`}
                </span>
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Pickup Location
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.pickupLocation.rack}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupLocation: { ...prev.pickupLocation, rack: e.target.value, shelf: '' }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Rack...</option>
                      {racks.map((rack: string) => (
                        <option key={rack} value={rack}>Rack {rack}</option>
                      ))}
                    </select>
                    <select
                      value={formData.pickupLocation.shelf}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        pickupLocation: { ...prev.pickupLocation, shelf: e.target.value }
                      }))}
                      disabled={!formData.pickupLocation.rack}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Shelf...</option>
                      {getShelvesForRack(formData.pickupLocation.rack).map((shelf: string) => (
                        <option key={shelf} value={shelf}>{shelf}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="inline w-4 h-4 mr-1" />
                    Drop Location
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.dropLocation.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dropLocation: { 
                          type: e.target.value as any,
                          rack: '',
                          shelf: ''
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="packing_area">Packing Area</option>
                      <option value="qc_desk">QC Desk</option>
                      <option value="conveyor">Conveyor</option>
                      {formData.jobType === 'move' && (
                        <option value="rack">Another Rack</option>
                      )}
                    </select>
                    
                    {formData.dropLocation.type === 'rack' && (
                      <>
                        <select
                          value={formData.dropLocation.rack}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            dropLocation: { ...prev.dropLocation, rack: e.target.value, shelf: '' }
                          }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Rack...</option>
                          {racks.map((rack: string) => (
                            <option key={rack} value={rack}>Rack {rack}</option>
                          ))}
                        </select>
                        <select
                          value={formData.dropLocation.shelf}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            dropLocation: { ...prev.dropLocation, shelf: e.target.value }
                          }))}
                          disabled={!formData.dropLocation.rack}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select Shelf...</option>
                          {getShelvesForRack(formData.dropLocation.rack || '').map((shelf: string) => (
                            <option key={shelf} value={shelf}>{shelf}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Priority and AGV Assignment */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
                      <button
                        key={priority}
                        onClick={() => setFormData(prev => ({ ...prev, priority: priority as any }))}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.priority === priority
                            ? getPriorityColor(priority)
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AGV Assignment</label>
                  <select
                    value={formData.assignedAgv || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedAgv: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto-assign</option>
                    {availableAGVs.map((agv: AGV) => (
                      <option key={agv.id} value={agv.id}>
                        {agv.id} - {agv.status} ({agv.battery}% battery)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any special instructions..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!validateForm()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Eye className="inline w-4 h-4 mr-2" />
                Preview Job
              </button>
              <button
                onClick={createJob}
                disabled={!validateForm() || isCreating}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="inline w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="inline w-4 h-4 mr-2" />
                    Create Job
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Side Panel - Preview & AGV Status */}
          <div className="space-y-6">
            {/* AGV Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available AGVs</h2>
              <div className="space-y-3">
                {availableAGVs.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No AGVs available</p>
                  </div>
                ) : (
                  availableAGVs.map(agv => (
                    <div key={agv.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{agv.id}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          agv.status === 'idle' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {agv.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Battery className="w-3 h-3 text-gray-400" />
                          <span>{agv.battery}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-3 h-3 text-gray-400" />
                          <span>{agv.speed} m/s</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {createdJobs.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No jobs created yet</p>
                  </div>
                ) : (
                  createdJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{job.id}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {job.type} - {job.itemName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {job.quantity} units • {job.estimatedTime} min
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Job Preview</h3>
                    <p className="text-sm text-gray-500">Review job details before creation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Job Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Job Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{formData.jobType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{formData.skuCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span className="font-medium">{selectedItem?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{formData.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(formData.priority)}`}>
                        {formData.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Route Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup:</span>
                      <span className="font-medium">{formData.pickupLocation.rack} → {formData.pickupLocation.shelf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Drop:</span>
                      <span className="font-medium">
                        {formData.dropLocation.type === 'rack' 
                          ? `${formData.dropLocation.rack} → ${formData.dropLocation.shelf}`
                          : formData.dropLocation.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AGV:</span>
                      <span className="font-medium">{formData.assignedAgv || 'Auto-assign'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Time:</span>
                      <span className="font-medium">{estimatedTime} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Optimized Path */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Optimized Path</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {optimizedPath.map((point, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === 0 ? 'bg-green-100 text-green-800' :
                          index === optimizedPath.length - 1 ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index === 0 ? 'S' : index === optimizedPath.length - 1 ? 'E' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">
                            {index === 0 ? 'Start Position' :
                             index === optimizedPath.length - 1 ? 'Destination' :
                             `Waypoint ${index}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            Coordinates: ({point.x}, {point.y}, {point.z})
                          </div>
                        </div>
                        {index < optimizedPath.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* AGV Output Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">AGV Output</h4>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Optimized Path</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Safety Checks Enabled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span>Live Telemetry Sync</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Digital Twin Integration</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {formData.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{formData.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={createJob}
                disabled={isCreating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="inline w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="inline w-4 h-4 mr-2" />
                    Create Job
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
