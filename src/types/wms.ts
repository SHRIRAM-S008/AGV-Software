export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface WarehouseSlot {
  id: string;
  rack: string;
  shelf: string;
  slot: string;
  position: Position;
  isOccupied: boolean;
  item?: InventoryItem;
  lastUpdated: Date;
}

export interface InventoryItem {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  quantity: number;
  unitType: 'boxes' | 'units' | 'pallets';
  expiryDate?: Date;
  batchNumber?: string;
  handlingPriority: 'normal' | 'fragile' | 'high_value';
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  location: WarehouseSlot;
  minStockLevel: number;
  maxStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rack {
  id: string;
  name: string;
  position: Position;
  dimensions: { width: number; height: number; depth: number };
  shelves: Shelf[];
  totalCapacity: number;
  currentUtilization: number;
  agvAccessPath: Position[];
  isAccessible: boolean;
}

export interface Shelf {
  id: string;
  rackId: string;
  name: string;
  level: number;
  slots: WarehouseSlot[];
  capacity: number;
  currentLoad: number;
  weightLimit: number;
  currentWeight: number;
}

export interface WMSCreateJobRequest {
  type: 'pick' | 'restock' | 'move' | 'return';
  itemId: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sourceLocation?: WarehouseSlot;
  targetLocation?: WarehouseSlot;
  requestedBy: string;
  notes?: string;
}

export interface WMSJob {
  id: string;
  type: 'pick' | 'restock' | 'move' | 'return';
  itemId: string;
  itemName: string;
  skuCode: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAgv?: string;
  sourceLocation: WarehouseSlot;
  targetLocation: WarehouseSlot;
  pickupLocation: Position;
  dropLocation: Position;
  estimatedTime?: number;
  actualTime?: number;
  createdBy: string;
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface WMSAlert {
  id: string;
  type: 'low_stock' | 'overloaded' | 'wrong_placement' | 'agv_blocked' | 'communication_fail' | 'expiry_warning';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  itemId?: string;
  rackId?: string;
  agvId?: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface WarehouseLayout {
  racks: Rack[];
  chargingStations: Position[];
  pickupStations: Position[];
  dropoffStations: Position[];
  obstacles: Array<{
    id: string;
    position: Position;
    size: { width: number; height: number; depth: number };
    type: 'wall' | 'pillar' | 'equipment';
  }>;
  pathways: Array<{
    id: string;
    name: string;
    waypoints: Position[];
    isAGVPath: boolean;
    isHumanPath: boolean;
  }>;
}

export interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  categories: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  lowStockItems: number;
  expiredItems: number;
  expiringItems: number;
  utilizationRate: number;
  accuracyRate: number;
  turnoverRate: number;
}

export interface WMSExportData {
  timestamp: Date;
  format: 'csv' | 'json' | 'pdf';
  data: {
    inventory: InventoryItem[];
    racks: Rack[];
    jobs: WMSJob[];
    alerts: WMSAlert[];
    metrics: InventoryMetrics;
  };
}

export interface WMSState {
  inventory: InventoryItem[];
  racks: Rack[];
  jobs: WMSJob[];
  alerts: WMSAlert[];
  layout: WarehouseLayout;
  metrics: InventoryMetrics;
  selectedRack?: Rack;
  selectedShelf?: Shelf;
  selectedSlot?: WarehouseSlot;
  selectedItem?: InventoryItem;
  isLoading: boolean;
  error?: string;
}
