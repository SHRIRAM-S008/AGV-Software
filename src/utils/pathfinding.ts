// src/utils/pathfinding.ts

import { Position, Obstacle } from '@/types/agv';

// -----------------------------
// 1. HELPER TYPES
// -----------------------------
interface Node {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost (g + h)
  parent: Node | null;
}

// Binary heap node for efficient open-list management
class HeapNode {
  public index!: number;
  constructor(public node: Node) {}
}

// -----------------------------
// 2. PATHFINDER CLASS
// -----------------------------
export class PathFinder {
  private gridSize = 30;
  private cellSize = 1;
  private grid: boolean[][] = [];

  /* 
    A* pathfinding with binary heap for O(log n) open-list operations.
    Uses Euclidean distance heuristic.
  */
  calculatePath(
    start: Position, 
    end: Position, 
    obstacles: Obstacle[]
  ): Position[] {
    this.initializeGrid(obstacles);

    const startNode: Node = {
      x: Math.round(start.x),
      y: Math.round(start.y),
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    const endNode = { x: Math.round(end.x), y: Math.round(end.y) };

    // Use binary heap for efficient open-list
    const openList = new BinaryHeap<Node>((a, b) => a.f - b.f);
    openList.push(startNode);

    const closedList = new Set<string>();

    while (!openList.isEmpty()) {
      const currentNode = openList.pop()!;

      const currentKey = `${currentNode.x},${currentNode.y}`;
      if (closedList.has(currentKey)) continue;
      closedList.add(currentKey);

      // Goal reached
      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
        return this.reconstructPath(currentNode);
      }

      const neighbors = this.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedList.has(neighborKey) || this.isBlocked(neighbor.x, neighbor.y)) 
          continue;

        const movementCost = this.getMovementCost(currentNode, neighbor);
        const tentativeG = currentNode.g + movementCost;

        // Check if neighbor is already in open list
        const existingNode = openList.find(n => 
          n.x === neighbor.x && n.y === neighbor.y
        );

        if (!existingNode) {
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(
            { x: neighbor.x, y: neighbor.y, z: 0 },
            { x: endNode.x, y: endNode.y, z: 0 }
          );
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = currentNode;
          openList.push(neighbor);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = currentNode;
          openList.update(existingNode);
        }
      }
    }

    // No path found → fallback to direct path
    return this.createFallbackPath(start, end);
  }

  /* 
    Adjust path when collisions are detected (e.g., AGV-AGV).
    Inserts small delays or detours at collision points.
  */
  adjustPathForCollision(
    path: Position[], 
    collidingAGVs: { position: Position }[]
  ): Position[] {
    if (path.length < 2) return path;

    const adjustedPath: Position[] = [...path];
    const COLLISION_MARGIN = 0.8; // Collision threshold

    collidingAGVs.forEach(agv => {
      path.forEach((point, idx) => {
        const distance = this.calculateDistance(point, agv.position);
        if (distance < COLLISION_MARGIN && idx > 0) {
          // Insert a small detour (move sideways)
          const prevPoint = adjustedPath[idx - 1];
          const detour = this.calculateDetour(prevPoint, point, agv.position);
          adjustedPath.splice(idx, 1, ...detour);
        }
      });
    });

    return this.smoothPath(adjustedPath);
  }

  /* 
    Calculate a small detour to avoid AGV collisions
  */
  private calculateDetour(
    from: Position, 
    to: Position, 
    obstacle: Position
  ): Position[] {
    const DETOUR_DISTANCE = 0.5;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const perpAngle = angle + Math.PI / 2;

    // Move perpendicular to current direction
    const detour: Position[] = [
      {
        x: to.x + Math.cos(perpAngle) * DETOUR_DISTANCE,
        y: to.y + Math.sin(perpAngle) * DETOUR_DISTANCE,
        z: 0,
      },
      to,
    ];

    return detour;
  }

  /* 
    Initialize grid with obstacles (mark blocked cells)
  */
  private initializeGrid(obstacles: Obstacle[]): void {
    this.grid = Array(this.gridSize)
      .fill(null)
      .map(() => Array(this.gridSize).fill(false));

    obstacles.forEach(obstacle => {
      const x = Math.round(obstacle.position.x);
      const y = Math.round(obstacle.position.y);
      const halfWidth = Math.ceil(obstacle.size.width / 2);
      const halfDepth = Math.ceil(obstacle.size.depth / 2);

      for (let dx = -halfWidth; dx <= halfWidth; dx++) {
        for (let dy = -halfDepth; dy <= halfDepth; dy++) {
          const gridX = x + dx;
          const gridY = y + dy;
          if (this.isInBounds(gridX, gridY)) {
            this.grid[gridX][gridY] = true;
          }
        }
      }
    });
  }

  /* 
    Get 8-directional neighbors (including diagonals)
  */
  private getNeighbors(node: Node): Node[] {
    const directions = [
      { x: 0, y: 1 },   // North
      { x: 1, y: 0 },   // East
      { x: 0, y: -1 },  // South
      { x: -1, y: 0 },  // West
      { x: 1, y: 1 },   // Northeast
      { x: 1, y: -1 },  // Southeast
      { x: -1, y: -1 }, // Southwest
      { x: -1, y: 1 },  // Northwest
    ];

    const neighbors: Node[] = [];
    directions.forEach(dir => {
      const x = node.x + dir.x;
      const y = node.y + dir.y;
      if (this.isInBounds(x, y)) {
        neighbors.push({ x, y, g: 0, h: 0, f: 0, parent: null });
      }
    });

    return neighbors;
  }

  /* 
    Movement cost: diagonal = √2, straight = 1
  */
  private getMovementCost(from: Node, to: Node): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    return (dx === 1 && dy === 1) ? Math.SQRT2 : 1;
  }

  /* 
    Euclidean distance heuristic (admissible)
  */
  private heuristic(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + 
      Math.pow(pos2.y - pos1.y, 2)
    );
  }

  /* 
    Check if cell is blocked by obstacles
  */
  private isBlocked(x: number, y: number): boolean {
    if (!this.isInBounds(x, y)) return true;
    return this.grid[x][y];
  }

  /* 
    Validate grid bounds
  */
  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }

  /* 
    Reconstruct path from end node to start
  */
  private reconstructPath(endNode: Node): Position[] {
    const path: Position[] = [];
    let current: Node | null = endNode;

    while (current) {
      path.unshift({ x: current.x, y: current.y, z: 0 });
      current = current.parent;
    }

    return this.smoothPath(path);
  }

  /* 
    Fallback path (linear interpolation) when A* fails
  */
  private createFallbackPath(start: Position, end: Position): Position[] {
    const path: Position[] = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      path.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        z: 0,
      });
    }
    
    return path;
  }

  /* 
    Smooth path using Bezier curves (instead of linear averaging)
  */
  private smoothPath(path: Position[]): Position[] {
    if (path.length < 3) return path;

    const smoothed: Position[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
      const p0 = path[i - 1];
      const p1 = path[i];
      const p2 = path[i + 1];

      // Cubic Bezier control points
      const cp1 = this.calculateControlPoint(p0, p1, 0.33);
      const cp2 = this.calculateControlPoint(p1, p2, 0.66);

      // Add 2 interpolated points between p1 and p2
      for (let t = 0.25; t <= 0.75; t += 0.25) {
        const x = this.bezierInterpolate(p1.x, cp1.x, cp2.x, p2.x, t);
        const y = this.bezierInterpolate(p1.y, cp1.y, cp2.y, p2.y, t);
        smoothed.push({ x, y, z: 0 });
      }
    }

    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  private calculateControlPoint(prev: Position, curr: Position, bias: number): Position {
    return {
      x: prev.x + (curr.x - prev.x) * bias,
      y: prev.y + (curr.y - prev.y) * bias,
      z: 0,
    };
  }

  private bezierInterpolate(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      1 * p0 * (1 - t) ** 3 +
      3 * p1 * t * (1 - t) ** 2 +
      3 * p2 * t2 * (1 - t) +
      1 * p3 * t3
    );
  }

  /* 
    Check if position is blocked by obstacles (with margin)
  */
  isPathBlocked(position: Position, obstacles: Obstacle[]): boolean {
    const MARGIN = 0.5;
    return obstacles.some(obstacle => {
      const dx = Math.abs(position.x - obstacle.position.x);
      const dy = Math.abs(position.y - obstacle.position.y);
      return (
        dx < (obstacle.size.width / 2 + MARGIN) && 
        dy < (obstacle.size.depth / 2 + MARGIN)
      );
    });
  }

  /* 
    Euclidean distance between two positions
  */
  calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + 
      Math.pow(pos2.y - pos1.y, 2)
    );
  }

  /* 
    Dynamic path recalculation: Check if future path points are blocked
  */
  shouldRecalculatePath(
    currentPos: Position,
    path: Position[],
    obstacles: Obstacle[]
  ): boolean {
    const FUTURE_THRESHOLD = 3; // Check next 3 points
    const futurePoints = path.slice(0, FUTURE_THRESHOLD);

    return futurePoints.some(point => 
      this.isPathBlocked(point, obstacles)
    );
  }
}

/* 
  Binary Heap implementation for efficient open-list management in A*
  (O(log n) insert/pop)
*/
class BinaryHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn;
  }

  push(item: T): void {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.siftDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.heap.find(predicate);
  }

  update(item: T): void {
    const index = this.heap.findIndex(i => i === item);
    if (index === -1) return;
    this.siftUp(index);
    this.siftDown(index);
  }

  private siftUp(index: number): void {
    const parent = Math.floor((index - 1) / 2);
    if (index > 0 && this.compare(this.heap[index], this.heap[parent]) < 0) {
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      this.siftUp(parent);
    }
  }

  private siftDown(index: number): void {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    let smallest = index;

    if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
      smallest = left;
    }
    if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
      smallest = right;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      this.siftDown(smallest);
    }
  }
}

export const pathFinder = new PathFinder();