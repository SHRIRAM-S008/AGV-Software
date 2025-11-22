import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AGV } from "@/types/agv";
import { useWarehouseStore } from "@/store/warehouseStore";
import * as THREE from "three";

type WarehouseState = ReturnType<typeof useWarehouseStore.getState>;
const selectSimulationPlaying = (state: WarehouseState) => state.isSimulationPlaying;
const selectSimulationSpeed = (state: WarehouseState) => state.simulationSpeed;

interface AGVModelProps {
  agv: AGV;
  isSimulationPlaying?: boolean;
  simulationSpeed?: number;
}

const STATUS_COLORS: Record<AGV["status"], string> = {
  moving: "#34f5c6",
  charging: "#f6c343",
  error: "#ff5a5f",
  idle: "#8e99a8",
};

export const AGVModel = ({ agv, isSimulationPlaying, simulationSpeed }: AGVModelProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const targetPosition = useRef(new THREE.Vector3(agv.position.x, 0, agv.position.y));
  const lastDirection = useRef(new THREE.Vector3(1, 0, 0));
  const currentPathIndex = useRef(0);

  // Get simulation state from store if not provided as props
  const storeSimulationPlaying = useWarehouseStore(selectSimulationPlaying);
  const storeSimulationSpeed = useWarehouseStore(selectSimulationSpeed);
  
  const simPlaying = isSimulationPlaying ?? storeSimulationPlaying;
  const simSpeed = simulationSpeed ?? storeSimulationSpeed;

  // DISABLED: Stop updating targetPosition to prevent continuous movement
// useEffect(() => {
//   targetPosition.current.set(agv.position.x, 0.25, agv.position.y);
// }, [agv.position]);

  // COMPLETELY DISABLED: No animation at all
  useFrame((_, delta) => {
    return; // Exit immediately - no movement whatsoever
  });

  const accentColor = useMemo(
    () => STATUS_COLORS[agv.status] ?? STATUS_COLORS.idle,
    [agv.status]
  );

  return (
    <group ref={meshRef} position={[agv.position.x, 0.25, agv.position.y]}>
      {/* Shadow catcher / underglow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[0.95, 48]} />
        <meshBasicMaterial color="#000" opacity={0.35} transparent />
      </mesh>

      {/* Body shell */}
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.42, 0.85]} />
        <meshStandardMaterial
          color="#050608"
          metalness={0.65}
          roughness={0.28}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Upper deck */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.15, 0.15, 0.7]} />
        <meshStandardMaterial
          color="#0d1016"
          metalness={0.5}
          roughness={0.3}
          envMapIntensity={1}
        />
      </mesh>

      {/* Status LED ring */}
      <mesh position={[0, 0.36, 0]}>
        <torusGeometry args={[0.35, 0.04, 16, 48]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Sensor mast */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.14, 24]} />
        <meshStandardMaterial color="#121720" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Front lidar pod */}
      <mesh position={[0, 0.37, 0.42]}>
        <boxGeometry args={[0.28, 0.12, 0.16]} />
        <meshStandardMaterial
          color="#141d24"
          emissive="#00d4ff"
          emissiveIntensity={0.35}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Direction marker */}
      <mesh position={[0, 0.23, 0.48]}>
        <coneGeometry args={[0.12, 0.26, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Wheels with tread */}
      {[
        [-0.45, -0.28],
        [0.45, -0.28],
        [-0.45, 0.28],
        [0.45, 0.28],
      ].map(([x, z], i) => (
        <mesh key={`wheel-${i}`} position={[x, -0.09, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}

      {/* Undercarriage glow */}
      <mesh position={[0, 0.05, 0]}>
        <ringGeometry args={[0.4, 0.65, 32]} />
        <meshBasicMaterial
          color={accentColor}
          opacity={0.2}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Following light */}
      <pointLight
        ref={lightRef}
        intensity={1.8}
        distance={4}
        color={accentColor}
        decay={2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-far={10}
        shadow-camera-near={0.1}
      />
    </group>
  );
};