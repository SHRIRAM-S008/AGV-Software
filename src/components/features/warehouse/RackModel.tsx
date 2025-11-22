import React from "react";
import * as THREE from "three";

export const RackModel = ({ position = [0, 0, 0], size = [2.2, 4.0, 0.8] as [number, number, number] }) => {
  const [width, height, depth] = size;
  const shelfCount = 4;
  const shelfSpacing = height / (shelfCount + 1);

  return (
    <group position={position as [number, number, number]}>
      {/* Main rack body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#222833" metalness={0.2} roughness={0.45} />
      </mesh>

      {/* Shelves (visual slats) */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, (i + 1) * shelfSpacing, 0.001]} // slightly offset to avoid z-fighting
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width * 0.95, 0.06, depth * 0.9]} />
          <meshStandardMaterial color="#3b4650" metalness={0.05} roughness={0.6} />
        </mesh>
      ))}

      {/* Vertical posts - four corners */}
      {[
        [-width / 2 + 0.06, 0, -depth / 2 + 0.06],
        [width / 2 - 0.06, 0, -depth / 2 + 0.06],
        [-width / 2 + 0.06, 0, depth / 2 - 0.06],
        [width / 2 - 0.06, 0, depth / 2 - 0.06],
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], height / 2, pos[2]]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.06, height, 12]} />
          <meshStandardMaterial color="#101217" metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
};
