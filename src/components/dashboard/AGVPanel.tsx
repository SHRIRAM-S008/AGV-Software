import { useState, useMemo, useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import { Bot, BatteryFull, BatteryMedium, BatteryCharging, Activity, Search, Package, Navigation2 } from 'lucide-react';

import { useWarehouseStore } from '@/store/warehouseStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { AGV } from '@/types/agv';

type StatusFilter = 'all' | 'idle' | 'moving' | 'charging' | 'error';

const selectAgvs = (state: ReturnType<typeof useWarehouseStore.getState>) => state.agvs;

export const AGVPanel = () => {
  const agvs = useWarehouseStore(selectAgvs, shallow);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<'battery-desc' | 'battery-asc' | 'status' | 'name'>('status');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedAgvs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = agvs.filter((agv) => {
      const matchesStatus = statusFilter === 'all' || agv.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        agv.name.toLowerCase().includes(normalizedQuery) ||
        agv.id.toLowerCase().includes(normalizedQuery) ||
        agv.currentJob?.id.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'battery-desc':
          return b.battery - a.battery;
        case 'battery-asc':
          return a.battery - b.battery;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
        default:
          return statusRank(a.status) - statusRank(b.status) || a.name.localeCompare(b.name);
      }
    });
  }, [agvs, searchQuery, statusFilter, sortOption]);

  const availableCount = useMemo(
    () => agvs.filter((agv) => agv.status === 'idle').length,
    [agvs]
  );
  const movingCount = useMemo(
    () => agvs.filter((agv) => agv.status === 'moving').length,
    [agvs]
  );

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <Card className="flex h-full flex-col border-border bg-card/80 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bot className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Fleet Control</h3>
          <p className="text-xs text-muted-foreground/70">Live status of all automated vehicles</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <Activity className="h-3.5 w-3.5 text-primary" />
            {movingCount} active
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
            {availableCount} idle
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search AGVs or jobs..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>

        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(value: StatusFilter) => value && setStatusFilter(value)}
          className="rounded-lg border border-border p-1"
        >
          {TOGGLE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="gap-2 px-3 py-2 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Select
          value={sortOption}
          onValueChange={(value: typeof sortOption) => setSortOption(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort AGVs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">Status (Priority)</SelectItem>
            <SelectItem value="battery-desc">Battery (High → Low)</SelectItem>
            <SelectItem value="battery-asc">Battery (Low → High)</SelectItem>
            <SelectItem value="name">Name (A → Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {filteredAndSortedAgvs.length === 0 ? (
            <EmptyState />
          ) : (
            filteredAndSortedAgvs.map((agv) => (
              <AGVCard key={agv.id} agv={agv} />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

/* ---------- AGV CARD COMPONENT ---------- */
const AGVCard = ({ agv }: { agv: AGV }) => {
  const batteryVariant = getBatteryVariant(agv.battery);
  const hasJob = Boolean(agv.currentJob);
  const statusBadge = STATUS_BADGES[agv.status] ?? STATUS_BADGES.idle;

  return (
    <Card className="flex flex-col gap-3 border-border bg-secondary/50 p-3 shadow-none">
      <div className="flex items-start gap-3">
        <StatusGlyph status={agv.status} />
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">{agv.name}</h4>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {agv.id}
              </p>
            </div>
            <Badge variant={statusBadge.variant} className="ml-auto text-xs">
              {statusBadge.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <MetricRow
              label="Position"
              value={`(${agv.position.x.toFixed(1)}, ${agv.position.y.toFixed(1)})`}
              icon={<Navigation2 className="h-3 w-3 text-sky-400" />}
            />
            <MetricRow
              label="Speed"
              value={`${agv.speed.toFixed(1)} m/s`}
              icon={<Activity className="h-3 w-3 text-emerald-400" />}
            />
            <MetricRow
              label="Battery"
              value={`${agv.battery}%`}
              icon={batteryVariant.icon}
            />
            <MetricRow
              label="Distance"
              value={`${agv.distanceTraveled.toFixed(1)} m`}
              icon={<Navigation2 className="h-3 w-3 rotate-90 text-indigo-400" />}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-muted-foreground">Battery Health</span>
          <span className={batteryVariant.textClass}>{batteryVariant.caption}</span>
        </div>
        <Progress value={agv.battery} className={`h-1.5 ${batteryVariant.barClass}`} />
      </div>

      {hasJob ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start gap-2 text-xs">
                <Package className="h-3.5 w-3.5 text-primary" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-medium text-foreground">{agv.currentJob?.itemName}</span>
                  <span className="text-[11px] text-muted-foreground">Job • {agv.currentJob?.id}</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="space-y-1 text-xs">
              <p className="font-semibold text-foreground">{agv.currentJob?.itemName}</p>
              <p>Priority: {agv.currentJob?.priority.toUpperCase()}</p>
              <p>
                Route:{' '}
                ({agv.currentJob?.pickupLocation.x}, {agv.currentJob?.pickupLocation.y}) → (
                {agv.currentJob?.dropoffLocation.x}, {agv.currentJob?.dropoffLocation.y})
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Badge variant="secondary" className="w-fit text-xs text-muted-foreground">
          No job assigned
        </Badge>
      )}
    </Card>
  );
};

/* ---------- HELPER COMPONENTS & UTILITIES ---------- */
const EmptyState = () => (
  <Card className="border-dashed border-border bg-background/60 py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
      <Bot className="h-6 w-6 text-muted-foreground" />
    </div>
    <h4 className="mt-3 text-sm font-semibold text-foreground">No matching vehicles</h4>
    <p className="mx-auto mt-1 max-w-[200px] text-xs text-muted-foreground">
      Adjust filters or search to find the AGV you’re looking for.
    </p>
  </Card>
);

const MetricRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-md bg-background/50 px-2 py-1">
    <span className="flex items-center gap-1 text-muted-foreground">
      {icon}
      {label}
    </span>
    <span className="font-mono text-[11px] text-foreground">{value}</span>
  </div>
);

const StatusGlyph = ({ status }: { status: AGV['status'] }) => {
  const glyphColors: Record<AGV['status'], string> = {
    idle: 'from-emerald-400/80 to-emerald-500/60',
    moving: 'from-sky-400/80 to-blue-500/60',
    charging: 'from-amber-400/80 to-orange-500/60',
    error: 'from-rose-400/80 to-red-500/60',
  };

  return (
    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br shadow-sm">
      <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${glyphColors[status]}`} />
      <span className="relative text-[10px] font-semibold uppercase text-white">
        {status.charAt(0)}
      </span>
    </div>
  );
};

const statusRank = (status: AGV['status']): number => {
  switch (status) {
    case 'moving':
      return 0;
    case 'charging':
      return 1;
    case 'idle':
      return 2;
    case 'error':
      return 3;
    default:
      return 4;
  }
};

const STATUS_BADGES: Record<
  AGV['status'],
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  moving: { variant: 'default', label: 'In Transit' },
  idle: { variant: 'secondary', label: 'Idle' },
  charging: { variant: 'outline', label: 'Charging' },
  error: { variant: 'destructive', label: 'Error' },
};

const batteryVariants = {
  high: {
    icon: <BatteryFull className="h-3 w-3 text-emerald-400" />,
    caption: 'Optimal',
    barClass: '[&>div]:bg-emerald-500',
    textClass: 'text-emerald-400',
  },
  medium: {
    icon: <BatteryMedium className="h-3 w-3 text-amber-400" />,
    caption: 'Moderate',
    barClass: '[&>div]:bg-amber-500',
    textClass: 'text-amber-400',
  },
  low: {
    icon: <BatteryMedium className="h-3 w-3 text-red-400" />,
    caption: 'Low',
    barClass: '[&>div]:bg-red-500',
    textClass: 'text-red-400',
  },
};

const getBatteryVariant = (battery: number) => {
  if (battery >= 70) return batteryVariants.high;
  if (battery >= 35) return batteryVariants.medium;
  return batteryVariants.low;
};

const TOGGLE_OPTIONS: Array<{
  value: StatusFilter;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}> = [
  { value: 'all', label: 'All', icon: Bot },
  { value: 'idle', label: 'Idle', icon: BatteryCharging },
  { value: 'moving', label: 'Active', icon: Navigation2 },
  { value: 'charging', label: 'Charging', icon: BatteryMedium },
  { value: 'error', label: 'Alerts', icon: Activity },
];