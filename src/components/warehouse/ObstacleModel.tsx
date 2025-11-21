import { Obstacle } from '@/types/agv';

interface ObstacleModelProps {
  obstacle: Obstacle;
}

export const ObstacleModel = ({ obstacle }: ObstacleModelProps) => {
  const getColor = () => {
    switch (obstacle.type) {
      case 'rack': return '#4a5568';
      case 'box': return '#d97706';
      case 'human': return '#ef4444';
      case 'wall': return '#1a3a4a';
      default: return '#6b7280';
    }
  };

  const getEmissive = () => {
    return obstacle.isMoving ? '#ef4444' : '#000000';
  };

  return (
    <mesh
      position={[
        obstacle.position.x,
        obstacle.size.height / 2,
        obstacle.position.y
      ]}
      castShadow
    >
      {obstacle.type === 'human' ? (
        <capsuleGeometry args={[0.25, 1.5, 8, 16]} />
      ) : (
        <boxGeometry args={[
          obstacle.size.width,
          obstacle.size.height,
          obstacle.size.depth
        ]} />
      )}
      <meshStandardMaterial
        color={getColor()}
        emissive={getEmissive()}
        emissiveIntensity={obstacle.isMoving ? 0.3 : 0}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
};
