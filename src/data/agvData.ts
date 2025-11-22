import { AGV, Position, Job } from '@/types';

// Realistic AGV Fleet Data with telemetry and maintenance logs
export const realisticAGVFleet: AGV[] = [
  {
    id: 'AGV-01',
    name: 'Alpha Unit',
    type: 'mini_agv',
    model: 'Picker-X1',
    position: { x: 4.2, y: 7.5, z: 0 },
    status: 'idle',
    operationalMode: 'auto',
    battery: 92,
    speed: 0,
    heading: 90,
    distanceTraveled: 1250.5,
    temperature: 42,
    loadWeight: 0,
    isObstacleDetected: false,
    firmwareVersion: 'v2.1.3',
    lastServiceDate: new Date('2025-11-11'),
    batteryHealth: 91,
    motorHealth: 94,
    totalRunHours: 1250
  },
  {
    id: 'AGV-02',
    name: 'Beta Unit',
    type: 'mini_agv',
    model: 'Picker-X1',
    position: { x: 11.1, y: 3.3, z: 0 },
    status: 'moving',
    operationalMode: 'auto',
    battery: 75,
    speed: 1.2,
    heading: 180,
    currentJob: {
      id: 'JOB-102',
      itemName: 'iPhone 17 Pro',
      quantity: 5,
      priority: 'high',
      assignedAgv: 'AGV-02',
      pickupLocation: { x: 10, y: 1, z: 0 },
      dropLocation: { x: 0, y: 0, z: 0 },
      status: 'in-progress',
      createdAt: new Date('2025-11-22T09:00:00'),
      startedAt: new Date('2025-11-22T09:05:00'),
      estimatedTime: 8
    },
    path: [{ x: 11.1, y: 3.3, z: 0 }, { x: 10, y: 2, z: 0 }, { x: 10, y: 1, z: 0 }],
    distanceTraveled: 980.3,
    temperature: 45,
    loadWeight: 1.0,
    isObstacleDetected: false,
    nextWaypoint: { x: 10, y: 2, z: 0 },
    estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 1000),
    firmwareVersion: 'v2.1.3',
    lastServiceDate: new Date('2025-10-15'),
    batteryHealth: 89,
    motorHealth: 92,
    totalRunHours: 980
  },
  {
    id: 'AGV-03',
    name: 'Gamma Unit',
    type: 'heavy',
    model: 'Heavy-X2',
    position: { x: 0, y: 0, z: 0 },
    status: 'charging',
    operationalMode: 'charging',
    battery: 18,
    speed: 0,
    heading: 0,
    distanceTraveled: 2100.8,
    temperature: 39,
    loadWeight: 0,
    isObstacleDetected: false,
    firmwareVersion: 'v2.0.1',
    lastServiceDate: new Date('2025-11-19'),
    batteryHealth: 72,
    motorHealth: 78,
    totalRunHours: 2100,
    maintenanceNotes: 'Battery replaced on Nov 19 due to low health'
  },
  {
    id: 'AGV-04',
    name: 'Delta Unit',
    type: 'mini_agv',
    model: 'Picker-X1',
    position: { x: 6, y: 10, z: 0 },
    status: 'error',
    operationalMode: 'locked',
    battery: 60,
    speed: 0,
    heading: 270,
    currentJob: {
      id: 'JOB-099',
      itemName: 'RTX 4080 GPU',
      quantity: 1,
      priority: 'medium',
      assignedAgv: 'AGV-04',
      pickupLocation: { x: 30, y: 1, z: 0 },
      dropLocation: { x: 10, y: 2, z: 0 },
      status: 'failed',
      createdAt: new Date('2025-11-22T08:00:00'),
      startedAt: new Date('2025-11-22T08:05:00'),
      estimatedTime: 12
    },
    distanceTraveled: 1876.2,
    temperature: 50,
    loadWeight: 1.3,
    isObstacleDetected: true,
    firmwareVersion: 'v2.1.3',
    lastServiceDate: new Date('2025-11-21'),
    batteryHealth: 68,
    motorHealth: 85,
    totalRunHours: 1876,
    maintenanceNotes: 'Wheel alignment error detected - needs maintenance check'
  },
  {
    id: 'AGV-05',
    name: 'Epsilon Unit',
    type: 'mini_agv',
    model: 'Picker-X1',
    position: { x: 9.0, y: 4.8, z: 0 },
    status: 'paused',
    operationalMode: 'manual',
    battery: 48,
    speed: 0,
    heading: 0,
    currentJob: {
      id: 'JOB-101',
      itemName: 'AirPods Pro',
      quantity: 10,
      priority: 'medium',
      assignedAgv: 'AGV-05',
      pickupLocation: { x: 20, y: 1, z: 0 },
      dropLocation: { x: 0, y: 0, z: 0 },
      status: 'pending',
      createdAt: new Date('2025-11-22T08:30:00'),
      estimatedTime: 6
    },
    distanceTraveled: 1543.7,
    temperature: 43,
    loadWeight: 0.5,
    isObstacleDetected: false,
    firmwareVersion: 'v2.1.3',
    lastServiceDate: new Date('2025-11-01'),
    batteryHealth: 84,
    motorHealth: 88,
    totalRunHours: 1543
  }
];

// Battery Telemetry Data
export const batteryTelemetry = [
  {
    agvId: 'AGV-01',
    voltage: 24.1,
    temperature: 42,
    health: 91,
    estimatedRuntime: '4.5 hrs',
    chargingStatus: 'Discharging'
  },
  {
    agvId: 'AGV-02',
    voltage: 23.8,
    temperature: 45,
    health: 89,
    estimatedRuntime: '3.1 hrs',
    chargingStatus: 'Discharging'
  },
  {
    agvId: 'AGV-03',
    voltage: 21.0,
    temperature: 39,
    health: 72,
    estimatedRuntime: 'Charging',
    chargingStatus: 'Charging'
  },
  {
    agvId: 'AGV-04',
    voltage: 22.8,
    temperature: 50,
    health: 68,
    estimatedRuntime: '2.0 hrs',
    chargingStatus: 'Discharging'
  },
  {
    agvId: 'AGV-05',
    voltage: 23.4,
    temperature: 43,
    health: 84,
    estimatedRuntime: '2.8 hrs',
    chargingStatus: 'Discharging'
  }
];

// Maintenance Logs
export const maintenanceLogs = [
  {
    id: 'maint-001',
    agvId: 'AGV-04',
    date: new Date('2025-11-21'),
    issue: 'Wheel alignment error',
    workDone: 'Realigned left motor, calibrated wheel sensors',
    technician: 'Arun',
    partsReplaced: ['Left motor sensor'],
    cost: 250,
    downtime: '2 hours'
  },
  {
    id: 'maint-002',
    agvId: 'AGV-03',
    date: new Date('2025-11-19'),
    issue: 'Low battery health',
    workDone: 'Battery replacement and calibration',
    technician: 'Ravi',
    partsReplaced: ['Battery pack X2'],
    cost: 1200,
    downtime: '4 hours'
  },
  {
    id: 'maint-003',
    agvId: 'AGV-01',
    date: new Date('2025-11-11'),
    issue: 'LIDAR misread',
    workDone: 'Cleaned sensor, recalibrated detection system',
    technician: 'Manoj',
    partsReplaced: [],
    cost: 80,
    downtime: '1 hour'
  }
];

// Job History
export const jobHistory = [
  {
    id: 'JOB-101',
    agvId: 'AGV-05',
    type: 'pick',
    itemName: 'AirPods Pro',
    pickupLocation: 'B1',
    dropLocation: 'Packing Zone',
    status: 'completed',
    duration: 12,
    startTime: new Date('2025-11-22T08:00:00'),
    endTime: new Date('2025-11-22T08:12:00'),
    priority: 'medium'
  },
  {
    id: 'JOB-102',
    agvId: 'AGV-02',
    type: 'pick',
    itemName: 'iPhone 17 Pro',
    pickupLocation: 'A1',
    dropLocation: 'Shipping Dock',
    status: 'in_progress',
    duration: 4,
    startTime: new Date('2025-11-22T09:05:00'),
    endTime: null,
    priority: 'high'
  },
  {
    id: 'JOB-099',
    agvId: 'AGV-04',
    type: 'restock',
    itemName: 'RTX 4080 GPU',
    pickupLocation: 'C1',
    dropLocation: 'A2',
    status: 'failed',
    duration: null,
    startTime: new Date('2025-11-22T08:05:00'),
    endTime: new Date('2025-11-22T08:15:00'),
    priority: 'medium',
    failureReason: 'Obstacle detected - wheel alignment issue'
  },
  {
    id: 'JOB-090',
    agvId: 'AGV-01',
    type: 'move',
    itemName: 'Type-C Cable',
    pickupLocation: 'B3',
    dropLocation: 'D5',
    status: 'completed',
    duration: 9,
    startTime: new Date('2025-11-22T07:00:00'),
    endTime: new Date('2025-11-22T07:09:00'),
    priority: 'low'
  }
];

// Event Logs
export const eventLogs = [
  {
    id: 'event-001',
    timestamp: new Date('2025-11-22T10:30:00'),
    agvId: 'AGV-04',
    eventType: 'obstacle_detected',
    message: 'AGV-04 detected obstacle at position (6, 10) - rerouting',
    severity: 'warning',
    resolved: false
  },
  {
    id: 'event-002',
    timestamp: new Date('2025-11-22T10:25:00'),
    agvId: 'AGV-02',
    eventType: 'path_change',
    message: 'AGV-02 taking alternate path due to human presence',
    severity: 'info',
    resolved: true
  },
  {
    id: 'event-003',
    timestamp: new Date('2025-11-22T10:15:00'),
    agvId: 'AGV-03',
    eventType: 'low_battery',
    message: 'AGV-03 returning to charge due to low battery (18%)',
    severity: 'warning',
    resolved: true
  },
  {
    id: 'event-004',
    timestamp: new Date('2025-11-22T10:00:00'),
    agvId: 'AGV-05',
    eventType: 'job_completed',
    message: 'AGV-05 job completed - returning home',
    severity: 'info',
    resolved: true
  },
  {
    id: 'event-005',
    timestamp: new Date('2025-11-22T09:45:00'),
    agvId: 'AGV-01',
    eventType: 'system_update',
    message: 'AGV-01 firmware updated to v2.1.3',
    severity: 'info',
    resolved: true
  }
];

// Real-time position stream simulation data
export const positionStreamData = [
  { agvId: 'AGV-01', x: 4.2, y: 7.5, heading: 90, speed: 0.0, timestamp: new Date() },
  { agvId: 'AGV-02', x: 11.1, y: 3.3, heading: 180, speed: 1.2, timestamp: new Date() },
  { agvId: 'AGV-03', x: 0, y: 0, heading: 0, speed: 0.0, timestamp: new Date() },
  { agvId: 'AGV-04', x: 6, y: 10, heading: 270, speed: 0.0, timestamp: new Date() },
  { agvId: 'AGV-05', x: 9.0, y: 4.8, heading: 0, speed: 0.0, timestamp: new Date() }
];

// Utility functions for data simulation
export const getAGVById = (agvId: string): AGV | undefined => {
  return realisticAGVFleet.find(agv => agv.id === agvId);
};

export const getBatteryTelemetry = (agvId: string) => {
  return batteryTelemetry.find(telemetry => telemetry.agvId === agvId);
};

export const getMaintenanceHistory = (agvId: string) => {
  return maintenanceLogs.filter(log => log.agvId === agvId);
};

export const getJobHistoryForAGV = (agvId: string) => {
  return jobHistory.filter(job => job.agvId === agvId);
};

export const getActiveEvents = () => {
  return eventLogs.filter(event => !event.resolved);
};

export const getRecentEvents = (limit: number = 10) => {
  return eventLogs
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};
