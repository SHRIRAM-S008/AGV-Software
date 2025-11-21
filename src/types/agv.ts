export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Job {
  id: string;
  itemName: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgv: string;
  pickupLocation: Position;
  dropLocation: Position;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number;
}

export interface AGV {
  id: string;
  name: string;
  position: Position;
  status: 'idle' | 'moving' | 'charging' | 'error';
  battery: number;
  speed: number;
  currentJob?: Job;
  path?: Position[];
  distanceTraveled: number;
}

export interface Obstacle {
  id: string;
  type: 'human' | 'box' | 'rack' | 'wall';
  position: Position;
  size: { width: number; height: number; depth: number };
  isMoving?: boolean;
}

export interface AnalyticsData {
  totalJobsCompleted: number;
  totalJobsFailed: number;
  averageCompletionTime: number;
  totalDistanceTraveled: number;
  agvUtilization: {
    idleTime: number;
    activeTime: number;
    chargingTime: number;
  };
  jobsByPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  completionTimes: Array<{
    timestamp: Date;
    duration: number;
    jobId: string;
  }>;
  hourlyJobCount: Array<{
    hour: number;
    count: number;
  }>;
  /**
   * New optional metadata used by the refreshed dashboard components.
   */
  aggregateWindow?: string;
  lastUpdated?: Date | string;
  streak?: string;
  completionTrend?: number;
  distanceTrend?: number;
}

export interface WarehouseState {
  agvs: AGV[];
  jobs: Job[];
  obstacles: Obstacle[];
  warehouseSize: { width: number; length: number; height: number };
  analytics: AnalyticsData | null;
  isSimulationPlaying: boolean;
  simulationSpeed: number;
}