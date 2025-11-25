import { useRef, useEffect, useState, Suspense } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
  
  // Always call hooks in the same order
  const { scene, animations } = useGLTF("/summa.glb");
  const { actions } = useAnimations(animations, modelRef);

  useEffect(() => {
    try {
      if (scene && modelRef.current) {
        // Center the model and adjust scale if needed
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // You can adjust these values based on your model's scale
        const maxDimension = Math.max(size.x, size.y, size.z);
        const desiredScale = 30 / maxDimension; // Scale to fit 30 units warehouse
        
        scene.scale.multiplyScalar(desiredScale);
        scene.position.sub(center.multiplyScalar(desiredScale));
        
        // Apply additional transformations
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

// Preload the model for better performance
try {
  useGLTF.preload("/summa.glb");
} catch (error) {
  console.warn("Could not preload 3D model:", error);
}
