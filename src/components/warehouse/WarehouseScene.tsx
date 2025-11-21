import { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  ContactShadows,
  Html,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei';
import { shallow } from 'zustand/shallow';
import { useWarehouseStore } from '@/store/warehouseStore';
import { AGVModel } from './AGVModel';
import { ObstacleModel } from './ObstacleModel';
import { PathLine } from './PathLine';
import type { AGV } from '@/types/agv';

const selectWarehouseState = (state: ReturnType<typeof useWarehouseStore.getState>) => ({
  agvs: state.agvs,
  obstacles: state.obstacles,
  warehouseSize: state.warehouseSize,
  isSimulationPlaying: state.isSimulationPlaying,
});

export const WarehouseScene = () => {
  const { agvs, obstacles, warehouseSize, isSimulationPlaying } = useWarehouseStore(selectWarehouseState, shallow);
  const [selectedAgvId, setSelectedAgvId] = useState<string | null>(null);

  const handleSceneClick = useCallback(() => {
    setSelectedAgvId(null);
  }, []);

  const handleAgvSelect = useCallback((agvId: string) => {
    setSelectedAgvId((prev) => (prev === agvId ? null : agvId));
  }, []);

  const agvMap = useMemo(
    () =>
      agvs.map((agv) => (
        <InteractiveAGV
          key={agv.id}
          agv={agv}
          isSelected={agv.id === selectedAgvId}
          onSelect={handleAgvSelect}
        />
      )),
    [agvs, handleAgvSelect, selectedAgvId]
  );

  const obstacleMap = useMemo(
    () => obstacles.map((obstacle) => <ObstacleModel key={obstacle.id} obstacle={obstacle} />),
    [obstacles]
  );

  return (
    <div className="w-full h-full rounded-lg border border-border bg-background/80 backdrop-blur">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={isSimulationPlaying ? 'always' : 'demand'}
        onPointerMissed={handleSceneClick}
        camera={{ position: [20, 24, 20], fov: 55, near: 0.1, far: 200 }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents debounce={200} />

        <PerspectiveCamera makeDefault position={[18, 22, 18]} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={12}
          maxDistance={65}
          maxPolarAngle={Math.PI / 2.15}
          dampingFactor={0.08}
        />

        <SceneLighting />

        <Grid
          args={[warehouseSize.width, warehouseSize.length]}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#1f3847"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#00bcd4"
          fadeDistance={50}
          fadeStrength={1}
          position={[warehouseSize.width / 2, 0, warehouseSize.length / 2]}
        />

        <FloorPlane size={warehouseSize} />
        <WarehouseWalls size={warehouseSize} />

        {agvMap}
        {selectedAgvId && <AGVSelectionRing agv={agvs.find((a) => a.id === selectedAgvId)!} />}

        {obstacleMap}

        <ContactShadows
          position={[warehouseSize.width / 2, -0.5, warehouseSize.length / 2]}
          opacity={0.5}
          scale={40}
          blur={1.5}
          far={8}
        />
      </Canvas>
    </div>
  );
};

/* ---------- Scene Lighting ---------- */
const SceneLighting = () => (
  <>
    <ambientLight intensity={0.35} />
    <directionalLight
      position={[25, 35, 20]}
      intensity={0.85}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-far={70}
      shadow-camera-near={5}
    />
    <hemisphereLight args={['#bcdfff', '#112233', 0.35]} />
    <pointLight position={[-10, 18, -12]} intensity={0.4} decay={2} />
  </>
);

/* ---------- Floor ---------- */
const FloorPlane = ({ size }: { size: { width: number; length: number } }) => (
  <mesh
    receiveShadow
    rotation={[-Math.PI / 2, 0, 0]}
    position={[size.width / 2, -0.02, size.length / 2]}
  >
    <planeGeometry args={[size.width, size.length]} />
    <meshStandardMaterial color="#07121c" metalness={0.1} roughness={0.95} />
  </mesh>
);

/* ---------- Interactive AGV ---------- */
const InteractiveAGV = ({
  agv,
  isSelected,
  onSelect,
}: {
  agv: AGV;
  isSelected: boolean;
  onSelect: (agvId: string) => void;
}) => {
  const handlePointerDown = useCallback(
    (event: THREE.Event) => {
      event.stopPropagation();
      onSelect(agv.id);
    },
    [agv.id, onSelect]
  );

  const isMoving = agv.status === 'moving';

  return (
    <group
      position={[agv.position.x, agv.position.z ?? 0, agv.position.y]}
      scale={isSelected ? 1.08 : 1}
      onPointerDown={handlePointerDown}
    >
      <AGVModel agv={agv} />
      {agv.path && agv.path.length > 1 && <PathLine path={agv.path} />}
      <SelectionBillboard agv={agv} isSelected={isSelected} />
      {isMoving && <AGVVelocityTrail />}
    </group>
  );
};

/* ---------- Selection Billboard ---------- */
const SelectionBillboard = ({ agv, isSelected }: { agv: AGV; isSelected: boolean }) => {
  if (!isSelected) return null;

  return (
    <Html
      position={[0, 2.2, 0]}
      center
      className="pointer-events-none"
      style={{
        background: 'rgba(17, 25, 40, 0.72)',
        borderRadius: '12px',
        padding: '6px 10px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        fontSize: '0.75rem',
        color: '#e2f1ff',
        backdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
      }}
    >
      <strong>{agv.name}</strong>
      <div>Battery: {agv.battery}%</div>
      <div>Status: {agv.status}</div>
      {agv.currentJob && <div>Job: {agv.currentJob.id}</div>}
    </Html>
  );
};

/* ---------- Velocity Trail Glow ---------- */
const AGVVelocityTrail = () => (
  <mesh position={[0, 0.05, 0]}>
    <circleGeometry args={[0.9, 32]} />
    <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
  </mesh>
);

/* ---------- Selection Ring ---------- */
const AGVSelectionRing = ({ agv }: { agv: AGV }) => (
  <mesh position={[agv.position.x, 0.02, agv.position.y]} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[1.2, 1.4, 32]} />
    <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
  </mesh>
);

/* ---------- Warehouse Walls (unchanged structure, improved material) ---------- */
const WarehouseWalls = ({ size }: { size: { width: number; length: number; height: number } }) => {
  const wallHeight = size.height - 2;
  const thickness = 0.3;

  return (
    <group>
      <Wall
        position={[size.width / 2, wallHeight / 2, size.length - thickness / 2]}
        args={[size.width, wallHeight, thickness]}
      />
      <Wall
        position={[size.width / 2, wallHeight / 2, thickness / 2]}
        args={[size.width, wallHeight, thickness]}
      />
      <Wall
        position={[size.width - thickness / 2, wallHeight / 2, size.length / 2]}
        args={[thickness, wallHeight, size.length]}
      />
      <Wall
        position={[thickness / 2, wallHeight / 2, size.length / 2]}
        args={[thickness, wallHeight, size.length]}
      />
    </group>
  );
};

const Wall = ({
  position,
  args,
}: {
  position: [number, number, number];
  args: [number, number, number];
}) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#152b39" metalness={0.2} roughness={0.8} />
  </mesh>
);