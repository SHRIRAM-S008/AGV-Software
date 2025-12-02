import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { AGVModel } from "@/components/features/warehouse/AGVModel";
import { AGV } from "@/types/agv";

interface AGVPathFollowerProps {
  path: [number, number, number][];
  speed?: number;            // base movement speed
  easing?: number;           // acceleration smoothing
  loop?: boolean;            // repeat route
  autoRotate?: boolean;      // face movement direction
  wheelRotation?: boolean;   // rotate wheels for effect
  paused?: boolean;          // pause movement
}

export const AGVPathFollower = ({
  path,
  speed = 2,
  easing = 0.12,
  loop = false,
  autoRotate = true,
  wheelRotation = true,
  paused = false,
}: AGVPathFollowerProps) => {
  
  const agvRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Group | null>(null); // attaches to wheels group
  const currentVelocity = useRef(0);

  const [segment, setSegment] = useState(0);

  // Create a simple AGV object for the AGVModel
  const mockAGV: AGV = {
    id: 'path-follower',
    name: 'Path Follower AGV',
    type: 'mini_agv',
    model: 'Path-Follower-v1',
    position: { x: 0, y: 0, z: 0 },
    status: 'moving',
    operationalMode: 'auto',
    battery: 100,
    heading: 0,
    speed: 0,
    distanceTraveled: 0,
    temperature: 25,
    loadWeight: 0,
    isObstacleDetected: false,
    firmwareVersion: '1.0.0',
    lastServiceDate: new Date(),
    batteryHealth: 100,
    motorHealth: 100,
    totalRunHours: 0
  };

  // Set initial position
  useEffect(() => {
    if (agvRef.current && path.length > 0) {
      agvRef.current.position.set(...path[0]);
    }
  }, [path]);

  useFrame((state, delta) => {
    if (!agvRef.current || path.length < 2 || paused) return;

    const pos = agvRef.current.position;

    const currentPoint = new THREE.Vector3(...path[segment]);
    const nextPoint = new THREE.Vector3(...path[segment + 1]);

    const direction = nextPoint.clone().sub(currentPoint).normalize();
    const distanceToNext = pos.distanceTo(nextPoint);

    // Accelerate to full speed using easing
    currentVelocity.current += (speed - currentVelocity.current) * easing;

    // Move AGV
    const moveStep = direction.clone().multiplyScalar(currentVelocity.current * delta);
    pos.add(moveStep);

    // Smooth steering rotation
    if (autoRotate) {
      const targetAngle = Math.atan2(direction.x, direction.z);
      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, targetAngle, 0)
      );
      agvRef.current.quaternion.slerp(targetQuat, 0.15);
    }

    // Wheel rotation
    if (wheelRotation && wheelRef.current) {
      const wheelSpin = currentVelocity.current * 1.5;
      wheelRef.current.rotation.x -= wheelSpin * delta;
    }

    // When reached next point → go to next segment
    if (distanceToNext < 0.15) {
      if (segment < path.length - 2) {
        setSegment(segment + 1);
      } else {
        if (loop) {
          setSegment(0);
          pos.set(...path[0]);
        } else {
          currentVelocity.current = 0;
        }
      }
    }
  });

  return (
    <group ref={agvRef}>
      {/* Attach wheel rotation group */}
      <group ref={wheelRef} position={[0, -0.2, 0]}>
        <AGVModel 
          agv={mockAGV} 
          isSimulationPlaying={!paused}
          simulationSpeed={speed}
        />
      </group>
    </group>
  );
};
