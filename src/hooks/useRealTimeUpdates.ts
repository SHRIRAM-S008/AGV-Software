import { useEffect, useRef, useCallback, useState } from 'react';
import { realisticAGVFleet, positionStreamData } from '@/data/agvData';

interface RealTimeUpdateHookOptions {
  enabled?: boolean;
  updateInterval?: number;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
}

export const useRealTimeUpdates = (options: RealTimeUpdateHookOptions = {}) => {
  const {
    enabled = true,
    updateInterval = 3000, // 3 seconds
    onConnectionChange,
    onError
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // Simulate real-time updates (in production, this would be WebSocket)
  const simulateRealTimeUpdate = useCallback(() => {
    try {
      // Simulate random AGV position updates for demonstration
      if (Math.random() > 0.7) { // 30% chance of position update
        const randomAGV = realisticAGVFleet[Math.floor(Math.random() * realisticAGVFleet.length)];
        if (randomAGV && randomAGV.status === 'moving') {
          // Small random position change to simulate movement
          const newX = Math.max(0, Math.min(50, 
            randomAGV.position.x + (Math.random() - 0.5) * 0.5));
          const newY = Math.max(0, Math.min(50, 
            randomAGV.position.y + (Math.random() - 0.5) * 0.5));
          
          // Update position in realistic data (in real app, this would update state)
          randomAGV.position = { x: newX, y: newY, z: 0 };
        }
      }

      // Simulate battery drain for active AGVs
      if (Math.random() > 0.8) { // 20% chance of battery update
        const activeAGVs = realisticAGVFleet.filter(agv => agv.status === 'moving');
        const randomAGV = activeAGVs[Math.floor(Math.random() * activeAGVs.length)];
        if (randomAGV && randomAGV.battery > 5) {
          randomAGV.battery = Math.max(5, randomAGV.battery - 1);
        }
      }

      if (!isConnectedRef.current) {
        isConnectedRef.current = true;
        onConnectionChange?.(true);
      }
    } catch (error) {
      console.error('Real-time update error:', error);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
      
      if (isConnectedRef.current) {
        isConnectedRef.current = false;
        onConnectionChange?.(false);
      }
    }
  }, [onConnectionChange, onError]);

  // Start/stop real-time updates
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial update
    simulateRealTimeUpdate();

    // Set up interval for periodic updates
    intervalRef.current = setInterval(simulateRealTimeUpdate, updateInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, updateInterval, simulateRealTimeUpdate]);

  // Manual update trigger
  const triggerUpdate = useCallback(() => {
    simulateRealTimeUpdate();
  }, [simulateRealTimeUpdate]);

  // Connection status
  const isConnected = isConnectedRef.current;

  return {
    isConnected,
    triggerUpdate,
    lastUpdate: new Date()
  };
};

// WebSocket hook for production use
export const useWebSocketUpdates = (url: string, options: RealTimeUpdateHookOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const { onConnectionChange, onError } = options;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setLastError(null);
        onConnectionChange?.(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'agv_position_update':
              // Update realistic AGV data
              const agv = realisticAGVFleet.find(a => a.id === data.agvId);
              if (agv) {
                agv.position = { ...data.position, z: data.position.z || 0 };
              }
              break;
            
            case 'agv_status_update':
              // Update AGV status
              const targetAGV = realisticAGVFleet.find(a => a.id === data.agvId);
              if (targetAGV) {
                targetAGV.status = data.status;
              }
              break;
            
            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onConnectionChange?.(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        const wsError = new Error('WebSocket connection error');
        setLastError(wsError);
        onError?.(wsError);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      const wsError = error instanceof Error ? error : new Error('Unknown WebSocket error');
      setLastError(wsError);
      onError?.(wsError);
    }
  }, [url, onConnectionChange, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    lastError,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

// Simulated real-time data generator for development
export const useSimulatedRealTimeData = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update AGV positions for moving AGVs
      realisticAGVFleet.forEach(agv => {
        if (agv.status === 'moving' && Math.random() > 0.5) {
          const pathIndex = Math.floor(Math.random() * (agv.path?.length || 1));
          if (agv.path && agv.path[pathIndex]) {
            agv.position = { ...agv.path[pathIndex], z: 0 };
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);
};
