import { useMemo, useCallback } from "react";
import { useWarehouseStore } from "@/store/warehouseStore";
import type { AGV } from "@/types/agv";

type WarehouseState = ReturnType<typeof useWarehouseStore.getState>;
const selectAgvs = (s: WarehouseState) => s.agvs;
const selectObstacles = (s: WarehouseState) => s.obstacles;
const selectWarehouseSize = (s: WarehouseState) => s.warehouseSize;
const selectSelectedAgvId = (s: WarehouseState) => s.selectedAgvId;

const SCALE = 10;
const PADDING = 28;

export const WarehouseMap2D = () => {
  const agvs = useWarehouseStore(selectAgvs);
  const obstacles = useWarehouseStore(selectObstacles);
  const warehouseSize = useWarehouseStore(selectWarehouseSize);
  const selectedAgvId = useWarehouseStore(selectSelectedAgvId);
  const setSelectedAgvId = useWarehouseStore((s) => s.setSelectedAgvId);

  const toScreen = useCallback(
    (x: number, y: number) => ({
      x: PADDING + x * SCALE,
      y: PADDING + (warehouseSize.length - y) * SCALE,
    }),
    [warehouseSize.length]
  );

  const viewBox = useMemo(
    () => ({
      width: warehouseSize.width * SCALE + PADDING * 2,
      height: warehouseSize.length * SCALE + PADDING * 2,
    }),
    [warehouseSize]
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      className="rounded-2xl bg-white text-neutral-900 border border-neutral-200 shadow-xl"
    >
      {/* Base */}
      <rect
        x={PADDING}
        y={PADDING}
        width={warehouseSize.width * SCALE}
        height={warehouseSize.length * SCALE}
        fill="#ffffff"
        stroke="#d7dbe2"
        strokeWidth={2}
        rx={18}
      />

      {/* Racks (4 evenly spaced) */}
      <Racks size={warehouseSize} toScreen={toScreen} />

      {/* Home base area */}
      <Zone label="AGV HOME" color="#eef4ff" text="#1c3c72" position={toScreen(4, 4)} width={80} height={60} />

      {/* Delivery point */}
      <DeliveryPoint position={toScreen(warehouseSize.width - 6, warehouseSize.length - 4)} />

      {/* Obstacles (still white but outlined) */}
      {obstacles.map((ob) => {
        const { x, y } = toScreen(ob.position.x, ob.position.y);
        return (
          <rect
            key={ob.id}
            x={x - (ob.size.width * SCALE) / 2}
            y={y - (ob.size.depth * SCALE) / 2}
            width={ob.size.width * SCALE}
            height={ob.size.depth * SCALE}
            fill="#ffffff"
            stroke="#b6becd"
            strokeWidth={1.4}
          />
        );
      })}

      {/* Paths */}
      {agvs.map((agv) =>
        agv.path && agv.path.length > 1 ? (
          <polyline
            key={`path-${agv.id}`}
            points={agv.path.map((pt) => {
              const { x, y } = toScreen(pt.x, pt.y);
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke={agv.id === selectedAgvId ? "#0891b2" : "#22d3ee"}
            strokeWidth={agv.id === selectedAgvId ? 3.5 : 2.4}
            strokeDasharray={agv.id === selectedAgvId ? "10 6" : "4 4"}
            opacity={0.9}
          />
        ) : null
      )}

      {/* AGVs */}
      {agvs.map((agv) => {
        const { x, y } = toScreen(agv.position.x, agv.position.y);
        const size = 9;
        return (
          <g
            key={agv.id}
            transform={`translate(${x}, ${y})`}
            onPointerDown={(e: any) => {
              e.stopPropagation();
              setSelectedAgvId(agv.id === selectedAgvId ? null : agv.id);
            }}
            style={{ cursor: "pointer" }}
          >
            {agv.id === selectedAgvId && (
              <circle r={size * 1.8} fill="#0ea5e915" stroke="#0ea5e9" strokeWidth={1.2} />
            )}

            <rect
              x={-size}
              y={-size * 0.65}
              width={size * 2}
              height={size * 1.3}
              rx={4}
              fill="#050608"
              stroke="#0f172a"
              strokeWidth={1.4}
            />

            <polygon
              points={`0,-${size * 0.9} ${size * 0.6},${size * 0.15} -${size * 0.6},${size * 0.15}`}
              fill="#0ea5e9"
            />

            <circle cx={size * 0.75} cy={size * 0.55} r={2.8} fill={statusColor(agv.status)} />

            <text x={0} y={size * 1.75} fill="#1f2933" fontSize={8} fontWeight={600} textAnchor="middle">
              {agv.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- Zones & Decorations ---------- */
const Zone = ({
  label,
  color,
  text,
  position,
  width,
  height,
}: {
  label: string;
  color: string;
  text: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}) => (
  <g transform={`translate(${position.x - width / 2}, ${position.y - height / 2})`}>
    <rect width={width} height={height} fill={color} stroke="#c9d6ff" strokeWidth={1.4} rx={10} />
    <text
      x={width / 2}
      y={height / 2 + 4}
      fill={text}
      fontSize={12}
      fontWeight={700}
      textAnchor="middle"
    >
      {label}
    </text>
  </g>
);

const DeliveryPoint = ({ position }: { position: { x: number; y: number } }) => (
  <g transform={`translate(${position.x}, ${position.y})`}>
    <circle r={26} fill="#fffbeb" stroke="#facc15" strokeWidth={2} />
    <text x={0} y={5} textAnchor="middle" fill="#b45309" fontWeight={700} fontSize={12}>
      DELIVERY
    </text>
  </g>
);

/* ---------- Racks ---------- */
const Racks = ({
  size,
  toScreen,
}: {
  size: { width: number; length: number };
  toScreen: (x: number, y: number) => { x: number; y: number };
}) => {
  const rackWidth = size.width / 6;
  const rackLength = size.length / 4;
  const rackPositions = [
    { x: rackWidth * 1.2, y: size.length * 0.6, label: "R1" },
    { x: rackWidth * 2.4, y: size.length * 0.6, label: "R2" },
    { x: rackWidth * 3.6, y: size.length * 0.6, label: "R3" },
    { x: rackWidth * 4.8, y: size.length * 0.6, label: "R4" },
  ];

  return (
    <>
      {rackPositions.map((rack) => {
        const { x, y } = toScreen(rack.x, rack.y);
        return (
          <g key={rack.label} transform={`translate(${x}, ${y})`}>
            <rect
              x={-(rackWidth * SCALE) / 2}
              y={-(rackLength * SCALE) / 2}
              width={rackWidth * SCALE}
              height={rackLength * SCALE}
              fill="#f8fafc"
              stroke="#cbd5f5"
              strokeDasharray="6 4"
              strokeWidth={2}
              opacity={0.9}
            />
            <text
              x={0}
              y={4}
              fill="#1f2933"
              fontWeight={700}
              fontSize={12}
              textAnchor="middle"
            >
              {rack.label}
            </text>
          </g>
        );
      })}
    </>
  );
};

/* ---------- Status colors ---------- */
const statusColor = (status: AGV["status"]) => {
  switch (status) {
    case "moving":
      return "#10b981";
    case "charging":
      return "#f59e0b";
    case "error":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};
