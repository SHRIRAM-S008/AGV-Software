import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AGV } from '@/types/agv';
import { useWarehouseStore } from '@/store/warehouseStore';
import * as THREE from 'three';

interface AGVModelProps {
  agv: AGV;
}

export const AGVModel = ({ agv }: AGVModelProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const targetPosition = useRef(new THREE.Vector3(agv.position.x, 0.3, agv.position.y));
  const currentPathIndex = useRef(0);
  const { isSimulationPlaying, simulationSpeed } = useWarehouseStore();

  // Update target position when AGV position changes
  useEffect(() => {
    targetPosition.current.set(agv.position.x, 0.3, agv.position.y);
  }, [agv.position]);

  // Animation frame update
  useFrame(() => {
    if (!meshRef.current || !isSimulationPlaying) return;

    // Smooth movement with simulation speed
    const current = meshRef.current.position;
    const target = targetPosition.current;
    const speed = 0.05 * simulationSpeed;

    current.lerp(target, speed);

    // Update light position to follow AGV
    if (lightRef.current) {
      lightRef.current.position.set(current.x, current.y + 0.5, current.z);
    }

    // Rotation towards movement
    if (agv.path && agv.path.length > 1 && currentPathIndex.current < agv.path.length - 1) {
      const nextPoint = agv.path[currentPathIndex.current + 1];
      const direction = new THREE.Vector3(
        nextPoint.x - current.x,
        0,
        nextPoint.y - current.z
      );

      if (direction.length() > 0.1) {
        const angle = Math.atan2(direction.x, direction.z);
        meshRef.current.rotation.y = angle;
      } else {
        currentPathIndex.current++;
      }
    }
  });

  // Get color based on AGV status
  const getStatusColor = useMemo(() => {
    switch (agv.status) {
      case 'moving': return '#10b981';
      case 'charging': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  }, [agv.status]);

  return (
    <group ref={meshRef} position={[agv.position.x, 0.3, agv.position.y]}>
      {/* AGV Body */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.4, 0.8]} />
        <meshStandardMaterial
          color={getStatusColor()}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Top Indicator */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Direction Indicator */}
      <mesh position={[0, 0.25, 0.5]} castShadow>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
      </mesh>

      {/* Wheels */}
      {[[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.15, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* Follow light */}
      <pointLight
        ref={lightRef}
        intensity={1.5}
        distance={5}
        color={getStatusColor()}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-far={10}
        shadow-camera-near={0.1}
      />

      {/* Label */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};