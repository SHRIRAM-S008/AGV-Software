import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Zap, Battery, Wifi, WifiOff, AlertTriangle, 
  Settings, Info, Package, Truck, Target, Clock, Thermometer,
  Gauge, Cpu, HardDrive, Satellite, Radar, Map, Layers,
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  ChevronRight, TrendingUp, TrendingDown, BarChart3,
  RefreshCw, Download, Upload, Eye, EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TopMenu } from '@/components/layout/TopMenu';
import SplitText from '@/components/common/SplitText';

const AGVDigitalTwin = () => {
  const [selectedAGV, setSelectedAGV] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showRealTime, setShowRealTime] = useState(true);
  const [show3D, setShow3D] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const canvasRef = useRef(null);

  // Mock AGV data for digital twin
  const mockAGVFleet = [
    {
      id: 'AGV-001',
      name: 'Alpha Unit',
      status: 'active',
      battery: 85,
      position: { x: 120, y: 200, z: 0 },
      heading: 45,
      speed: 2.5,
      load: 45,
      temperature: 38,
      cpu: 42,
      memory: 67,
      network: 'strong',
      lastUpdate: new Date(),
      tasks: ['Pickup Zone A', 'Deliver Rack 3'],
      errors: []
    },
    {
      id: 'AGV-002', 
      name: 'Beta Unit',
      status: 'charging',
      battery: 92,
      position: { x: 340, y: 150, z: 0 },
      heading: 180,
      speed: 0,
      load: 0,
      temperature: 35,
      cpu: 15,
      memory: 34,
      network: 'strong',
      lastUpdate: new Date(),
      tasks: ['Charging'],
      errors: []
    },
    {
      id: 'AGV-003',
      name: 'Gamma Unit', 
      status: 'maintenance',
      battery: 67,
      position: { x: 200, y: 320, z: 0 },
      heading: 270,
      speed: 0,
      load: 0,
      temperature: 41,
      cpu: 78,
      memory: 89,
      network: 'weak',
      lastUpdate: new Date(),
      tasks: ['Maintenance Mode'],
      errors: ['Sensor calibration required']
    },
    {
      id: 'AGV-004',
      name: 'Delta Unit',
      status: 'active',
      battery: 43,
      position: { x: 450, y: 280, z: 0 },
      heading: 90,
      speed: 3.2,
      load: 78,
      temperature: 40,
      cpu: 56,
      memory: 71,
      network: 'strong',
      lastUpdate: new Date(),
      tasks: ['Pickup Zone B', 'Deliver Rack 7'],
      errors: []
    }
  ];

  const menuItems = [
    { label: 'Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
    { label: 'Warehouse', ariaLabel: 'View warehouse map', link: '/warehouse' },
    { label: 'Analytics', ariaLabel: 'View analytics and statistics', link: '/analytics' },
    { label: 'Digital Twin', ariaLabel: 'AGV Digital Twin', link: '/agv-digital-twin' },
    { label: 'Fleet Management', ariaLabel: 'Manage AGV fleet', link: '/agv-fleet' },
    { label: 'Job Creation', ariaLabel: 'Create new jobs', link: '/job-creation' },
    { label: 'WMS Management', ariaLabel: 'Warehouse management system', link: '/wms' },
    { label: 'Settings', ariaLabel: 'System settings', link: '/settings' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'charging': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 60) return 'text-green-600';
    if (battery > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNetworkIcon = (network) => {
    return network === 'strong' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  // CSS for digital twin visualization
  const digitalTwinStyles = `
    .digital-twin-container {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .digital-twin-grid {
      background-image: 
        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
    }

    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .agv-digital-twin {
      position: relative;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 16px;
      backdrop-filter: blur(20px);
      overflow: hidden;
    }

    .agv-hologram {
      position: relative;
      background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent);
      border: 2px solid rgba(59, 130, 246, 0.5);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .agv-hologram:hover {
      border-color: rgba(59, 130, 246, 0.8);
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
    }

    .agv-hologram.selected {
      border-color: rgba(34, 197, 94, 0.8);
      box-shadow: 0 0 40px rgba(34, 197, 94, 0.4);
    }

    .metric-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }

    .pulse-dot {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.1); }
    }

    .data-stream {
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
      animation: dataFlow 2s linear infinite;
    }

    @keyframes dataFlow {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .control-panel {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 16px;
      backdrop-filter: blur(20px);
    }

    .control-button {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
      transition: all 0.3s ease;
    }

    .control-button:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.5);
      color: #dbeafe;
      transform: scale(1.05);
    }

    .control-button.active {
      background: rgba(59, 130, 246, 0.3);
      border-color: rgba(59, 130, 246, 0.6);
      color: #ffffff;
    }
  `;

  return (
    <TopMenu menuItems={menuItems} socialItems={socialItems}>
      <div className="digital-twin-container">
        <style>{digitalTwinStyles}</style>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <Radar className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <SplitText
                tag="h1"
                className="text-3xl font-bold text-gray-900 mb-2"
                text="AGV Digital Twin"
              />
              <p className="text-gray-400">Real-time digital twin simulation and monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className={`${isConnected ? 'bg-green-500' : 'bg-red-500'} text-gray-900`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Badge className="bg-blue-500 text-gray-900">
              {mockAGVFleet.length} AGVs Online
            </Badge>
          </div>
        </div>

        {/* Control Panel */}
        <div className="control-panel p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className={`control-button px-4 py-2 rounded-lg flex items-center space-x-2 ${showRealTime ? 'active' : ''}`}
                onClick={() => setShowRealTime(!showRealTime)}
              >
                <Activity className="w-4 h-4" />
                <span>Real-time</span>
              </button>
              <button
                className={`control-button px-4 py-2 rounded-lg flex items-center space-x-2 ${show3D ? 'active' : ''}`}
                onClick={() => setShow3D(!show3D)}
              >
                <Layers className="w-4 h-4" />
                <span>3D View</span>
              </button>
              <button
                className={`control-button px-4 py-2 rounded-lg flex items-center space-x-2 ${showMetrics ? 'active' : ''}`}
                onClick={() => setShowMetrics(!showMetrics)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Metrics</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Simulation Speed:</span>
                <select 
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="bg-gray-800 text-gray-900 px-3 py-1 rounded border border-gray-700"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={5}>5x</option>
                </select>
              </div>
              <button className="control-button p-2 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Digital Twin Visualization */}
          <div className="lg:col-span-2">
            <div className="agv-digital-twin p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Digital Twin Environment</h2>
                <div className="flex items-center space-x-2">
                  <button className="control-button p-2 rounded">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button className="control-button p-2 rounded">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button className="control-button p-2 rounded">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="digital-twin-grid rounded-lg p-8 min-h-[400px] relative">
                {/* AGV Digital Twins */}
                {mockAGVFleet.map((agv) => (
                  <div
                    key={agv.id}
                    className={`agv-hologram absolute w-20 h-20 cursor-pointer ${selectedAGV?.id === agv.id ? 'selected' : ''}`}
                    style={{
                      left: `${agv.position.x}px`,
                      top: `${agv.position.y}px`,
                      transform: `translate(-50%, -50%) rotate(${agv.heading}deg)`
                    }}
                    onClick={() => setSelectedAGV(agv)}
                  >
                    <div className="text-center">
                      <Truck className="w-8 h-8 text-blue-400 mb-1" />
                      <div className="text-xs text-gray-900 font-medium">{agv.id}</div>
                      <div className={`text-xs ${getBatteryColor(agv.battery)}`}>{agv.battery}%</div>
                    </div>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(agv.status)} pulse-dot`}></div>
                  </div>
                ))}
                
                {/* Data Stream Visualization */}
                {showRealTime && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="data-stream h-1 top-1/2"></div>
                    <div className="data-stream h-1 top-1/3" style={{ animationDelay: '0.5s' }}></div>
                    <div className="data-stream h-1 top-2/3" style={{ animationDelay: '1s' }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AGV Details Panel */}
          <div className="space-y-6">
            {selectedAGV ? (
              <>
                {/* Selected AGV Info */}
                <div className="metric-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedAGV.name}</h3>
                    <Badge className={getStatusColor(selectedAGV.status)}>
                      {selectedAGV.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Position</span>
                      <span className="text-gray-900">({selectedAGV.position.x}, {selectedAGV.position.y}, {selectedAGV.position.z})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Heading</span>
                      <span className="text-gray-900">{selectedAGV.heading}°</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Speed</span>
                      <span className="text-gray-900">{selectedAGV.speed} m/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Load</span>
                      <span className="text-gray-900">{selectedAGV.load} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Network</span>
                      <div className="flex items-center space-x-1">
                        {getNetworkIcon(selectedAGV.network)}
                        <span className="text-gray-900">{selectedAGV.network}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Metrics */}
                {showMetrics && (
                  <div className="metric-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Battery</span>
                          <span className={`text-sm ${getBatteryColor(selectedAGV.battery)}`}>{selectedAGV.battery}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${selectedAGV.battery > 60 ? 'bg-green-500' : selectedAGV.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${selectedAGV.battery}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">CPU Usage</span>
                          <span className="text-sm text-blue-400">{selectedAGV.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${selectedAGV.cpu}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Memory</span>
                          <span className="text-sm text-purple-400">{selectedAGV.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${selectedAGV.memory}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Temperature</span>
                          <span className={`text-sm ${selectedAGV.temperature > 40 ? 'text-red-400' : 'text-green-400'}`}>{selectedAGV.temperature}°C</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${selectedAGV.temperature > 40 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(selectedAGV.temperature * 2, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Tasks */}
                <div className="metric-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Tasks</h3>
                  <div className="space-y-2">
                    {selectedAGV.tasks.map((task, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                  
                  {selectedAGV.errors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-red-400 mb-2">Errors</h4>
                      <div className="space-y-1">
                        {selectedAGV.errors.map((error, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span className="text-red-300 text-xs">{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="metric-card p-6 text-center">
                <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                  <Truck className="w-8 h-8 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an AGV</h3>
                <p className="text-gray-400 text-sm">Click on any AGV in the digital twin to view detailed information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </TopMenu>
  );
};

export default AGVDigitalTwin;
