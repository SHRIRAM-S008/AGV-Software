import { useMemo, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Float, Grid, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useWarehouseStore } from "@/store/warehouseStore";
import { AGVModel } from "./AGVModel";
import { ObstacleModel } from "./ObstacleModel";
import { PathLine } from "./PathLine";
import { Racks } from "./Racks";
import { WarehouseModel } from "./WarehouseModel";
import { WarehouseMap2D } from "./WarehouseMap2D";
import type { AGV } from "@/types/agv";

type WarehouseState = ReturnType<typeof useWarehouseStore.getState>;
const selectAgvs = (s: WarehouseState) => s.agvs;
const selectObstacles = (s: WarehouseState) => s.obstacles;
const selectWarehouseSize = (s: WarehouseState) => s.warehouseSize;
const selectSimulationPlaying = (s: WarehouseState) => s.isSimulationPlaying;
const selectSelectedAgvId = (s: WarehouseState) => s.selectedAgvId;
const selectViewMode = (s: WarehouseState) => s.viewMode;

export const WarehouseScene = ({ show3DModel = true }: { show3DModel?: boolean }) => {
  const agvs = useWarehouseStore(selectAgvs);
  const obstacles = useWarehouseStore(selectObstacles);
  const warehouseSize = useWarehouseStore(selectWarehouseSize);
  const isSimulationPlaying = useWarehouseStore(selectSimulationPlaying);
  const selectedAgvId = useWarehouseStore(selectSelectedAgvId);
  const viewMode = useWarehouseStore(selectViewMode);
  const setSelectedAgvId = useWarehouseStore((s) => s.setSelectedAgvId);
  const setViewMode = useWarehouseStore((s) => s.setViewMode);

  const handleSceneClick = useCallback(() => setSelectedAgvId(null), [setSelectedAgvId]);
  const handleAgvSelect = useCallback(
    (agvId: string) => {
      const currentId = selectedAgvId;
      setSelectedAgvId(currentId === agvId ? null : agvId);
    },
    [selectedAgvId, setSelectedAgvId]
  );

  const agvMap = useMemo(
    () =>
      agvs.map((agv) => (
        <InteractiveAGV
          key={agv.id}
          agv={agv}
          isSelected={agv.id === selectedAgvId}
          onSelect={handleAgvSelect}
          isSimulationPlaying={isSimulationPlaying}
        />
      )),
    [agvs, handleAgvSelect, selectedAgvId, isSimulationPlaying]
  );

  const obstacleMap = useMemo(
    () => obstacles.map((obstacle) => <ObstacleModel key={obstacle.id} obstacle={obstacle} />),
    [obstacles]
  );

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      {/* View Mode Toggle */}
      <div className="flex justify-center py-2 flex-shrink-0">
        <div className="inline-flex rounded-lg border border-[#262a33] bg-[#12141a] p-1 shadow-sm">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === '2d'
                ? 'bg-[#262a33] text-[#f5f5f5] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#1a1d29]'
            }`}
          >
            2D View
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === '3d'
                ? 'bg-[#262a33] text-[#f5f5f5] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#1a1d29]'
            }`}
          >
            3D View
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {/* 3D Scene - Always mounted, just hidden when not in use */}
        <div style={{ display: viewMode === '3d' ? 'block' : 'none' }} className="h-full w-full">
          <div className="h-full w-full bg-[#050608] relative">
            <Canvas
              shadows
              dpr={[1, 2]}
              frameloop="demand"
              onPointerMissed={handleSceneClick}
              camera={{ position: [15, 25, 15], fov: 60, near: 0.1, far: 500 }}
              gl={{ 
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1
              }}
              className="w-full h-full"
            >
              <Suspense fallback={
                <Html center>
                  <div style={{ color: '#374151', background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                    Loading Warehouse...
                  </div>
                </Html>
              }>
                <color attach="background" args={["#f5f5f5"]} />
                <fog attach="fog" color="#e5e5e5" near={20} far={200} />

                <SceneLighting />

                {/* 3D Warehouse Model - only show when enabled */}
                {show3DModel && (
                  <WarehouseModel 
                    position={[warehouseSize.width / 2, 0, warehouseSize.length / 2]}
                    scale={[1, 1, 1]}
                    rotation={[0, 0, 0]}
                  />
                )}

                {/* Basic warehouse components when 3D model is disabled */}
                {!show3DModel && (
                  <>
                    <WarehouseShell size={warehouseSize} />
                    <IndustrialFloor size={warehouseSize} />
                    <CeilingTrusses size={warehouseSize} />
                    <HangingLightArray size={warehouseSize} />
                    <AmbientProps size={warehouseSize} />
                  </>
                )}

                <Racks warehouseSize={warehouseSize} />

                <Grid
                  args={[warehouseSize.width, warehouseSize.length]}
                  cellSize={1}
                  cellThickness={0.35}
                  cellColor="#0a131d"
                  sectionSize={5}
                  sectionThickness={1}
                  sectionColor="#1ed3ff"
                  fadeDistance={80}
                  fadeStrength={1}
                  position={[warehouseSize.width / 2, 0.001, warehouseSize.length / 2]}
                />

                {agvMap}
                {selectedAgvId && (
                  <AGVSelectionRing agv={agvs.find((a) => a.id === selectedAgvId)!} />
                )}

                {obstacleMap}

                <ContactShadows
                  position={[warehouseSize.width / 2, -0.4, warehouseSize.length / 2]}
                  opacity={0.55}
                  scale={60}
                  blur={2}
                  far={12}
                />

                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={8}
                  maxDistance={80}
                  minPolarAngle={0}
                  maxPolarAngle={Math.PI / 2.1}
                  minAzimuthAngle={-Math.PI}
                  maxAzimuthAngle={Math.PI}
                  enableDamping={true}
                  dampingFactor={0.05}
                  makeDefault
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* 2D Map - Always mounted, just hidden when not in use */}
        <div style={{ display: viewMode === '2d' ? 'block' : 'none' }} className="h-full">
          <div className="h-full bg-[#12141a] rounded-lg p-4 border border-[#262a33] flex flex-col">
            <h3 className="text-xl font-semibold text-[#f5f5f5] mb-4 text-center flex-shrink-0">2D Warehouse View</h3>
            <div className="flex-1 min-h-0">
              <WarehouseMap2D />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Lighting ---------- */
const SceneLighting = () => (
  <>
    <ambientLight intensity={0.8} color="#ffffff" />
    <directionalLight
      position={[25, 40, 10]}
      intensity={1.8}
      color="#ffffff"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-far={120}
      shadow-camera-near={8}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-camera-left={-50}
      shadow-camera-right={50}
    />
    <hemisphereLight args={["#ffffff", "#e5e5e5", 0.7]} />
    <spotLight
      position={[-10, 30, -15]}
      angle={0.6}
      penumbra={0.5}
      intensity={1.2}
      distance={180}
      color="#ffffff"
    />
  </>
);

/* ---------- Floor with painted lanes ---------- */
const IndustrialFloor = ({ size }: { size: { width: number; length: number } }) => {
  return (
    <>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size.width / 2, -0.01, size.length / 2]}
      >
        <planeGeometry args={[size.width, size.length]} />
        <meshStandardMaterial
          color="#f3f4f6"
          metalness={0.15}
          roughness={0.85}
        />
      </mesh>

      {/* Painted lanes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[size.width / 2, 0.001, size.length / 2]}>
        <planeGeometry args={[size.width, size.length]} />
        <meshBasicMaterial
          color="#9ca3af"
          transparent
          opacity={0.15}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* Safety walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[size.width * 0.15, 0.002, size.length / 2]}>
        <planeGeometry args={[2, size.length]} />
        <meshBasicMaterial color="#374151" opacity={0.12} transparent />
      </mesh>
    </>
  );
};

/* ---------- Warehouse shell (walls + ceiling panels) ---------- */
const WarehouseShell = ({
  size,
}: {
  size: { width: number; length: number; height: number };
}) => {
  const wallHeight = size.height - 1.5;
  const thickness = 0.4;
  const wallMaterial = (
    <meshStandardMaterial color="#e5e7eb" roughness={0.55} metalness={0.05} />
  );

  return (
    <group>
      {[
        {
          position: [size.width / 2, wallHeight / 2, size.length - thickness / 2] as [number, number, number],
          args: [size.width, wallHeight, thickness] as [number, number, number],
        },
        {
          position: [size.width / 2, wallHeight / 2, thickness / 2] as [number, number, number],
          args: [size.width, wallHeight, thickness] as [number, number, number],
        },
        {
          position: [size.width - thickness / 2, wallHeight / 2, size.length / 2] as [number, number, number],
          args: [thickness, wallHeight, size.length] as [number, number, number],
        },
        {
          position: [thickness / 2, wallHeight / 2, size.length / 2] as [number, number, number],
          args: [thickness, wallHeight, size.length] as [number, number, number],
        },
      ].map((wall, idx) => (
        <mesh key={idx} position={wall.position} castShadow receiveShadow>
          <boxGeometry args={wall.args} />
          {wallMaterial}
        </mesh>
      ))}

      {/* Simple ceiling plane */}
      <mesh
        receiveShadow
        position={[size.width / 2, size.height - 0.1, size.length / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[size.width, size.length]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
};

/* ---------- Ceiling trusses ---------- */
const CeilingTrusses = ({ size }: { size: { width: number; length: number; height: number } }) => {
  const beamCount = Math.floor(size.length / 6);
  const beams = Array.from({ length: beamCount }, (_, i) => i);

  return (
    <group position={[0, size.height - 2.5, 0]}>
      {beams.map((i) => (
        <mesh
          key={i}
          position={[
            size.width / 2,
            0,
            (i / beamCount) * size.length + size.length * 0.05,
          ]}
        >
          <boxGeometry args={[size.width - 2, 0.25, 0.25]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

const HangingLightArray = ({
  size,
}: {
  size: { width: number; length: number; height: number };
}) => {
  const rows = Math.max(2, Math.floor(size.length / 12));
  const cols = Math.max(2, Math.floor(size.width / 12));
  const fixtures = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      fixtures.push({
        x: (c / (cols - 1 || 1)) * (size.width - 4) + 2,
        z: (r / (rows - 1 || 1)) * (size.length - 4) + 2,
      });
    }
  }

  return (
    <group>
      {fixtures.map((fixture, idx) => (
        <HangingLight
          key={idx}
          position={[
            fixture.x,
            size.height - 1.5,
            fixture.z,
          ]}
        />
      ))}
    </group>
  );
};

const HangingLight = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
      <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.3} />
    </mesh>
    <mesh>
      <cylinderGeometry args={[0.6, 0.6, 0.25, 24]} />
      <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.35} />
    </mesh>
    <mesh position={[0, -0.2, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.08, 24]} />
      <meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.9} color="#ffffff" />
    </mesh>
    <pointLight
      position={[0, -0.3, 0]}
      intensity={1.4}
      distance={16}
      color="#ffffff"
      decay={1.4}
      castShadow
    />
  </group>
);

/* ---------- Ambient props (cones, pallets, info pylons) ---------- */
const AmbientProps = ({ size }: { size: { width: number; length: number } }) => {
  const cones = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) {
      positions.push([
        2 + Math.random() * (size.width - 4),
        0,
        2 + Math.random() * (size.length - 4),
      ]);
    }
    return positions;
  }, [size]);

  return (
    <group>
      {cones.map((pos, idx) => (
        <mesh key={`cone-${idx}`} position={[pos[0], 0.2, pos[2]]}>
          <coneGeometry args={[0.25, 0.45, 16]} />
          <meshStandardMaterial color="#9ca3af" emissive="#9ca3af" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* Temporarily disabled Float to stop movement */}
      {/* <Float floatIntensity={0.4} speed={1.4}> */}
        <mesh position={[size.width * 0.8, 1.6, size.length * 0.2]}>
          <boxGeometry args={[1.2, 2.6, 0.3]} />
          <meshStandardMaterial
            color="#6b7280"
            emissive="#9ca3af"
            emissiveIntensity={0.08}
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      {/* </Float> */}
    </group>
  );
};

/* ---------- Interactive AGV ---------- */
const InteractiveAGV = ({
  agv,
  isSelected,
  onSelect,
  isSimulationPlaying,
}: {
  agv: AGV;
  isSelected: boolean;
  onSelect: (agvId: string) => void;
  isSimulationPlaying: boolean;
}) => {
  const handlePointerDown = useCallback(
    (event: THREE.Event) => {
      (event as any).stopPropagation();
      onSelect(agv.id);
    },
    [agv.id, onSelect]
  );

  const isMoving = agv.status === "moving";

  return (
    <group
      position={[agv.position.x, agv.position.z ?? 0, agv.position.y]}
      scale={isSelected ? 1.06 : 1}
      onPointerDown={handlePointerDown}
    >
      <AGVModel agv={agv} isSimulationPlaying={isSimulationPlaying} simulationSpeed={1} />
      {agv.path && agv.path.length > 1 && (
        <PathLine path={agv.path} isActive={isSelected} showWaypoints />
      )}
      <SelectionBillboard agv={agv} isSelected={isSelected} />
      {/* Temporarily disabled velocity trail to stop movement */}
      {/* {isMoving && <AGVVelocityTrail />} */}
    </group>
  );
};

/* ---------- Selection Billboard ---------- */
const SelectionBillboard = ({ agv, isSelected }: { agv: AGV; isSelected: boolean }) => {
  if (!isSelected) return null;

  return (
    <Html
      position={[0, 2.4, 0]}
      center
      className="pointer-events-none"
      style={{
        background: "rgba(5, 6, 8, 0.92)",
        borderRadius: "14px",
        padding: "8px 12px",
        border: "1px solid rgba(75, 85, 99, 0.35)",
        fontSize: "0.78rem",
        color: "#f5f5f5",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
        minWidth: "140px",
      }}
    >
      <strong style={{ letterSpacing: 0.4 }}>{agv.name}</strong>
      <div>Battery: {agv.battery}%</div>
      <div>Status: {agv.status}</div>
      {agv.currentJob && <div>Job: {agv.currentJob.id}</div>}
    </Html>
  );
};

/* ---------- Velocity Trail ---------- */
const AGVVelocityTrail = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
    <circleGeometry args={[1.1, 48]} />
    <meshBasicMaterial color="#9ca3af" transparent opacity={0.15} />
  </mesh>
);

/* ---------- Selection Ring ---------- */
const AGVSelectionRing = ({ agv }: { agv: AGV }) => (
  <mesh
    position={[agv.position.x, 0.015, agv.position.y]}
    rotation={[-Math.PI / 2, 0, 0]}
  >
    <ringGeometry args={[1.25, 1.4, 64]} />
    <meshStandardMaterial
      color="#4b5563"
      transparent
      opacity={0.5}
      emissive="#4b5563"
      emissiveIntensity={1}
    />
  </mesh>
);