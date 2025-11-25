import { useState, useEffect, useRef } from 'react';
import { 
  Settings, Wifi, Battery, Zap, Shield, Bell, User, Database, 
  Activity, AlertTriangle, CheckCircle, Info, RefreshCw, Download,
  Upload, Save, X, Plus, Edit, Trash2, Eye, EyeOff, Lock, Unlock,
  MapPin, Navigation, Clock, Calendar, TrendingUp, BarChart3, Undo, Redo, Truck,
  Package, MousePointer, Hand, Square, Move, BatteryCharging, Copy, 
  Grid3x3, Grid, Ruler, ZoomIn, ZoomOut, RotateCcw, Layers, Check, Map as MapIcon, Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AGV, Position } from '@/types';
import SplitText from '@/components/common/SplitText';
import { SidebarTrigger } from '@/components/ui/sidebar';

// Enhanced Types
interface MapElement {
  id: string;
  type: 'wall' | 'rack' | 'obstacle' | 'lane' | 'pickup' | 'dropoff' | 'restricted' | 'charging';
  position: Position;
  dimensions?: { width: number; height: number };
  rotation?: number;
  layer?: number;
  locked?: boolean;
  properties?: {
    name?: string;
    color?: string;
    opacity?: number;
    [key: string]: any;
  };
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

interface MapHistory {
  past: MapElement[][];
  present: MapElement[];
  future: MapElement[][];
}

// Types for system settings (remaining the same as original)
interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  lastLogin: Date;
  status: 'active' | 'suspended';
  permissions: PermissionSet;
}

interface PermissionSet {
  viewDashboard: boolean;
  createJobs: boolean;
  editWMS: boolean;
  changeMap: boolean;
  addAGV: boolean;
  stopAGV: boolean;
  accessAnalytics: boolean;
  emergencyControls: boolean;
}

interface AGVConfiguration {
  id: string;
  model: string;
  speed: number;
  maxLoad: number;
  batteryCapacity: number;
  homePosition: Position;
  firmwareVersion: string;
  status: 'active' | 'maintenance' | 'deactivated';
}

interface RackConfiguration {
  id: string;
  name: string;
  columns: number;
  shelves: number;
  dimensions: { width: number; height: number; depth: number };
  position: Position;
  skuAssignment?: string;
  maxCapacity: number;
  shelfStatus: Array<{
    id: string;
    status: 'normal' | 'damaged' | 'reserved' | 'blocked';
    sku?: string;
    currentLoad: number;
  }>;
}

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'agv' | 'racks' | 'users' | 'permissions'>('map');
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [copiedElements, setCopiedElements] = useState<MapElement[]>([]);
  
  // Enhanced Map Editor State
  const [mapElements, setMapElements] = useState<MapElement[]>([
    { id: 'wall-1', type: 'wall', position: { x: 0, y: 0, z: 0 }, dimensions: { width: 50, height: 1 }, layer: 0 },
    { id: 'wall-2', type: 'wall', position: { x: 0, y: 25, z: 0 }, dimensions: { width: 50, height: 1 }, layer: 0 },
    { id: 'wall-3', type: 'wall', position: { x: 0, y: 0, z: 0 }, dimensions: { width: 1, height: 25 }, layer: 0 },
    { id: 'wall-4', type: 'wall', position: { x: 50, y: 0, z: 0 }, dimensions: { width: 1, height: 25 }, layer: 0 },
  ]);
  
  const [mapHistory, setMapHistory] = useState<MapHistory>({
    past: [],
    present: mapElements,
    future: []
  });
  
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'layer-0', name: 'Base', visible: true, locked: false, opacity: 1 },
    { id: 'layer-1', name: 'Obstacles', visible: true, locked: false, opacity: 1 },
    { id: 'layer-2', name: 'Navigation', visible: true, locked: false, opacity: 1 }
  ]);
  
  const [currentLayer, setCurrentLayer] = useState(0);
  const [mapTool, setMapTool] = useState<'select' | 'pan' | 'wall' | 'rack' | 'obstacle' | 'lane' | 'pickup' | 'dropoff' | 'charging'>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridSnap, setGridSnap] = useState(true);
  const [gridSize, setGridSize] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Position | null>(null);
  const [previewElement, setPreviewElement] = useState<MapElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{ start: Position; end: Position } | null>(null);
  
  const mapCanvasRef = useRef<HTMLDivElement>(null);

  // AGV, Rack, User states (same as original)
  const [agvConfigs, setAgvConfigs] = useState<AGVConfiguration[]>([
    {
      id: 'AGV-001',
      model: 'Mini-AGV-X1',
      speed: 2.5,
      maxLoad: 100,
      batteryCapacity: 5000,
      homePosition: { x: 5, y: 5, z: 0 },
      firmwareVersion: 'v2.1.0',
      status: 'active'
    },
    {
      id: 'AGV-002',
      model: 'Pallet-AGV-Pro',
      speed: 1.8,
      maxLoad: 500,
      batteryCapacity: 8000,
      homePosition: { x: 45, y: 20, z: 0 },
      firmwareVersion: 'v2.1.0',
      status: 'active'
    }
  ]);
  const [showAddAGVForm, setShowAddAGVForm] = useState(false);
  const [newAGV, setNewAGV] = useState<Partial<AGVConfiguration>>({
    model: '',
    speed: 2.0,
    maxLoad: 200,
    batteryCapacity: 6000,
    homePosition: { x: 10, y: 10, z: 0 },
    firmwareVersion: 'v2.1.0'
  });
  
  const [rackConfigs, setRackConfigs] = useState<RackConfiguration[]>([
    {
      id: 'rack-a',
      name: 'Rack A',
      columns: 6,
      shelves: 4,
      dimensions: { width: 12, height: 8, depth: 3 },
      position: { x: 10, y: 8, z: 0 },
      maxCapacity: 24,
      shelfStatus: Array.from({ length: 24 }, (_, i) => ({
        id: `a-${i}`,
        status: 'normal' as const,
        currentLoad: Math.floor(Math.random() * 10)
      }))
    },
    {
      id: 'rack-b',
      name: 'Rack B',
      columns: 6,
      shelves: 4,
      dimensions: { width: 12, height: 8, depth: 3 },
      position: { x: 30, y: 8, z: 0 },
      maxCapacity: 24,
      shelfStatus: Array.from({ length: 24 }, (_, i) => ({
        id: `b-${i}`,
        status: 'normal' as const,
        currentLoad: Math.floor(Math.random() * 10)
      }))
    }
  ]);
  
  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@warehouse.com',
      role: 'admin',
      lastLogin: new Date(),
      status: 'active',
      permissions: {
        viewDashboard: true,
        createJobs: true,
        editWMS: true,
        changeMap: true,
        addAGV: true,
        stopAGV: true,
        accessAnalytics: true,
        emergencyControls: true
      }
    },
    {
      id: '2',
      username: 'manager1',
      email: 'manager@warehouse.com',
      role: 'manager',
      lastLogin: new Date(Date.now() - 3600000),
      status: 'active',
      permissions: {
        viewDashboard: true,
        createJobs: true,
        editWMS: true,
        changeMap: false,
        addAGV: false,
        stopAGV: false,
        accessAnalytics: true,
        emergencyControls: false
      }
    },
    {
      id: '3',
      username: 'operator1',
      email: 'operator@warehouse.com',
      role: 'operator',
      lastLogin: new Date(Date.now() - 7200000),
      status: 'active',
      permissions: {
        viewDashboard: true,
        createJobs: true,
        editWMS: false,
        changeMap: false,
        addAGV: false,
        stopAGV: true,
        accessAnalytics: false,
        emergencyControls: true
      }
    }
  ]);

  const permissionTemplates = {
    admin: {
      viewDashboard: true,
      createJobs: true,
      editWMS: true,
      changeMap: true,
      addAGV: true,
      stopAGV: true,
      accessAnalytics: true,
      emergencyControls: true
    },
    manager: {
      viewDashboard: true,
      createJobs: true,
      editWMS: true,
      changeMap: false,
      addAGV: false,
      stopAGV: false,
      accessAnalytics: true,
      emergencyControls: false
    },
    operator: {
      viewDashboard: true,
      createJobs: true,
      editWMS: false,
      changeMap: false,
      addAGV: false,
      stopAGV: true,
      accessAnalytics: false,
      emergencyControls: true
    },
    viewer: {
      viewDashboard: true,
      createJobs: false,
      editWMS: false,
      changeMap: false,
      addAGV: false,
      stopAGV: false,
      accessAnalytics: false,
      emergencyControls: false
    }
  };

  const tabs = [
    { id: 'map' as const, label: 'Map Editor', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'agv' as const, label: 'AGV Fleet', icon: <Truck className="w-4 h-4" /> },
    { id: 'racks' as const, label: 'Rack Layout', icon: <Package className="w-4 h-4" /> },
    { id: 'users' as const, label: 'User Accounts', icon: <User className="w-4 h-4" /> },
    { id: 'permissions' as const, label: 'Permissions', icon: <Shield className="w-4 h-4" /> }
  ];

  // Enhanced Map Editor Functions
  const snapToGrid = (value: number) => {
    if (!gridSnap) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const getMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom / 8;
    const y = (e.clientY - rect.top - pan.y) / zoom / 8;
    return { x: snapToGrid(x), y: snapToGrid(y), z: 0 };
  };

  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePosition(e);
    
    if (mapTool === 'pan' || (e.button === 1)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (mapTool === 'select') {
      setSelectionBox({ start: pos, end: pos });
      setIsDrawing(true);
    } else {
      setIsDrawing(true);
      setDrawStart(pos);
      setPreviewElement({
        id: 'preview',
        type: mapTool,
        position: pos,
        dimensions: { width: 0, height: 0 },
        layer: currentLayer
      });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePosition(e);
    
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (isDrawing && mapTool === 'select' && selectionBox) {
      setSelectionBox({ ...selectionBox, end: pos });
      // Select elements within box
      const minX = Math.min(selectionBox.start.x, pos.x);
      const maxX = Math.max(selectionBox.start.x, pos.x);
      const minY = Math.min(selectionBox.start.y, pos.y);
      const maxY = Math.max(selectionBox.start.y, pos.y);
      
      const selected = new Set<string>();
      mapElements.forEach(el => {
        if (el.position.x >= minX && el.position.x <= maxX &&
            el.position.y >= minY && el.position.y <= maxY) {
          selected.add(el.id);
        }
      });
      setSelectedElements(selected);
    } else if (isDrawing && drawStart && previewElement) {
      const width = Math.abs(pos.x - drawStart.x);
      const height = Math.abs(pos.y - drawStart.y);
      const x = Math.min(pos.x, drawStart.x);
      const y = Math.min(pos.y, drawStart.y);
      
      setPreviewElement({
        ...previewElement,
        position: { x, y, z: 0 },
        dimensions: { width: width || 1, height: height || 1 }
      });
    }
  };

  const handleMapMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
    } else if (isDrawing && previewElement && drawStart) {
      const pos = getMousePosition(e);
      const width = Math.abs(pos.x - drawStart.x) || 1;
      const height = Math.abs(pos.y - drawStart.y) || 1;
      const x = Math.min(pos.x, drawStart.x);
      const y = Math.min(pos.y, drawStart.y);
      
      const newElement: MapElement = {
        id: `${mapTool}-${Date.now()}`,
        type: mapTool as MapElement['type'],
        position: { x, y, z: 0 },
        dimensions: { width, height },
        layer: currentLayer
      };
      
      addToHistory(mapElements);
      setMapElements([...mapElements, newElement]);
      setPreviewElement(null);
    }
    
    setIsDrawing(false);
    setDrawStart(null);
    setSelectionBox(null);
  };

  const handleElementClick = (e: React.MouseEvent, element: MapElement) => {
    e.stopPropagation();
    if (mapTool === 'select') {
      if (e.shiftKey) {
        const newSelection = new Set(selectedElements);
        if (newSelection.has(element.id)) {
          newSelection.delete(element.id);
        } else {
          newSelection.add(element.id);
        }
        setSelectedElements(newSelection);
      } else {
        setSelectedElements(new Set([element.id]));
      }
    }
  };

  const addToHistory = (currentElements: MapElement[]) => {
    setMapHistory(prev => ({
      past: [...prev.past.slice(-19), currentElements],
      present: currentElements,
      future: []
    }));
  };

  const undo = () => {
    if (mapHistory.past.length === 0) return;
    const previous = mapHistory.past[mapHistory.past.length - 1];
    setMapHistory(prev => ({
      past: prev.past.slice(0, -1),
      present: previous,
      future: [prev.present, ...prev.future]
    }));
    setMapElements(previous);
  };

  const redo = () => {
    if (mapHistory.future.length === 0) return;
    const next = mapHistory.future[0];
    setMapHistory(prev => ({
      past: [...prev.past, prev.present],
      present: next,
      future: prev.future.slice(1)
    }));
    setMapElements(next);
  };

  const copySelected = () => {
    const copied = mapElements.filter(el => selectedElements.has(el.id));
    setCopiedElements(copied);
  };

  const pasteElements = () => {
    if (copiedElements.length === 0) return;
    
    const newElements = copiedElements.map(el => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random()}`,
      position: { ...el.position, x: el.position.x + 2, y: el.position.y + 2 }
    }));
    
    addToHistory(mapElements);
    setMapElements([...mapElements, ...newElements]);
    setSelectedElements(new Set(newElements.map(el => el.id)));
  };

  const deleteSelected = () => {
    addToHistory(mapElements);
    setMapElements(mapElements.filter(el => !selectedElements.has(el.id)));
    setSelectedElements(new Set());
  };

  const selectAll = () => {
    setSelectedElements(new Set(mapElements.map(el => el.id)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'map') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            copySelected();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          case 'd':
            e.preventDefault();
            copySelected();
            pasteElements();
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedElements(new Set());
        setMapTool('select');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, mapElements, selectedElements, copiedElements]);

  // AGV Management Functions (same as original)
  const addAGV = () => {
    if (!newAGV.model) return;
    
    const agv: AGVConfiguration = {
      id: `AGV-${String(agvConfigs.length + 1).padStart(3, '0')}`,
      model: newAGV.model!,
      speed: newAGV.speed!,
      maxLoad: newAGV.maxLoad!,
      batteryCapacity: newAGV.batteryCapacity!,
      homePosition: newAGV.homePosition!,
      firmwareVersion: newAGV.firmwareVersion!,
      status: 'active'
    };
    
    setAgvConfigs([...agvConfigs, agv]);
    setNewAGV({
      model: '',
      speed: 2.0,
      maxLoad: 200,
      batteryCapacity: 6000,
      homePosition: { x: 10, y: 10, z: 0 },
      firmwareVersion: 'v2.1.0'
    });
    setShowAddAGVForm(false);
  };

  const updateAGVStatus = (id: string, status: AGVConfiguration['status']) => {
    setAgvConfigs(agvConfigs.map(agv => 
      agv.id === id ? { ...agv, status } : agv
    ));
  };

  const removeAGV = (id: string) => {
    setAgvConfigs(agvConfigs.filter(agv => agv.id !== id));
  };

  const updateUserStatus = (id: string, status: UserAccount['status']) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status } : user
    ));
  };

  const updateUserRole = (id: string, role: UserAccount['role']) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, role, permissions: permissionTemplates[role] } : user
    ));
  };

  const togglePermission = (userId: string, permission: keyof PermissionSet) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, permissions: { ...user.permissions, [permission]: !user.permissions[permission] } }
        : user
    ));
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SidebarTrigger className="p-3 bg-gray-900 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700" />
            <Settings className="w-5 h-5 text-gray-700" />
            <div>
              <SplitText
                text="System Settings"
                className="text-lg font-semibold text-gray-900"
                delay={40}
                duration={0.5}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                tag="h1"
              />
              <p className="text-xs text-gray-600">Configure your warehouse management system</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export Config
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Import Config
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Enhanced Map Editor Tab */}
        {activeTab === 'map' && (
          <div className="h-full flex">
            {/* Advanced Toolbar */}
            <div className="w-16 bg-white border-r border-gray-200 p-2 space-y-2">
              <button
                onClick={() => setMapTool('select')}
                className={`w-full p-2 rounded ${mapTool === 'select' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Select (V)"
              >
                <MousePointer className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setMapTool('pan')}
                className={`w-full p-2 rounded ${mapTool === 'pan' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Pan (H)"
              >
                <Hand className="w-4 h-4 mx-auto" />
              </button>
              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={() => setMapTool('wall')}
                  className={`w-full p-2 rounded ${mapTool === 'wall' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Wall"
                >
                  <Square className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setMapTool('rack')}
                  className={`w-full p-2 rounded ${mapTool === 'rack' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Rack"
                >
                  <Package className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setMapTool('obstacle')}
                  className={`w-full p-2 rounded ${mapTool === 'obstacle' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Obstacle"
                >
                  <AlertTriangle className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setMapTool('lane')}
                  className={`w-full p-2 rounded ${mapTool === 'lane' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Lane"
                >
                  <Move className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setMapTool('pickup')}
                  className={`w-full p-2 rounded ${mapTool === 'pickup' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Pickup"
                >
                  <Navigation className="w-4 h-4 mx-auto rotate-180" />
                </button>
                <button
                  onClick={() => setMapTool('dropoff')}
                  className={`w-full p-2 rounded ${mapTool === 'dropoff' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Dropoff"
                >
                  <Navigation className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setMapTool('charging')}
                  className={`w-full p-2 rounded ${mapTool === 'charging' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Charging Station"
                >
                  <BatteryCharging className="w-4 h-4 mx-auto" />
                </button>
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <button
                  onClick={undo}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  title="Undo (Ctrl+Z)"
                  disabled={mapHistory.past.length === 0}
                >
                  <Undo className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={redo}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  title="Redo (Ctrl+Y)"
                  disabled={mapHistory.future.length === 0}
                >
                  <Redo className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={copySelected}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={pasteElements}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100"
                  title="Paste (Ctrl+V)"
                >
                  <Copy className="w-4 h-4 mx-auto" />
                </button>
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`w-full p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Toggle Grid"
                >
                  <Grid3x3 className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setGridSnap(!gridSnap)}
                  className={`w-full p-2 rounded ${gridSnap ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Grid Snap"
                >
                  <Grid className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setShowRulers(!showRulers)}
                  className={`w-full p-2 rounded ${showRulers ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Show Rulers"
                >
                  <Ruler className="w-4 h-4 mx-auto" />
                </button>
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <button
                  onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="w-full p-2 rounded text-gray-600 hover:bg-gray-100"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Layer Panel */}
            <div className="w-48 bg-white border-r border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Layers
              </h3>
              <div className="space-y-2">
                {mapLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-2 border rounded cursor-pointer ${
                      currentLayer === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentLayer(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{layer.name}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLayers = [...mapLayers];
                            newLayers[index].visible = !newLayers[index].visible;
                            setMapLayers(newLayers);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLayers = [...mapLayers];
                            newLayers[index].locked = !newLayers[index].locked;
                            setMapLayers(newLayers);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {layer.locked ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Properties Panel */}
              {selectedElements.size > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Properties ({selectedElements.size} selected)
                  </h3>
                  {selectedElements.size === 1 && (
                    <div className="space-y-3">
                      {mapElements
                        .filter(el => selectedElements.has(el.id))
                        .map(el => (
                          <div key={el.id} className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-gray-600">Type</label>
                              <div className="text-sm font-medium capitalize">{el.type}</div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">Position</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  value={el.position.x}
                                  onChange={(e) => {
                                    const newElements = mapElements.map(elem =>
                                      elem.id === el.id
                                        ? { ...elem, position: { ...elem.position, x: parseFloat(e.target.value) } }
                                        : elem
                                    );
                                    setMapElements(newElements);
                                  }}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                                  placeholder="X"
                                />
                                <input
                                  type="number"
                                  value={el.position.y}
                                  onChange={(e) => {
                                    const newElements = mapElements.map(elem =>
                                      elem.id === el.id
                                        ? { ...elem, position: { ...elem.position, y: parseFloat(e.target.value) } }
                                        : elem
                                    );
                                    setMapElements(newElements);
                                  }}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                                  placeholder="Y"
                                />
                              </div>
                            </div>
                            {el.dimensions && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">Size</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    value={el.dimensions.width}
                                    onChange={(e) => {
                                      const newElements = mapElements.map(elem =>
                                        elem.id === el.id
                                          ? { ...elem, dimensions: { ...elem.dimensions!, width: parseFloat(e.target.value) } }
                                          : elem
                                      );
                                      setMapElements(newElements);
                                    }}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="Width"
                                  />
                                  <input
                                    type="number"
                                    value={el.dimensions.height}
                                    onChange={(e) => {
                                      const newElements = mapElements.map(elem =>
                                        elem.id === el.id
                                          ? { ...elem, dimensions: { ...elem.dimensions!, height: parseFloat(e.target.value) } }
                                          : elem
                                      );
                                      setMapElements(newElements);
                                    }}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                    placeholder="Height"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-3"
                    onClick={deleteSelected}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            {/* Enhanced Map Canvas */}
            <div className="flex-1 bg-gray-100 relative overflow-hidden">
              {/* Rulers */}
              {showRulers && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-6 bg-white border-b border-gray-300 z-10">
                    <div className="relative h-full" style={{ marginLeft: `${pan.x}px` }}>
                      {Array.from({ length: 51 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 text-xs text-gray-600"
                          style={{ left: `${i * 40 * zoom}px` }}
                        >
                          <div className="h-2 border-l border-gray-400" />
                          <div className="ml-1">{i * 5}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 bottom-0 w-6 bg-white border-r border-gray-300 z-10">
                    <div className="relative w-full" style={{ marginTop: `${pan.y}px` }}>
                      {Array.from({ length: 26 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 text-xs text-gray-600"
                          style={{ top: `${i * 40 * zoom}px` }}
                        >
                          <div className="w-2 border-t border-gray-400" />
                          <div className="mt-1 ml-1">{i * 5}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div
                ref={mapCanvasRef}
                className={`absolute inset-0 ${
                  mapTool === 'pan' ? 'cursor-move' : 
                  mapTool === 'select' ? 'cursor-default' : 
                  'cursor-crosshair'
                }`}
                style={{ marginTop: showRulers ? '24px' : '0', marginLeft: showRulers ? '24px' : '0' }}
                onMouseDown={handleMapMouseDown}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
              >
                <div
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'top left'
                  }}
                >
                  {/* Grid */}
                  {showGrid && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      {Array.from({ length: 51 }, (_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute w-full border-t border-gray-400"
                          style={{ top: `${i * 8 * gridSize}px` }}
                        />
                      ))}
                      {Array.from({ length: 101 }, (_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute h-full border-l border-gray-400"
                          style={{ left: `${i * 8 * gridSize}px` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Map Elements */}
                  {mapElements
                    .filter(el => mapLayers[el.layer || 0]?.visible)
                    .map(element => (
                      <div
                        key={element.id}
                        className={`absolute transition-all ${
                          selectedElements.has(element.id) ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } ${
                          element.type === 'wall' ? 'bg-gray-700' :
                          element.type === 'rack' ? 'bg-blue-600' :
                          element.type === 'obstacle' ? 'bg-red-500' :
                          element.type === 'lane' ? 'bg-yellow-400 opacity-50' :
                          element.type === 'pickup' ? 'bg-green-500' :
                          element.type === 'dropoff' ? 'bg-purple-500' :
                          element.type === 'charging' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}
                        style={{
                          left: `${element.position.x * 8}px`,
                          top: `${element.position.y * 8}px`,
                          width: element.dimensions ? `${element.dimensions.width * 8}px` : '16px',
                          height: element.dimensions ? `${element.dimensions.height * 8}px` : '16px',
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                          opacity: mapLayers[element.layer || 0]?.opacity || 1,
                          cursor: mapTool === 'select' ? 'pointer' : 'default',
                          pointerEvents: mapLayers[element.layer || 0]?.locked ? 'none' : 'auto'
                        }}
                        onClick={(e) => handleElementClick(e, element)}
                      >
                        {element.type === 'charging' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BatteryCharging className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Preview Element */}
                  {previewElement && (
                    <div
                      className={`absolute pointer-events-none opacity-60 ${
                        previewElement.type === 'wall' ? 'bg-gray-700' :
                        previewElement.type === 'rack' ? 'bg-blue-600' :
                        previewElement.type === 'obstacle' ? 'bg-red-500' :
                        previewElement.type === 'lane' ? 'bg-yellow-400' :
                        previewElement.type === 'pickup' ? 'bg-green-500' :
                        previewElement.type === 'dropoff' ? 'bg-purple-500' :
                        previewElement.type === 'charging' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}
                      style={{
                        left: `${previewElement.position.x * 8}px`,
                        top: `${previewElement.position.y * 8}px`,
                        width: `${(previewElement.dimensions?.width || 1) * 8}px`,
                        height: `${(previewElement.dimensions?.height || 1) * 8}px`
                      }}
                    />
                  )}

                  {/* Selection Box */}
                  {selectionBox && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-100 opacity-30 pointer-events-none"
                      style={{
                        left: `${Math.min(selectionBox.start.x, selectionBox.end.x) * 8}px`,
                        top: `${Math.min(selectionBox.start.y, selectionBox.end.y) * 8}px`,
                        width: `${Math.abs(selectionBox.end.x - selectionBox.start.x) * 8}px`,
                        height: `${Math.abs(selectionBox.end.y - selectionBox.start.y) * 8}px`
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Status Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Tool: <strong className="capitalize">{mapTool}</strong></span>
                  <span>Zoom: <strong>{Math.round(zoom * 100)}%</strong></span>
                  <span>Grid: <strong>{gridSnap ? 'On' : 'Off'}</strong></span>
                  <span>Selected: <strong>{selectedElements.size}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+Z</kbd> Undo
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+C</kbd> Copy
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+V</kbd> Paste
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Del</kbd> Delete
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs remain the same */}
        {activeTab === 'agv' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AGV Fleet Management</h2>
              <Button onClick={() => setShowAddAGVForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New AGV
              </Button>
            </div>

            {/* Add AGV Form */}
            {showAddAGVForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Register New AGV</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={newAGV.model}
                      onChange={(e) => setNewAGV({ ...newAGV, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mini-AGV-X1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speed (m/s)</label>
                    <input
                      type="number"
                      value={newAGV.speed}
                      onChange={(e) => setNewAGV({ ...newAGV, speed: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Load (kg)</label>
                    <input
                      type="number"
                      value={newAGV.maxLoad}
                      onChange={(e) => setNewAGV({ ...newAGV, maxLoad: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery Capacity (mAh)</label>
                    <input
                      type="number"
                      value={newAGV.batteryCapacity}
                      onChange={(e) => setNewAGV({ ...newAGV, batteryCapacity: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Position X</label>
                    <input
                      type="number"
                      value={newAGV.homePosition?.x}
                      onChange={(e) => setNewAGV({ 
                        ...newAGV, 
                        homePosition: { ...newAGV.homePosition!, x: parseFloat(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Position Y</label>
                    <input
                      type="number"
                      value={newAGV.homePosition?.y}
                      onChange={(e) => setNewAGV({ 
                        ...newAGV, 
                        homePosition: { ...newAGV.homePosition!, y: parseFloat(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Button variant="outline" onClick={() => setShowAddAGVForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addAGV}>
                    <Check className="w-4 h-4 mr-1" />
                    Register AGV
                  </Button>
                </div>
              </div>
            )}

            {/* AGV List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agvConfigs.map(agv => (
                <div key={agv.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{agv.id}</h3>
                      <Badge className={
                        agv.status === 'active' ? 'bg-green-100 text-green-800' :
                        agv.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {agv.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{agv.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Speed:</span>
                      <span className="font-medium">{agv.speed} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Load:</span>
                      <span className="font-medium">{agv.maxLoad} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Battery:</span>
                      <span className="font-medium">{agv.batteryCapacity} mAh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Home:</span>
                      <span className="font-medium">({agv.homePosition.x}, {agv.homePosition.y})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Firmware:</span>
                      <span className="font-medium">{agv.firmwareVersion}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    {agv.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => updateAGVStatus(agv.id, 'maintenance')}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Maintenance
                      </Button>
                    )}
                    {agv.status === 'maintenance' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => updateAGVStatus(agv.id, 'active')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAGV(agv.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining tabs unchanged... */}
      </div>
    </div>
    </div>
  );
};

export default SystemSettings;