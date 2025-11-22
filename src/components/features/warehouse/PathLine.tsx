import { useMemo, useRef } from "react";
import { Line, Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Color, Vector3 } from "three";
import type { Line2, LineMaterial } from "three-stdlib";
import type { Position } from "@/types/agv";
import { useWarehouseStore } from "@/store/warehouseStore";

interface PathLineProps {
  path: Position[];
  isActive?: boolean;
  showWaypoints?: boolean;
}

export const PathLine = ({
  path,
  isActive = false,
  showWaypoints = false,
}: PathLineProps) => {
  const lineRef = useRef<Line2>(null);
  const isSimulationPlaying = useWarehouseStore((state) => state.isSimulationPlaying);

  const { points, colors, startPoint, endPoint } = useMemo(() => {
    const vectors = path.map((p) => new Vector3(p.x, 0.05, p.y));
    const curve = new CatmullRomCurve3(vectors);
    const samples = curve.getPoints(Math.max(48, path.length * 16));

    const startColor = new Color(isActive ? "#48dbfb" : "#22d3ee");
    const endColor = new Color("#0ea5e9").multiplyScalar(isActive ? 1.6 : 0.9);

    const gradient = samples.map((_, idx) =>
      startColor.clone().lerp(endColor, idx / Math.max(samples.length - 1, 1)).toArray() as [number, number, number]
    );

    return {
      points: samples.map((v) => v.toArray() as [number, number, number]),
      colors: gradient,
      startPoint: samples[0],
      endPoint: samples[samples.length - 1],
    };
  }, [path, isActive]);

  // COMPLETELY DISABLED: No animation at all
  useFrame((_, delta) => {
    return; // Exit immediately - no animation whatsoever
  });

  if (path.length < 2) return null;

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        vertexColors={colors}
        lineWidth={isActive ? 2.2 : 1.6}
        dashed
        dashSize={0.22}
        gapSize={0.14}
        worldUnits
      />

      {/* Temporarily disabled Trail to stop movement */}
      {/* <Trail
        width={0.18}
        length={6}
        color={isActive ? "#4de1ff" : "#69f6ff"}
        decay={1.5}
        attenuation={(t) => t}
        target={lineRef}
      /> */}

      <StartMarker position={startPoint.toArray() as [number, number, number]} />
      <EndMarker position={endPoint.toArray() as [number, number, number]} />

      {showWaypoints &&
        points.slice(1, -1).map((point, idx) => (
          <Waypoint key={`wp-${idx}`} position={point} />
        ))}
    </>
  );
};

const StartMarker = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position} scale={0.23}>
    <sphereGeometry args={[0.32, 20, 20]} />
    <meshStandardMaterial
      color="#f8fbff"
      emissive="#6ee7ff"
      emissiveIntensity={0.55}
      roughness={0.25}
      metalness={0.1}
    />
  </mesh>
);

const EndMarker = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position} scale={0.26} rotation={[Math.PI, 0, 0]}>
    <coneGeometry args={[0.34, 0.65, 24]} />
    <meshStandardMaterial
      color="#0ea5e9"
      emissive="#4dd0ff"
      emissiveIntensity={0.65}
      roughness={0.2}
      metalness={0.25}
    />
  </mesh>
);

const Waypoint = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position} scale={0.12}>
    <sphereGeometry args={[0.22, 16, 16]} />
    <meshStandardMaterial
      color="#cfefff"
      emissive="#0ea5e9"
      emissiveIntensity={0.35}
      transparent
      opacity={0.55}
    />
  </mesh>
);