// src/store/warehouseStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AGV, Job, Obstacle, Position, DashboardMetrics, AnalyticsData } from '@/types/agv';
import { pathFinder } from '@/utils/pathfinding';
import { collisionDetector } from '@/utils/collisionDetection';

// -----------------------------
// 1. INITIAL DATA
// -----------------------------
const INITIAL_OBSTACLES: Obstacle[] = [
  // North wall racks
  { id: 'rack-1', type: 'rack', position: { x: 5, y: 28, z: 0 }, size: { width: 2, height: 4, depth: 1 } },
  { id: 'rack-2', type: 'rack', position: { x: 15, y: 28, z: 0 }, size: { width: 2, height: 4, depth: 1 } },
  { id: 'rack-3', type: 'rack', position: { x: 25, y: 28, z: 0 }, size: { width: 2, height: 4, depth: 1 } },

  // South human zone
  { id: 'human-1', type: 'human', position: { x: 10, y: 2, z: 0 }, size: { width: 0.5, height: 1.8, depth: 0.5 }, isMoving: true },

  // East box storage
  { id: 'box-1', type: 'box', position: { x: 28, y: 10, z: 0 }, size: { width: 1, height: 1, depth: 1 } },
  { id: 'box-2', type: 'box', position: { x: 28, y: 15, z: 0 }, size: { width: 1, height: 1, depth: 1 } },
  { id: 'box-3', type: 'box', position: { x: 28, y: 20, z: 0 }, size: { width: 1, height: 1, depth: 1 } },
];

const INITIAL_AGVS: AGV[] = [
  {
    id: 'AGV-1',
    name: 'AGV Alpha',
    position: { x: 2, y: 2, z: 0 },
    status: 'idle',
    battery: 100,
    speed: 10,
    path: [],
    distanceTraveled: 0,
  },
  {
    id: 'AGV-2',
    name: 'AGV Beta',
    position: { x: 28, y: 2, z: 0 },
    status: 'idle',
    battery: 95,
    speed: 10,
    path: [],
    distanceTraveled: 0,
  },
  {
    id: 'AGV-3',
    name: 'AGV Gamma',
    position: { x: 15, y: 15, z: 0 },
    status: 'idle',
    battery: 85,
    speed: 10,
    path: [],
    distanceTraveled: 0,
  },
];

const INITIAL_ANALYTICS: AnalyticsData = {
  totalJobsCompleted: 0,
  totalJobsFailed: 0,
  averageCompletionTime: 0,
  totalDistanceTraveled: 0,
  agvUtilization: {
    idleTime: 0,
    activeTime: 0,
    chargingTime: 0,
  },
  jobsByPriority: {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  },
  completionTimes: [],
  hourlyJobCount: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
  aggregateWindow: 'Last 24h',
  streak: 'Fresh start',
  completionTrend: 0,
  distanceTrend: 0,
};

const INITIAL_WAREHOUSE_SIZE = { width: 30, length: 30, height: 10 };

const INITIAL_DASHBOARD_METRICS: DashboardMetrics = {
  activeAGVs: 0,
  totalAGVs: INITIAL_AGVS.length,
  jobsPending: 0,
  jobsActive: 0,
  jobsCompleted: 0,
  systemHealth: 'good',
  averageBatteryLevel: 100,
  totalDistanceTraveled: 0,
  totalJobs: 0,
  totalObstacles: INITIAL_OBSTACLES.length,
  averageAGVUtilization: 0,
};

// -----------------------------
// 2. STORE TYPE DEFINITIONS
// -----------------------------
interface WarehouseStore {
  // State
  agvs: AGV[];
  jobs: Job[];
  obstacles: Obstacle[];
  analytics: AnalyticsData | null;
  dashboardMetrics: DashboardMetrics;
  isSimulationPlaying: boolean;
  simulationSpeed: number;
  warehouseSize: { width: number; length: number; height: number };
  selectedAgvId: string | null;
  viewMode: '2d' | '3d';

  // AGV Actions
  addAGV: (agv: Omit<AGV, 'id'>) => void;
  updateAGVPosition: (agvId: string, position: Position) => void;
  updateAGVStatus: (agvId: string, status: AGV['status']) => void;
  updateAGVBattery: (agvId: string, battery: number) => void;
  assignJobToAGV: (agvId: string, jobId: string) => void;
  completeJob: (jobId: string) => void;
  removeAGV: (agvId: string) => void;

  // Job Actions
  addJob: (job: Omit<Job, 'status' | 'id' | 'createdAt'>) => void;
  updateJobStatus: (jobId: string, status: Job['status']) => void;
  removeJob: (jobId: string) => void;
  clearCompletedJobs: () => void;

  // Obstacle Actions
  addObstacle: (obstacle: Omit<Obstacle, 'id'>) => void;
  removeObstacle: (obstacleId: string) => void;
  clearObstacles: () => void;

  // Analytics Actions
  updateAnalytics: () => void;
  resetAnalytics: () => void;

  // Dashboard Actions
  updateDashboardMetrics: () => void;

  // Simulation Actions
  setSimulationPlaying: (playing: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setSelectedAgvId: (agvId: string | null) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  resetSimulation: () => void;
}

// -----------------------------
// 3. STORE IMPLEMENTATION
// -----------------------------
export const useWarehouseStore = create<WarehouseStore>()(
  devtools(
    (set, get) => ({
      // ---------- INITIAL STATE ----------
      agvs: [...INITIAL_AGVS],
      jobs: [],
      obstacles: [...INITIAL_OBSTACLES],
      analytics: { ...INITIAL_ANALYTICS },
      dashboardMetrics: { ...INITIAL_DASHBOARD_METRICS },
      isSimulationPlaying: false,
      simulationSpeed: 1,
      warehouseSize: { ...INITIAL_WAREHOUSE_SIZE },
      selectedAgvId: null,
      viewMode: '3d',

      // ---------- AGV ACTIONS ----------
      addAGV: (agvData) => {
        const newAGV: AGV = {
          ...agvData,
          id: `AGV-${Date.now()}`,
        };
        set((state) => ({ agvs: [...state.agvs, newAGV] }));
      },

      updateAGVPosition: (agvId, position) => {
        set((state) => ({
          agvs: state.agvs.map((agv) =>
            agv.id === agvId ? { ...agv, position } : agv
          ),
        }));
      },

      updateAGVStatus: (agvId, status) => {
        set((state) => ({
          agvs: state.agvs.map((agv) =>
            agv.id === agvId ? { ...agv, status } : agv
          ),
        }));
      },

      updateAGVBattery: (agvId, battery) => {
        set((state) => ({
          agvs: state.agvs.map((agv) =>
            agv.id === agvId ? { ...agv, battery } : agv
          ),
        }));
      },

      assignJobToAGV: (agvId, jobId) => {
        set((state) => {
          const agv = state.agvs.find((a) => a.id === agvId);
          const job = state.jobs.find((j) => j.id === jobId);
          
          if (!agv || !job) return state;

          // Generate path from AGV position to pickup to dropoff
          const pathToPickup = pathFinder.calculatePath(agv.position, job.pickupLocation, state.obstacles);
          const pathToDropoff = pathFinder.calculatePath(job.pickupLocation, job.dropLocation, state.obstacles);
          const fullPath = [...pathToPickup, ...pathToDropoff.slice(1)];

          return {
            agvs: state.agvs.map((a) =>
              a.id === agvId
                ? { ...a, currentJob: job, path: fullPath, status: 'moving' as const }
                : a
            ),
            jobs: state.jobs.map((j) =>
              j.id === jobId ? { ...j, status: 'in-progress' as const, assignedAgv: agvId } : j
            ),
          };
        });
      },

      completeJob: (jobId) => {
        set((state) => {
          const job = state.jobs.find((j) => j.id === jobId);
          if (!job) return state;

          // Update job status
          const updatedJobs = state.jobs.map((j) =>
            j.id === jobId
              ? { ...j, status: 'completed' as const, completedAt: new Date() }
              : j
          );

          // Clear AGV job and path
          const updatedAgvs = state.agvs.map((agv) =>
            agv.currentJob?.id === jobId
              ? { ...agv, currentJob: undefined, path: [], status: 'idle' as const }
              : agv
          );

          return { jobs: updatedJobs, agvs: updatedAgvs };
        });

        // Update analytics asynchronously
        Promise.resolve().then(() => get().updateAnalytics());
      },

      removeAGV: (agvId) => {
        set((state) => ({
          agvs: state.agvs.filter((agv) => agv.id !== agvId),
        }));
      },

      // ---------- JOB ACTIONS ----------
      addJob: (jobData) => {
        // Basic validation
        if (!jobData.pickupLocation || !jobData.dropLocation) {
          console.warn('addJob: pickupLocation and dropLocation are required. Job not added.', jobData);
          return;
        }
        if (!jobData.priority) {
          jobData.priority = 'medium' as Job['priority'];
        }

        const newJob: Job = {
          ...jobData,
          id: `JOB-${Date.now()}`,
          createdAt: new Date(),
          status: 'pending',
        };

        set((state) => ({ jobs: [...state.jobs, newJob] }));
      },

      updateJobStatus: (jobId, status) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId ? { ...job, status } : job
          ),
        }));
      },

      removeJob: (jobId) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== jobId),
        }));
      },

      clearCompletedJobs: () => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.status !== 'completed'),
        }));
      },

      // ---------- OBSTACLE ACTIONS ----------
      addObstacle: (obstacleData) => {
        const newObstacle: Obstacle = {
          ...obstacleData,
          id: `OBSTACLE-${Date.now()}`,
        };
        set((state) => ({ obstacles: [...state.obstacles, newObstacle] }));
      },

      removeObstacle: (obstacleId) => {
        set((state) => ({
          obstacles: state.obstacles.filter((obstacle) => obstacle.id !== obstacleId),
        }));
      },

      clearObstacles: () => {
        set({ obstacles: [] });
      },

      // ---------- ANALYTICS ACTIONS ----------
      updateAnalytics: () => {
        const state = get();
        const completedJobs = state.jobs.filter(job => job.status === 'completed');
        const failedJobs = state.jobs.filter(job => job.status === 'failed');
        const totalJobs = state.jobs.length;
        const activeAGVs = state.agvs.filter(agv => agv.status === 'moving').length;
        const idleAGVs = state.agvs.filter(agv => agv.status === 'idle').length;
        const chargingAGVs = state.agvs.filter(agv => agv.status === 'charging').length;
        
        // Calculate jobs by priority
        const jobsByPriority = state.jobs.reduce((acc, job) => {
          acc[job.priority] = (acc[job.priority] || 0) + 1;
          return acc;
        }, { urgent: 0, high: 0, medium: 0, low: 0 });
        
        const newAnalytics = {
          ...state.analytics,
          totalJobsCompleted: completedJobs.length,
          totalJobsFailed: failedJobs.length,
          totalDistanceTraveled: state.agvs.reduce((sum, agv) => sum + (agv.distanceTraveled || 0), 0),
          averageCompletionTime: completedJobs.length > 0 
            ? completedJobs.reduce((sum, job) => {
                const duration = job.completedAt && job.startedAt 
                  ? (job.completedAt.getTime() - job.startedAt.getTime()) / 1000 
                  : 0;
                return sum + duration;
              }, 0) / completedJobs.length 
            : 0,
          agvUtilization: {
            idleTime: idleAGVs * 100, // Simplified calculation
            activeTime: activeAGVs * 100,
            chargingTime: chargingAGVs * 100,
          },
          jobsByPriority,
          completionTimes: completedJobs.map(job => {
            const duration = job.completedAt && job.startedAt 
              ? (job.completedAt.getTime() - job.startedAt.getTime()) / 1000 
              : 0;
            return { 
              jobId: job.id, 
              duration,
              timestamp: job.completedAt || new Date()
            };
          }),
          lastUpdated: new Date(),
        };

        set({ analytics: newAnalytics });
      },

      resetAnalytics: () => {
        set({ analytics: { ...INITIAL_ANALYTICS } });
      },

      // ---------- DASHBOARD ACTIONS ----------
      updateDashboardMetrics: () => {
        const state = get();
        const activeAGVs = state.agvs.filter(agv => agv.status === 'moving' || agv.status === 'charging').length;
        const jobsPending = state.jobs.filter(job => job.status === 'pending').length;
        const jobsActive = state.jobs.filter(job => job.status === 'in-progress').length;
        const jobsCompleted = state.jobs.filter(job => job.status === 'completed').length;
        const averageBatteryLevel = state.agvs.reduce((sum, agv) => sum + agv.battery, 0) / state.agvs.length;
        const totalDistanceTraveled = state.agvs.reduce((sum, agv) => sum + (agv.distanceTraveled || 0), 0);
        
        // Determine system health
        let systemHealth: 'good' | 'warning' | 'critical' = 'good';
        if (averageBatteryLevel < 20) systemHealth = 'critical';
        else if (averageBatteryLevel < 50 || activeAGVs === 0) systemHealth = 'warning';
        
        set({
          dashboardMetrics: {
            activeAGVs,
            totalAGVs: state.agvs.length,
            jobsPending,
            jobsActive,
            jobsCompleted,
            systemHealth,
            averageBatteryLevel: Math.round(averageBatteryLevel),
            totalDistanceTraveled: Math.round(totalDistanceTraveled),
            totalJobs: state.jobs.length,
            totalObstacles: state.obstacles.length,
            averageAGVUtilization: Math.round((activeAGVs / state.agvs.length) * 100),
          }
        });
      },

      // ---------- SIMULATION ACTIONS ----------
      setSimulationPlaying: (playing) => {
        set({ isSimulationPlaying: playing });
      },

      setSimulationSpeed: (speed) => {
        if (speed > 0) set({ simulationSpeed: speed });
      },

      setSelectedAgvId: (agvId) => {
        set({ selectedAgvId: agvId });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      resetSimulation: () => {
        set({
          agvs: [...INITIAL_AGVS],
          jobs: [],
          obstacles: [...INITIAL_OBSTACLES],
          analytics: { ...INITIAL_ANALYTICS },
          dashboardMetrics: { ...INITIAL_DASHBOARD_METRICS },
          isSimulationPlaying: false,
          simulationSpeed: 1,
          warehouseSize: { ...INITIAL_WAREHOUSE_SIZE },
          selectedAgvId: null,
          viewMode: '3d',
        });
      },
    }),
    { name: 'warehouse-store' }
  )
);
