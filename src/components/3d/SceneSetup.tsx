import { OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SceneSetupProps {
  autoRotate?: boolean;
  rotateSpeed?: number;
  followTarget?: THREE.Group | null;
}

export const SceneSetup = ({
  autoRotate = true,
  rotateSpeed = 0.3,
  followTarget = null,
}: SceneSetupProps) => {

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (autoRotate && !followTarget) {
      const radius = 40;
      const time = performance.now() * 0.0002 * rotateSpeed;

      const x = Math.sin(time) * radius;
      const z = Math.cos(time) * radius;

      if (cameraRef.current) {
        cameraRef.current.position.set(x, 20, z);
        cameraRef.current.lookAt(0, 0, 0);
      }
    }

    if (followTarget && cameraRef.current) {
      const t = followTarget.position;
      cameraRef.current.position.lerp(
        new THREE.Vector3(t.x - 8, t.y + 6, t.z + 8),
        0.05
      );
      cameraRef.current.lookAt(t);
    }
  });

  return (
    <>
      {/* CAMERA */}
      <PerspectiveCamera ref={cameraRef} makeDefault position={[25, 20, 25]} fov={55} />

      {/* ORBIT CONTROLS */}
      {!followTarget && (
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={80}
        />
      )}

      {/* ENVIRONMENT HDRI */}
      <Environment
        files="/warehouse_env.hdr"
        background={false}
      />

      {/* LIGHTING */}
      <hemisphereLight intensity={0.4} groundColor="#444" />
      <directionalLight 
        castShadow 
        position={[20, 35, 20]} 
        intensity={1.2}
        shadow-mapSize={[2048, 2048]}
      />

      {/* SOFT CONTACT SHADOWS */}
      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.5}
        blur={2.8}
        scale={80}
      />
    </>
  );
};
