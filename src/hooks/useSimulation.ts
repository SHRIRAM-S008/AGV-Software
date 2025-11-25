import { useEffect, useRef, useCallback } from 'react';
import { useWarehouseStore } from '@/store/warehouseStore';
import { collisionDetector } from '@/utils/collisionDetection';
import { pathFinder } from '@/utils/pathfinding';

export const useSimulation = () => {
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());
  const isRunningRef = useRef<boolean>(false);
  
  const agvs = useWarehouseStore(state => state.agvs);
  const jobs = useWarehouseStore(state => state.jobs);
  const obstacles = useWarehouseStore(state => state.obstacles);
  const isSimulationPlaying = useWarehouseStore(state => state.isSimulationPlaying);
  const simulationSpeed = useWarehouseStore(state => state.simulationSpeed);
  
  const updateAGVPosition = useWarehouseStore(state => state.updateAGVPosition);
  const updateAGVStatus = useWarehouseStore(state => state.updateAGVStatus);
  const updateAGVBattery = useWarehouseStore(state => state.updateAGVBattery);
  const updateAGVPath = useWarehouseStore(state => state.updateAGVPath);
  const completeJob = useWarehouseStore(state => state.completeJob);
  const updateDashboardMetrics = useWarehouseStore(state => state.updateDashboardMetrics);

  const moveAGVs = useCallback(() => {
    // Prevent multiple animation loops
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    try {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      lastUpdateRef.current = now;

      const currentAgvs = useWarehouseStore.getState().agvs;
      const currentObstacles = useWarehouseStore.getState().obstacles;
      
      if (!isSimulationPlaying) {
        isRunningRef.current = false;
        return;
      }
      
      currentAgvs.forEach(agv => {
        if (agv.status !== 'moving' || !agv.path || agv.path.length === 0) {
          return;
        }

        // Move AGV along path
        const speed = agv.speed * simulationSpeed * deltaTime; // meters per second
        const targetPos = agv.path[0];
        
        // Calculate distance to target
        const dx = targetPos.x - agv.position.x;
        const dy = targetPos.y - agv.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= speed) {
          // Reached waypoint
          updateAGVPosition(agv.id, targetPos);
          
          // Remove reached waypoint from path
          const newPath = agv.path.slice(1);
          updateAGVPath(agv.id, newPath);
          
          if (newPath.length === 0) {
            // Check if reached destination
            if (agv.currentJob) {
              const jobEndPos = agv.currentJob.dropLocation;
              const jobDx = jobEndPos.x - agv.position.x;
              const jobDy = jobEndPos.y - agv.position.y;
              const jobDistance = Math.sqrt(jobDx * jobDx + jobDy);
              
              if (jobDistance <= 0.5) {
                // Job completed
                completeJob(agv.currentJob.id);
                updateAGVStatus(agv.id, 'idle');
              }
            } else {
              updateAGVStatus(agv.id, 'idle');
            }
          }
        } else {
          // Move towards waypoint
          const ratio = speed / distance;
          const newX = agv.position.x + dx * ratio;
          const newY = agv.position.y + dy * ratio;
          
          // Check for collisions before moving
          const testPos = { x: newX, y: newY, z: 0 };
          const isSafe = collisionDetector.isPositionSafe(testPos, currentAgvs, currentObstacles, agv.id);
          
          if (isSafe) {
            updateAGVPosition(agv.id, testPos);
          } else {
            // Stop if collision detected
            updateAGVStatus(agv.id, 'idle');
          }
        }

        // Update battery (slow drain when moving)
        if (agv.status === 'moving') {
          const batteryDrain = 0.1 * deltaTime * simulationSpeed; // 0.1% per second at 1x speed
          const newBattery = Math.max(0, agv.battery - batteryDrain);
          updateAGVBattery(agv.id, newBattery);
          
          // Auto-charge if battery is low
          if (newBattery < 20) {
            updateAGVStatus(agv.id, 'charging');
          }
        }
      });
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      isRunningRef.current = false;
    }
  }, [isSimulationPlaying, simulationSpeed, updateAGVPosition, updateAGVStatus, updateAGVBattery, completeJob, updateAGVPath]);

  const animate = useCallback(() => {
    if (!isSimulationPlaying) return;
    
    try {
      moveAGVs();
      updateDashboardMetrics();
    } catch (error) {
      console.error('Animation frame error:', error);
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isSimulationPlaying, moveAGVs, updateDashboardMetrics]);

  useEffect(() => {
    if (isSimulationPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSimulationPlaying, animate]);

  return {
    isSimulationPlaying,
    simulationSpeed
  };
};
