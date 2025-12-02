import { useState, useEffect, useRef } from 'react';
import { 
  View, Box, Map, Navigation, Battery, Activity, AlertTriangle, 
  Layers, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  Settings, Info, Package, Truck, Zap, Target, Clock, ChevronRight,
  Wifi, WifiOff, RefreshCw, Eye, EyeOff, Thermometer, Gauge, Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { realisticAGVFleet, positionStreamData } from '@/data/agvData';
import { realisticRacks, realisticInventoryData } from '@/data/wmsData';
import { AGV, Position } from '@/types';
import { WarehouseScene } from '@/components/features/warehouse/WarehouseScene';
import SplitText from '@/components/common/SplitText';
import { useSimulation } from '@/hooks/useSimulation';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface MapElement {
  id: string;
  type: 'agv' | 'rack' | 'charging_station' | 'delivery_point' | 'warning_zone';
  position: Position;
  data?: any;
}

const Warehouse = () => {
  // Enable simulation
  useSimulation();
  
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'replay'>('3d');
  const [show3DModel, setShow3DModel] = useState(true);
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPath, setShowPath] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isConnected, setIsConnected] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  
  // Generate map elements
  const mapElements: MapElement[] = [
    // AGVs
    ...realisticAGVFleet.map(agv => ({
      id: agv.id,
      type: 'agv' as const,
      position: agv.position,
      data: agv
    })),
    
    // Racks
    ...realisticRacks.map(rack => ({
      id: rack.id,
      type: 'rack' as const,
      position: rack.position,
      data: rack
    })),
    
    // Charging stations
    {
      id: 'charging-station-1',
      type: 'charging_station' as const,
      position: { x: 0, y: 0, z: 0 },
      data: { capacity: 2, currentOccupancy: 1 }
    },
    {
      id: 'charging-station-2',
      type: 'charging_station' as const,
      position: { x: 50, y: 0, z: 0 },
      data: { capacity: 2, currentOccupancy: 0 }
    },
    
    // Delivery points
    {
      id: 'delivery-point-1',
      type: 'delivery_point' as const,
      position: { x: 0, y: 25, z: 0 },
      data: { type: 'packing_area' }
    },
    {
      id: 'delivery-point-2',
      type: 'delivery_point' as const,
      position: { x: 25, y: 25, z: 0 },
      data: { type: 'qc_desk' }
    },
    {
      id: 'delivery-point-3',
      type: 'delivery_point' as const,
      position: { x: 50, y: 25, z: 0 },
      data: { type: 'conveyor' }
    },
    
    // Warning zones
    {
      id: 'warning-zone-1',
      type: 'warning_zone' as const,
      position: { x: 25, y: 12.5, z: 0 },
      data: { radius: 5, type: 'high_traffic' }
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update AGV positions
      realisticAGVFleet.forEach(agv => {
        if (agv.status === 'moving' && Math.random() > 0.7) {
          // Small random movement
          agv.position.x += (Math.random() - 0.5) * 0.5;
          agv.position.y += (Math.random() - 0.5) * 0.5;
          
          // Keep within bounds
          agv.position.x = Math.max(0, Math.min(50, agv.position.x));
          agv.position.y = Math.max(0, Math.min(25, agv.position.y));
        }
      });
      
      // Update connection status
      setIsConnected(prev => Math.random() > 0.05);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simple AGV overlay for 2D view
  useEffect(() => {
    if (viewMode !== '2d' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas for transparent overlay
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw AGVs only - scaled to screen
      mapElements.forEach(element => {
        if (element.type === 'agv') {
          const agv = element.data as AGV;
          const x = (element.position.x / 50) * canvas.width; // Scale to screen canvas
          const y = (element.position.y / 25) * canvas.height;
          
          // AGV circle - optimized for screen view
          ctx.fillStyle = agv.status === 'error' ? '#ef4444' : 
                         agv.status === 'charging' ? '#3b82f6' : 
                         agv.status === 'moving' ? '#10b981' : '#6b7280';
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // White border for visibility
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // AGV ID
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(agv.id, x, y + 3);
        }
      });
    };

    draw();
  }, [viewMode, mapElements]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Check if click hits any element
    const clickedElement = mapElements.find(element => {
      const elementX = element.position.x * 10;
      const elementY = element.position.y * 10;
      const distance = Math.sqrt(Math.pow(x - elementX, 2) + Math.pow(y - elementY, 2));
      return distance < 15;
    });
    
    setSelectedElement(clickedElement || null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getAGVStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'text-green-400';
      case 'charging': return 'text-blue-400';
      case 'error': return 'text-red-400';
      case 'idle': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getElementTypeColor = (type: string) => {
    switch (type) {
      case 'agv': return 'bg-blue-500';
      case 'rack': return 'bg-gray-600';
      case 'charging_station': return 'bg-yellow-500';
      case 'delivery_point': return 'bg-purple-500';
      case 'warning_zone': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="p-3 bg-gray-900 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700" />
          <div>
            <SplitText
              text="AGV Digital Twin"
              className="text-xl font-bold text-gray-900"
              delay={40}
              duration={0.5}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              tag="h1"
            />
            <p className="text-xs text-gray-600">Live warehouse visualization and path tracking</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`gap-2 text-xs ${isConnected ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
              {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
                    <Badge variant="outline" className="gap-2 text-xs border-gray-300 text-gray-700">
              <Activity className="h-3.5 w-3.5" />
              {realisticAGVFleet.filter(agv => agv.status === 'moving').length} Active
            </Badge>
        </div>
        
              </div>

      {/* Control Panel */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-1 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* View Mode Controls */}
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-3">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === '2d' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="2D View"
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === '3d' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="3D View"
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('replay')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'replay' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Replay Mode"
            >
              Replay
            </button>
          </div>

          {/* 3D Model Toggle - only show in 3D view */}
          {viewMode === '3d' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">3D Model:</span>
              <button
                onClick={() => setShow3DModel(!show3DModel)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  show3DModel 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`}
                title={show3DModel ? "Hide 3D Model" : "Show 3D Model"}
              >
                {show3DModel ? "ON" : "OFF"}
              </button>
            </div>
          )}

          {/* View Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1 rounded transition-colors ${
                showGrid ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Grid"
            >
              <Layers className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowPath(!showPath)}
              className={`p-1 rounded transition-colors ${
                showPath ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Paths"
            >
              <Navigation className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowWaypoints(!showWaypoints)}
              className={`p-1 rounded transition-colors ${
                showWaypoints ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Waypoints"
            >
              <Target className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-1 rounded transition-colors ${
                showHeatmap ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Heatmap"
            >
              <Activity className="w-3 h-3" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border-l border-gray-200 pl-3">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs text-gray-600 min-w-[2.5rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Replay Controls (for replay mode) */}
        {viewMode === 'replay' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsReplaying(!isReplaying)}
              className={`p-1 rounded transition-colors ${
                isReplaying ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isReplaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <span className="text-xs text-gray-600">
              Replay: {replayIndex} / 100
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Visualization Area */}
        <div className="flex-1 relative bg-gray-50">
          {viewMode === '2d' ? (
            <div className="w-full h-full relative overflow-auto">
              <div className="relative w-full h-full">
                <img 
                  src="/warehouse2d.jpg" 
                  alt="Warehouse 2D Layout" 
                  className="w-full h-full object-contain"
                  style={{ 
                    imageRendering: 'crisp-edges',
                    objectFit: 'contain',
                    height: '100%',
                    width: 'auto'
                  }}
                />
                {/* Overlay canvas for AGV positions and interactions */}
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  style={{ pointerEvents: 'auto' }}
                  onClick={handleCanvasClick}
                />
              </div>
            </div>
          ) : viewMode === '3d' ? (
            <div className="w-full h-full">
              <WarehouseScene show3DModel={show3DModel} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base">Trajectory Replay Mode</p>
                <p className="text-xs mt-1">Historical movement playback</p>
              </div>
            </div>
          )}

          {/* Floating Info Panel */}
          {selectedElement && (
            <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm capitalize">
                  {selectedElement.type.replace('_', ' ')}
                </h3>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="text-gray-600 hover:text-gray-900 text-lg"
                >
                  ×
                </button>
              </div>
              
              {selectedElement.type === 'agv' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="text-gray-900">{selectedElement.data.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={getAGVStatusColor(selectedElement.data.status)}>
                      {selectedElement.data.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Battery:</span>
                    <span className="text-gray-900">{selectedElement.data.battery}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="text-gray-900">{selectedElement.data.speed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="text-gray-900">
                      ({selectedElement.position.x.toFixed(1)}, {selectedElement.position.y.toFixed(1)})
                    </span>
                  </div>
                  {selectedElement.data.currentJob && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-gray-600 text-xs mb-1">Current Job:</div>
                      <div className="text-gray-900 text-xs">
                        {selectedElement.data.currentJob.itemName}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedElement.type === 'rack' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900">{selectedElement.data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="text-gray-900">{selectedElement.data.currentUtilization}/{selectedElement.data.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilization:</span>
                    <span className="text-gray-900">
                      {Math.round((selectedElement.data.currentUtilization / selectedElement.data.totalCapacity) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-gray-600 text-xs mb-1">Items:</div>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {realisticInventoryData
                        .filter(item => item.location.rack === selectedElement.data.name.replace('Rack ', ''))
                        .slice(0, 3)
                        .map(item => (
                          <div key={item.id} className="text-gray-900 text-xs">
                            {item.name} ({item.quantity})
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedElement.type === 'charging_station' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="text-gray-900">{selectedElement.data.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="text-gray-900">{selectedElement.data.currentOccupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="text-gray-900">
                      {selectedElement.data.capacity - selectedElement.data.currentOccupancy}
                    </span>
                  </div>
                </div>
              )}
              
              {selectedElement.type === 'delivery_point' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900 capitalize">
                      {selectedElement.data.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              )}
              
              {selectedElement.type === 'warning_zone' && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900 capitalize">
                      {selectedElement.data.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Radius:</span>
                    <span className="text-gray-900">{selectedElement.data.radius}m</span>
                  </div>
                  <div className="flex items-center space-x-2 text-orange-600 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>High traffic area</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
          {/* AGV Status */}
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              AGV Fleet Status
            </h3>
            <div className="space-y-1">
              {realisticAGVFleet.map(agv => (
                <div
                  key={agv.id}
                  className={`p-2 rounded border transition-colors cursor-pointer ${
                    selectedElement?.id === agv.id
                      ? 'bg-gray-100 border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedElement({
                    id: agv.id,
                    type: 'agv',
                    position: agv.position,
                    data: agv
                  })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        agv.status === 'moving' ? 'bg-green-500' :
                        agv.status === 'charging' ? 'bg-blue-500' :
                        agv.status === 'error' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-xs font-medium text-gray-900">{agv.id}</span>
                    </div>
                    <span className={`text-xs ${getAGVStatusColor(agv.status)}`}>
                      {agv.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                    <span>Battery: {agv.battery}%</span>
                    <span>Speed: {agv.speed} m/s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Map Legend
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">AGV (Moving)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span className="text-gray-600">Storage Rack</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Charging Station</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Delivery Point</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full opacity-30"></div>
                <span className="text-gray-600">Warning Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-600">AGV Path</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Waypoint</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
              <Activity className="w-3 h-3 mr-1" />
              Live Statistics
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Active AGVs:</span>
                <span className="text-gray-900">
                  {realisticAGVFleet.filter(agv => agv.status === 'moving').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Charging:</span>
                <span className="text-gray-900">
                  {realisticAGVFleet.filter(agv => agv.status === 'charging').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Battery:</span>
                <span className="text-gray-900">
                  {Math.round(realisticAGVFleet.reduce((sum, agv) => sum + agv.battery, 0) / realisticAGVFleet.length)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Distance:</span>
                <span className="text-gray-900">
                  {realisticAGVFleet.reduce((sum, agv) => sum + agv.distanceTraveled, 0).toFixed(1)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warehouse Utilization:</span>
                <span className="text-gray-900">
                  {Math.round(
                    realisticRacks.reduce((sum, rack) => sum + (rack.currentUtilization / rack.totalCapacity), 0) / 
                    realisticRacks.length * 100
                  )}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warehouse;
