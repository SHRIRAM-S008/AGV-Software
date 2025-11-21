// src/store/warehouseStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AGV, Job, Obstacle, WarehouseState, AnalyticsData } from '@/types/agv';
import { pathFinder } from '@/utils/pathfinding';
import { collisionDetector } from '@/utils/collisionDetection';

// -----------------------------
// 1. INITIAL DATA (MOVED TO CONSTANTS FOR REUSABILITY)
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
    position: { x: 2, y: 28, z: 0 },
    status: 'idle',
    battery: 90,
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

// -----------------------------
// 2. SLICE TYPES
// -----------------------------
interface AGVSlice {
  agvs: AGV[];
  updateAGVPosition: (agvId: string, position: { x: number; y: number; z: number }) => void;
  updateAGVStatus: (agvId: string, status: AGV['status']) => void;
  resetAGVs: () => void;
}

interface JobSlice {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'status'>) => void;
  updateJobStatus: (jobId: string, status: Job['status']) => void;
  assignJobToAGV: (jobId: string) => void;
  completeJob: (jobId: string) => void;
  resetJobs: () => void;
}

interface ObstacleSlice {
  obstacles: Obstacle[];
  resetObstacles: () => void;
}

interface AnalyticsSlice {
  analytics: AnalyticsData | null;
  updateAnalytics: () => void;
  resetAnalytics: () => void;
}

interface SimulationSlice {
  isSimulationPlaying: boolean;
  simulationSpeed: number;
  setSimulationPlaying: (playing: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  resetSimulation: () => void;
}

// -----------------------------
// 3. COMBINED STATE TYPE
// -----------------------------
type WarehouseStore = AGVSlice & JobSlice & ObstacleSlice & AnalyticsSlice & SimulationSlice;

// -----------------------------
// 4. STORE IMPLEMENTATION
// -----------------------------
export const useWarehouseStore = create<WarehouseStore>()(
  devtools((set, get) => ({
    // ---------- AGV SLICE ----------
    agvs: INITIAL_AGVS,
    updateAGVPosition: (agvId, position) => {
      set((state: WarehouseStore) => ({
        agvs: state.agvs.map((agv) =>
          agv.id === agvId ? { ...agv, position } : agv
        ),
      }));
    },
    updateAGVStatus: (agvId, status) => {
      set((state: WarehouseStore) => ({
        agvs: state.agvs.map((agv) =>
          agv.id === agvId ? { ...agv, status } : agv
        ),
      }));
    },
    resetAGVs: () => {
      set({ agvs: INITIAL_AGVS });
    },

    // ---------- JOB SLICE ----------
    jobs: [],
    addJob: (jobData) => {
      const newJob: Job = {
        ...jobData,
        id: `JOB-${Date.now()}`,
        createdAt: new Date(),
        status: 'pending',
      };
      set((state: WarehouseStore) => ({ jobs: [...state.jobs, newJob] }));
    },
    updateJobStatus: (jobId, status) => {
      set((state: WarehouseStore) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId ? { ...job, status } : job
        ),
      }));
    },
    assignJobToAGV: (jobId) => {
      const state = get();
      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return;

      const availableAgv = state.agvs
        .filter((a) => a.status === 'idle' && a.battery > 20)
        .sort((a, b) => {
          const distA = pathFinder.calculateDistance(a.position, job.pickupLocation);
          const distB = pathFinder.calculateDistance(b.position, job.pickupLocation);
          return distA - distB || b.battery - a.battery;
        })[0];

      if (!availableAgv) {
        console.warn(`No available AGV for job ${jobId}`);
        return;
      }

      let path = pathFinder.calculatePath(
        availableAgv.position,
        job.pickupLocation,
        state.obstacles
      );

      const testAgv = { ...availableAgv, path };
      const collidingAgvs = collisionDetector.findCollidingAGVs(testAgv, state.agvs);

      if (collidingAgvs.length > 0) {
        console.warn(`Collision detected for ${availableAgv.name}! Adjusting path...`);
        path = pathFinder.adjustPathForCollision(path, collidingAgvs);
      }

      set((state: WarehouseStore) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? { ...j, status: 'in-progress', startedAt: new Date(), assignedAgv: availableAgv.id }
            : j
        ),
        agvs: state.agvs.map((a) =>
          a.id === availableAgv.id
            ? { ...a, status: 'moving', currentJob: job, path }
            : a
        ),
      }));
    },
    completeJob: (jobId) => {
      const state = get();
      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return;

      set((state: WarehouseStore) => ({
        jobs: state.jobs.map((j) =>
          j.id === jobId
            ? { ...j, status: 'completed', completedAt: new Date() }
            : j
        ),
        agvs: state.agvs.map((a) =>
          a.currentJob?.id === jobId
            ? { ...a, status: 'idle', currentJob: undefined, path: [] }
            : a
        ),
      }));

      setTimeout(() => get().updateAnalytics(), 50);
    },
    resetJobs: () => {
      set({ jobs: [] });
    },

    // ---------- OBSTACLE SLICE ----------
    obstacles: INITIAL_OBSTACLES,
    resetObstacles: () => {
      set({ obstacles: INITIAL_OBSTACLES });
    },

    // ---------- ANALYTICS SLICE ----------
    analytics: null,
    updateAnalytics: () => {
      const state = get();
      const completedJobs = state.jobs.filter((j) => j.status === 'completed');
      const failedJobs = state.jobs.filter((j) => j.status === 'failed');

      const completionTimes = completedJobs
        .filter((j) => j.startedAt && j.completedAt)
        .map((j) => {
          const completedAt = j.completedAt ?? new Date();
          const startedAt = j.startedAt ?? completedAt;
          return {
            timestamp: completedAt,
            duration: (completedAt.getTime() - startedAt.getTime()) / 1000,
            jobId: j.id,
          };
        })
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      const averageCompletionTime =
        completionTimes.length > 0
          ? completionTimes.reduce((sum, ct) => sum + ct.duration, 0) / completionTimes.length
          : 0;

      const jobsByPriority = completedJobs.reduce(
        (acc, job) => {
          acc[job.priority] += 1;
          return acc;
        },
        { urgent: 0, high: 0, medium: 0, low: 0 } as Record<Job['priority'], number>
      );

      const hourlyJobCount = Array.from({ length: 24 }, (_, hour) => {
        const count = completedJobs.filter((job) => {
          if (!job.completedAt) return false;
          return job.completedAt.getHours() === hour;
        }).length;
        return { hour, count };
      });

      const totalDistanceTraveled = state.agvs.reduce(
        (sum, agv) => sum + agv.distanceTraveled,
        0
      );

      const chronologicallyRelevantJobs = [...state.jobs]
        .filter((job) => job.status === 'completed' || job.status === 'failed')
        .sort((a, b) => {
          const aTime = (a.completedAt ?? a.createdAt).getTime();
          const bTime = (b.completedAt ?? b.createdAt).getTime();
          return bTime - aTime;
        });

      let streakCount = 0;
      for (const job of chronologicallyRelevantJobs) {
        if (job.status === 'completed') {
          streakCount += 1;
        } else {
          break;
        }
      }

      const streak =
        streakCount === 0
          ? 'Fresh start'
          : `${streakCount} job${streakCount === 1 ? '' : 's'} without failure`;

      const previous = state.analytics ?? INITIAL_ANALYTICS;

      const completionTrend = Number(
        (averageCompletionTime - (previous?.averageCompletionTime ?? 0)).toFixed(2)
      );

      const distanceTrend = Number(
        (totalDistanceTraveled - (previous?.totalDistanceTraveled ?? 0)).toFixed(2)
      );

      const trimmedCompletionTimes =
        completionTimes.length > 40 ? completionTimes.slice(-40) : completionTimes;

      const newAnalytics: AnalyticsData = {
        ...previous,
        totalJobsCompleted: completedJobs.length,
        totalJobsFailed: failedJobs.length,
        averageCompletionTime: Number(averageCompletionTime.toFixed(2)),
        totalDistanceTraveled: Number(totalDistanceTraveled.toFixed(2)),
        jobsByPriority,
        completionTimes: trimmedCompletionTimes,
        hourlyJobCount,
        streak,
        completionTrend,
        distanceTrend,
        lastUpdated: new Date(),
      };

      set({ analytics: newAnalytics });
    },
    resetAnalytics: () => {
      set({ analytics: INITIAL_ANALYTICS });
    },

    // ---------- SIMULATION SLICE ----------
    isSimulationPlaying: true,
    simulationSpeed: 1,
    warehouseSize: INITIAL_WAREHOUSE_SIZE,
    setSimulationPlaying: (playing) => {
      set({ isSimulationPlaying: playing });
    },
    setSimulationSpeed: (speed) => {
      if (speed > 0) set({ simulationSpeed: speed });
    },
    resetSimulation: () => {
      set({
        agvs: INITIAL_AGVS,
        jobs: [],
        obstacles: INITIAL_OBSTACLES,
        analytics: INITIAL_ANALYTICS,
        isSimulationPlaying: true,
        simulationSpeed: 1,
        warehouseSize: INITIAL_WAREHOUSE_SIZE,
      });
    },
  }))
);