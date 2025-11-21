import { useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Color, Vector3 } from 'three';
import type { Line2, LineMaterial } from 'three-stdlib';
import type { Position } from '@/types/agv';

interface PathLineProps {
  path: Position[];
  isActive?: boolean;
  showWaypoints?: boolean;
}

export const PathLine = ({ path, isActive = false, showWaypoints = false }: PathLineProps) => {
  const lineRef = useRef<Line2>(null);

  const { points, colors, startPoint, endPoint } = useMemo(() => {
    const vectors = path.map((p) => new Vector3(p.x, 0.05, p.y));

    // Catmull-Rom gives us a nice smooth path without changing endpoints
    const curve = new CatmullRomCurve3(vectors);
    const samples = curve.getPoints(Math.max(32, path.length * 12));

    const startColor = new Color(isActive ? '#38bdf8' : '#22d3ee');
    const endColor = new Color(isActive ? '#0ea5e9' : '#0ea5e9').multiplyScalar(isActive ? 1.4 : 0.8);

    const gradient = samples.map((_, idx) =>
      startColor.clone().lerp(endColor, idx / Math.max(samples.length - 1, 1)).toArray() as [number, number, number]
    );

    return {
      points: samples.map((v) => v.toArray() as [number, number, number]),
      colors: gradient.flat(),
      startPoint: samples[0],
      endPoint: samples[samples.length - 1],
    };
  }, [path, isActive]);

  useFrame((_, delta) => {
    if (!lineRef.current) return;
    const material = lineRef.current.material as LineMaterial | undefined;
    if (material?.isLineMaterial) {
      material.dashOffset -= delta * (isActive ? 1.8 : 0.9);
    }
  });

  if (path.length < 2) return null;

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        vertexColors={colors}
        color="#0ea5e9"
        lineWidth={2}
        dashed
        dashSize={0.25}
        gapSize={0.15}
        dashOffset={0}
        worldUnits
      />

      {/* Start marker */}
      <mesh position={startPoint} scale={0.2}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.4} />
      </mesh>

      {/* Destination marker */}
      <mesh position={endPoint} scale={0.22}>
        <coneGeometry args={[0.35, 0.6, 12]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>

      {showWaypoints &&
        points.slice(1, -1).map((point, idx) => (
          <mesh key={idx} position={point} scale={0.14}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color="#0ea5e9" opacity={0.6} transparent />
          </mesh>
        ))}
    </>
  );
};