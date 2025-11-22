import { useState, useEffect } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import { 
  Wifi, WifiOff, Bell, Settings, User, Activity, AlertTriangle, 
  Battery, Package, TrendingUp, CheckCircle, Truck, Clock,
  MapPin, Zap, AlertCircle, Navigation, Sparkles, Cpu, Radio,
  ChevronRight
} from 'lucide-react';
import SplitText from '@/components/common/SplitText';
import { TopMenu } from '@/components/layout/TopMenu';

export const Dashboard = () => {
  const [isConnected] = useState(true);
  const [selectedAGV, setSelectedAGV] = useState<string | null>(null);
  
  // Use live store data instead of mock data
  const agvs = useWarehouseStore(state => state.agvs);
  const jobs = useWarehouseStore(state => state.jobs);
  const dashboardMetrics = useWarehouseStore(state => state.dashboardMetrics);
  const isSimulationPlaying = useWarehouseStore(state => state.isSimulationPlaying);
  const setSimulationPlaying = useWarehouseStore(state => state.setSimulationPlaying);
  const assignJobToAGV = useWarehouseStore(state => state.assignJobToAGV);

  const menuItems = [
    { label: '01. Home', ariaLabel: 'Go to home', link: '/' },
    { label: '02. Warehouse', ariaLabel: 'View warehouse map', link: '/warehouse' },
    { label: '03. Analytics', ariaLabel: 'View analytics and statistics', link: '/analytics' },
    { label: '04. Fleet Management', ariaLabel: 'Manage AGV fleet', link: '/agv-fleet' },
    { label: '05. Job Creation', ariaLabel: 'Create new jobs', link: '/job-creation' },
    { label: '06. WMS Management', ariaLabel: 'Warehouse management system', link: '/wms' },
    { label: '07. Settings', ariaLabel: 'System settings', link: '/settings' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];
  
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'critical', message: 'AGV-3 Battery low (18%)', time: '10:25' },
    { id: 2, type: 'warning', message: 'AGV-5 Stuck at intersection', time: '10:23' },
    { id: 3, type: 'normal', message: 'AGV-2 completed Job #57', time: '10:24' }
  ]);
  const [activityLog, setActivityLog] = useState([
    { id: 1, time: '10:26', message: 'AGV-4 arrived at Station B', type: 'info' },
    { id: 2, time: '10:25', message: 'AGV-1 Battery low (18%)', type: 'warning' },
    { id: 3, time: '10:24', message: 'AGV-3 completed Job #57', type: 'success' },
    { id: 4, time: '10:23', message: 'AGV-2 started Task #62', type: 'info' }
  ]);

  // Live summary cards based on store data
  const summaryCards = [
    { 
      title: 'Total AGVs Online', 
      value: agvs.filter(agv => agv.status !== 'error').length.toString(), 
      icon: <Truck className="w-6 h-6" />, 
      color: 'from-blue-500 to-blue-600', 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-600' 
    },
    { 
      title: 'Active Tasks', 
      value: jobs.filter(job => job.status === 'in-progress').length.toString(), 
      icon: <Package className="w-6 h-6" />, 
      color: 'from-emerald-500 to-emerald-600', 
      bgColor: 'bg-emerald-50', 
      textColor: 'text-emerald-600' 
    },
    { 
      title: 'Completed Today', 
      value: dashboardMetrics.jobsCompleted.toString(), 
      icon: <CheckCircle className="w-6 h-6" />, 
      color: 'from-purple-500 to-purple-600', 
      bgColor: 'bg-purple-50', 
      textColor: 'text-purple-600' 
    },
    { 
      title: 'AGVs in Error', 
      value: agvs.filter(agv => agv.status === 'error').length.toString(), 
      icon: <AlertTriangle className="w-6 h-6" />, 
      color: 'from-red-500 to-red-600', 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-600' 
    },
    { 
      title: 'Avg Battery', 
      value: `${Math.round(agvs.reduce((acc, agv) => acc + agv.battery, 0) / agvs.length)}%`, 
      icon: <Battery className="w-6 h-6" />, 
      color: 'from-amber-500 to-amber-600', 
      bgColor: 'bg-amber-50', 
      textColor: 'text-amber-600' 
    },
    { title: 'Traffic Status', value: 'Normal', icon: <Activity className="w-6 h-6" />, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' }
  ];

  // Live AGV fleet data from store
  const agvFleet = agvs.map(agv => ({
    id: agv.id,
    status: agv.status === 'idle' ? 'idle' : agv.status === 'moving' ? 'active' : agv.status === 'charging' ? 'charging' : 'error',
    battery: agv.battery,
    task: agv.currentJob ? agv.currentJob.itemName : 'None',
    speed: agv.status === 'moving' ? `${agv.speed} m/s` : '0 m/s',
    lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  // Interactive controls
  const handleSimulationToggle = () => {
    console.log('Simulation toggle clicked, current state:', isSimulationPlaying);
    setSimulationPlaying(!isSimulationPlaying);
    console.log('New state set to:', !isSimulationPlaying);
  };

  const handleAssignJob = (agvId: string) => {
    console.log('Assign job clicked for AGV:', agvId);
    // Create a sample job and assign it
    const sampleJob = {
      itemName: 'Sample Task',
      quantity: 1,
      priority: 'medium' as const,
      assignedAgv: agvId,
      pickupLocation: { x: 5, y: 5, z: 0 },
      dropLocation: { x: 20, y: 20, z: 0 },
      estimatedTime: 300
    };
    
    // Add job to store and assign to AGV
    const jobId = `job-${Date.now()}`;
    useWarehouseStore.getState().addJob(sampleJob);
    assignJobToAGV(agvId, jobId);
    console.log('Job assigned:', jobId, 'to AGV:', agvId);
  };

  const handleAGVClick = (agvId: string) => {
    setSelectedAGV(selectedAGV === agvId ? null : agvId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'idle': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'charging': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'warning': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'normal': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  return (
    <TopMenu menuItems={menuItems} socialItems={socialItems}>
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    AGV Mission Control
                  </h1>
                  <p className="text-xs text-gray-500">Real-time Fleet Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="text-xs font-medium text-green-700">{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 pl-3 pr-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Operator</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            
            {/* 1. Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {summaryCards.map((card, index) => (
                <div key={index} className={`group relative overflow-hidden rounded-2xl ${card.bgColor} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <div className="absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 bg-white rounded-xl shadow-sm ${card.textColor}`}>
                        {card.icon}
                      </div>
                      <Sparkles className={`w-4 h-4 ${card.textColor} opacity-50`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 2. Real-Time Warehouse Map & 3. AGV Fleet Table */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Warehouse Map */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Live Warehouse Map</h2>
                        <p className="text-sm text-gray-500">Real-time AGV tracking</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      <span className="text-xs font-medium text-emerald-700">LIVE</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl h-96 overflow-hidden relative">
                      {/* 3D Grid Effect */}
                      <div className="absolute inset-0" style={{
                        backgroundImage: `
                          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                        transform: 'perspective(500px) rotateX(45deg)'
                      }}></div>
                      
                      {/* AGV Indicators */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-8">
                          {agvs.slice(0, 6).map((agv, index) => (
                            <div key={agv.id} className="relative">
                              <div className={`w-16 h-16 rounded-lg flex items-center justify-center transform transition-all duration-500 hover:scale-110 ${
                                agv.status === 'moving' ? 'bg-green-500/20 border-2 border-green-400 animate-pulse' :
                                agv.status === 'idle' ? 'bg-yellow-500/20 border-2 border-yellow-400' :
                                agv.status === 'charging' ? 'bg-blue-500/20 border-2 border-blue-400' :
                                'bg-gray-500/20 border-2 border-gray-400'
                              }`}>
                                <Truck className={`w-8 h-8 ${
                                  agv.status === 'moving' ? 'text-green-400' :
                                  agv.status === 'idle' ? 'text-yellow-400' :
                                  agv.status === 'charging' ? 'text-blue-400' :
                                  'text-gray-400'
                                }`} />
                              </div>
                              <div className="text-center mt-2">
                                <div className="text-xs font-bold text-white">{agv.id}</div>
                                <div className="text-xs text-gray-400">{agv.battery}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 3D Warehouse Floor Effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800/50 to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* AGV Fleet Status Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">AGV Fleet Status</h2>
                        <p className="text-sm text-gray-500">Real-time fleet monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Auto-refresh</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSimulationToggle}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            isSimulationPlaying 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isSimulationPlaying ? 'Pause Simulation' : 'Start Simulation'}
                        </button>
                        <button
                          onClick={() => {
                            console.log('Test button clicked!');
                            alert('Button clicked successfully!');
                          }}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          Test Click
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">AGV ID</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Battery</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Current Task</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Speed</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Last Update</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/50">
                        {agvFleet.map((agv) => (
                          <tr 
                            key={agv.id} 
                            className={`hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer ${
                              selectedAGV === agv.id ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => handleAGVClick(agv.id)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="text-sm font-bold text-gray-900">{agv.id}</div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(agv.status)}`}>
                                {agv.status.charAt(0).toUpperCase() + agv.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <Battery className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-900 font-medium">{agv.battery}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">{agv.task}</td>
                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">{agv.speed}</td>
                            <td className="py-4 px-6 text-sm text-gray-500">{agv.lastUpdate}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignJob(agv.id);
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                  Assign Job
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle view details
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                >
                                  Details
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

              {/* Right Sidebar - Alerts & Analytics */}
              <div className="space-y-8">
                
                {/* 4. Alerts & Notifications */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Alerts & Notifications</h2>
                        <p className="text-sm text-gray-500">Critical system events</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-red-700">3</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${getAlertColor(alert.type)} hover:shadow-md transition-all duration-200`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {alert.type === 'critical' && <AlertCircle className="w-4 h-4" />}
                              <p className="text-sm font-semibold">{alert.message}</p>
                            </div>
                            <p className="text-xs opacity-75">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Analytics Snapshot */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Analytics Snapshot</h2>
                        <p className="text-sm text-gray-500">Performance metrics</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Jobs Completed Today</span>
                        <span className="text-sm font-bold text-blue-600">89</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700" style={{width: '75%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">75% of daily target</p>
                    </div>
                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">AGV Utilization</span>
                        <span className="text-sm font-bold text-emerald-600">67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 group-hover:from-emerald-600 group-hover:to-emerald-700" style={{width: '67%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Above optimal range</p>
                    </div>
                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Battery Distribution</span>
                        <span className="text-sm font-bold text-amber-600">Good</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 group-hover:from-amber-600 group-hover:to-amber-700" style={{width: '45%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Average health maintained</p>
                    </div>
                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Avg Task Duration</span>
                        <span className="text-sm font-bold text-purple-600">4.2 min</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 group-hover:from-purple-600 group-hover:to-purple-700" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Within acceptable range</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Live Activity Log */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Live Activity Log</h2>
                    <p className="text-sm text-gray-500">Real-time system events</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">LIVE</span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {activityLog.map((log) => (
                    <div key={log.id} className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/50 transition-all duration-200 cursor-pointer">
                      <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{log.time}</span>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.type === 'success' ? 'bg-emerald-500' :
                        log.type === 'warning' ? 'bg-amber-500' :
                        log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{log.message}</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
    </TopMenu>
  );
};
