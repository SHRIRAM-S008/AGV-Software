import { useRef, useEffect, useState, Suspense } from "react";
import { useGLTF, useAnimations, OrbitControls, Environment, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useFrame } from "@react-three/fiber";

interface WarehouseModelProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

const ModelContent = ({ 
  position = [0, 0, 0], 
  scale = [1, 1, 1], 
  rotation = [0, 0, 0] 
}: WarehouseModelProps) => {
  const modelRef = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  
  const { scene, animations } = useGLTF("/summa.glb");
  const { actions } = useAnimations(animations, modelRef);

  useEffect(() => {
    try {
      if (scene && modelRef.current) {
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDimension = Math.max(size.x, size.y, size.z);
        const desiredScale = 30 / maxDimension; 
        
        scene.scale.multiplyScalar(desiredScale);
        scene.position.sub(center.multiplyScalar(desiredScale));

        modelRef.current.position.set(...position);
        modelRef.current.rotation.set(...rotation);
        modelRef.current.scale.set(...scale);
      }
      setModelError(null);
    } catch (error) {
      console.error("Error setting up 3D model:", error);
      setModelError(error instanceof Error ? error.message : "Unknown error");
    }
  }, [scene, position, rotation, scale]);

  if (modelError) {
    return (
      <mesh position={position}>
        <boxGeometry args={[20, 5, 20]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
    );
  }

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      dispose={null}
    />
  );
};

export const WarehouseModel = (props: WarehouseModelProps) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-gray-600 text-lg font-semibold mb-2">3D Model Unavailable</div>
            <div className="text-gray-500 text-sm">The warehouse 3D model could not be loaded</div>
          </div>
        </div>
      }
    >
      <Suspense fallback={
        <mesh position={props.position || [0, 0, 0]}>
          <boxGeometry args={[20, 5, 20]} />
          <meshStandardMaterial color="#999" opacity={0.3} transparent />
        </mesh>
      }>
        <ModelContent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Preload the model
try {
  useGLTF.preload("/summa.glb");
} catch (error) {
  console.warn("Could not preload 3D model:", error);
}


export const SceneSetup = ({
  autoRotate = true,
  rotateSpeed = 0.25,
  followTarget = null
}: {
  autoRotate?: boolean;
  rotateSpeed?: number;
  followTarget?: THREE.Group | null;
}) => {

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (autoRotate && !followTarget) {
      const radius = 40;
      const t = performance.now() * 0.0002 * rotateSpeed;

      const x = Math.sin(t) * radius;
      const z = Math.cos(t) * radius;

      if (cameraRef.current) {
        cameraRef.current.position.set(x, 20, z);
        cameraRef.current.lookAt(0, 0, 0);
      }
    }

    if (followTarget && cameraRef.current) {
      const p = followTarget.position;
      cameraRef.current.position.lerp(
        new THREE.Vector3(p.x - 8, p.y + 6, p.z + 8),
        0.05
      );
      cameraRef.current.lookAt(p);
    }
  });

  return (
    <>
      {/* Auto Camera */}
      <PerspectiveCamera makeDefault ref={cameraRef} fov={55} position={[25, 20, 25]} />

      {/* Allow mouse control */}
      {!followTarget && (
        <OrbitControls 
          enableZoom
          enablePan
          enableRotate
          maxPolarAngle={Math.PI / 2}
          minDistance={8}
          maxDistance={80}
        />
      )}

      {/* HDRI environment */}
      <Environment files="/warehouse_env.hdr" background={false} />

      {/* Lights */}
      <hemisphereLight intensity={0.5} groundColor="#444" />
      <directionalLight 
        castShadow
        position={[20, 30, 20]}
        intensity={1.1}
        shadow-mapSize={[2048, 2048]}
      />

      {/* Ground contact shadow */}
      <ContactShadows 
        position={[0, -0.001, 0]}
        scale={80}
        blur={2.5}
        opacity={0.5}
      />
    </>
  );
};