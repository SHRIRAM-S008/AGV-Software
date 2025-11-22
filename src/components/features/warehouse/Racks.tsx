import React from "react";
import { RackModel } from "./RackModel";

export const Racks = ({ warehouseSize }: { warehouseSize: { width: number; length: number; height?: number } }) => {
  const centerX = warehouseSize.width / 2;
  const centerZ = warehouseSize.length / 2;
  const spacing = 6; // distance between racks

  // positions: left, center, right along X axis
  const positions = [
    [centerX - spacing, 0, centerZ], // left
    [centerX, 0, centerZ],           // center
    [centerX + spacing, 0, centerZ], // right
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <RackModel key={i} position={[pos[0], 0, pos[2]]} />
      ))}
    </group>
  );
};
