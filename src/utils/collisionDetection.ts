// src/utils/collisionDetection.ts

import { AGV, Position, Obstacle } from '@/types/agv';
import { pathFinder } from './pathfinding';

// -----------------------------
// 1. CONSTANTS
// -----------------------------
const BASE_COLLISION_DISTANCE = 2.0; // Minimum safe distance (meters)
const SPEED_FACTOR = 0.5; // Collision buffer scales with speed
const MAX_PREDICTION_STEPS = 10; // Max future steps to simulate

// -----------------------------
// 2. COLLISION DETECTOR CLASS
// -----------------------------
export class CollisionDetector {
  /**
   * Check if two AGVs will collide based on their paths
   * Uses predictive multi-step simulation
   */
  checkCollision(agv1: AGV, agv2: AGV, obstacles: Obstacle[]): boolean {
    if (!agv1.path || !agv2.path) return false;

    // Check current positions
    if (this.isWithinCollisionDistance(agv1.position, agv2.position)) {
      return true;
    }

    // Predict future positions (up to MAX_PREDICTION_STEPS)
    const steps = Math.min(
      MAX_PREDICTION_STEPS,
      agv1.path.length,
      agv2.path.length
    );

    for (let i = 0; i < steps; i++) {
      const pos1 = agv1.path[i];
      const pos2 = agv2.path[i];

      // Check direct collision
      if (this.isWithinCollisionDistance(pos1, pos2)) {
        return true;
      }

      // Check if paths intersect (using line-segment intersection)
      if (i > 0 && this.doPathsIntersect(
        agv1.path[i - 1], pos1, 
        agv2.path[i - 1], pos2
      )) {
        return true;
      }

      // Check obstacle-assisted collisions (e.g., both AGVs heading toward same escape route)
      if (this.willBeBlockedByObstacles(pos1, pos2, obstacles)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if two positions are within collision distance
   * (distance scales with AGV speed)
   */
  private isWithinCollisionDistance(pos1: Position, pos2: Position, speed?: number): boolean {
    const distance = Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + 
      Math.pow(pos2.y - pos1.y, 2)
    );

    // Dynamic collision buffer: higher speed → larger safety zone
    const collisionDistance = speed 
      ? BASE_COLLISION_DISTANCE + (speed * SPEED_FACTOR) 
      : BASE_COLLISION_DISTANCE;

    return distance < collisionDistance;
  }

  /**
   * Find all AGVs that would collide with the given AGV
   * (uses spatial partitioning for performance)
   */
  findCollidingAGVs(agv: AGV, allAgvs: AGV[], obstacles: Obstacle[]): AGV[] {
    // Spatial partitioning: group AGVs by grid quadrant
    const grid = this.createSpatialGrid(allAgvs);
    
    // Check only nearby AGVs (reduces checks from O(n) → O(1))
    const nearbyAGVs = this.getNearbyAGVs(agv, grid);
    
    return nearbyAGVs.filter(otherAgv => 
      otherAgv.id !== agv.id && 
      this.checkCollision(agv, otherAgv, obstacles)
    );
  }

  /**
   * Create spatial grid for efficient collision checks
   * (divides warehouse into 4 quadrants)
   */
  private createSpatialGrid(agvs: AGV[]): Map<string, AGV[]> {
    const grid = new Map<string, AGV[]>();
    const warehouseSize = 30; // From warehouseState

    agvs.forEach(agv => {
      const quadrant = this.getQuadrant(agv.position, warehouseSize);
      const quadrantAgvs = grid.get(quadrant) || [];
      quadrantAgvs.push(agv);
      grid.set(quadrant, quadrantAgvs);
    });

    return grid;
  }

  /**
   * Get quadrant for a position (e.g., "Q1", "Q2", etc.)
   */
  private getQuadrant(pos: Position, size: number): string {
    const half = size / 2;
    const xQuadrant = pos.x >= half ? 'E' : 'W';
    const yQuadrant = pos.y >= half ? 'N' : 'S';
    return `${xQuadrant}${yQuadrant}`;
  }

  /**
   * Get AGVs in the same quadrant/neighboring quadrants
   */
  private getNearbyAGVs(agv: AGV, grid: Map<string, AGV[]>): AGV[] {
    const currentQuadrant = this.getQuadrant(agv.position, 30);
    const quadrants = [
      currentQuadrant,
      this.getNeighborQuadrant(currentQuadrant, 'W'),
      this.getNeighborQuadrant(currentQuadrant, 'E'),
      this.getNeighborQuadrant(currentQuadrant, 'N'),
      this.getNeighborQuadrant(currentQuadrant, 'S'),
    ];

    return quadrants
      .flatMap(q => grid.get(q) || [])
      .filter(a => a.id !== agv.id);
  }

  private getNeighborQuadrant(q: string, direction: 'W' | 'E' | 'N' | 'S'): string {
    // Simplified for 4-quadrant system
    if (direction === 'W') return q.replace('E', 'W');
    if (direction === 'E') return q.replace('W', 'E');
    if (direction === 'N') return q.replace('S', 'N');
    if (direction === 'S') return q.replace('N', 'S');
    return q;
  }

  /**
   * Check if two path segments intersect (line-segment collision)
   */
  private doPathsIntersect(
    p1: Position, p2: Position,
    p3: Position, p4: Position
  ): boolean {
    // Use cross-product method for line segment intersection
    const ccw1 = this.crossProduct(p1, p2, p3);
    const ccw2 = this.crossProduct(p1, p2, p4);
    const ccw3 = this.crossProduct(p3, p4, p1);
    const ccw4 = this.crossProduct(p3, p4, p2);

    return (
      (ccw1 * ccw2 < 0) && (ccw3 * ccw4 < 0)
    );
  }

  private crossProduct(a: Position, b: Position, c: Position): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  /**
   * Check if AGVs will be blocked by obstacles in the same corridor
   */
  private willBeBlockedByObstacles(
    pos1: Position, 
    pos2: Position, 
    obstacles: Obstacle[]
  ): boolean {
    // Find obstacles near the midpoint of both paths
    const mid1 = this.calculateMidpoint(pos1, pos2);
    return obstacles.some(obstacle => 
      this.isWithinCollisionDistance(mid1, obstacle.position, 0)
    );
  }

  private calculateMidpoint(a: Position, b: Position): Position {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      z: 0,
    };
  }

  /**
   * Check if a position is safe (not occupied by AGVs/obstacles)
   */
  isPositionSafe(
    position: Position, 
    agvs: AGV[], 
    obstacles: Obstacle[],
    excludeAgvId?: string
  ): boolean {
    // Check AGV collisions
    const hasAgvCollision = agvs.some(agv => {
      if (excludeAgvId && agv.id === excludeAgvId) return false;
      return this.isWithinCollisionDistance(position, agv.position);
    });

    if (hasAgvCollision) return false;

    // Check obstacle collisions
    return !obstacles.some(obstacle => 
      this.isWithinCollisionDistance(position, obstacle.position)
    );
  }

  /**
   * Calculate optimal wait position to avoid collision
   * (move AGV to a perpendicular offset)
   */
  getWaitPosition(agv: AGV, collidingAGVs: AGV[]): Position {
    if (collidingAGVs.length === 0) return { ...agv.position };

    // Find closest colliding AGV
    const closest = collidingAGVs.reduce((prev, curr) => 
      this.calculateDistance(agv.position, prev.position) < 
      this.calculateDistance(agv.position, curr.position) ? prev : curr
    );

    // Calculate perpendicular offset direction
    const angle = Math.atan2(
      closest.position.y - agv.position.y,
      closest.position.x - agv.position.x
    );
    const perpAngle = angle + Math.PI / 2;

    // Offset by 1 meter perpendicular to collision course
    return {
      x: agv.position.x + Math.cos(perpAngle),
      y: agv.position.y + Math.sin(perpAngle),
      z: 0,
    };
  }

  /**
   * Euclidean distance between two positions
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + 
      Math.pow(pos2.y - pos1.y, 2)
    );
  }
}

export const collisionDetector = new CollisionDetector();