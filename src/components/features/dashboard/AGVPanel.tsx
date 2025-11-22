import { useState, useMemo, useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import { Bot, BatteryFull, BatteryMedium, BatteryCharging, Activity, Search, Package, Navigation2, Plus } from 'lucide-react';

import { useWarehouseStore } from '@/store/warehouseStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { AGV } from '@/types/agv';

type StatusFilter = 'all' | 'idle' | 'moving' | 'charging' | 'error';

const selectAgvs = (state: ReturnType<typeof useWarehouseStore.getState>) => state.agvs;

export const AGVPanel = () => {
  const agvs = useWarehouseStore(selectAgvs);

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
    <Card className="flex h-full flex-col border-[#333333] bg-[#000000] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-[#333333] px-4 py-3">
        <Bot className="h-5 w-5 text-[#FFFFFF]" />
        <h3 className="text-sm font-semibold text-[#CCCCCC] uppercase tracking-wide">Fleet Control</h3>
        <Badge variant="outline" className="gap-1 text-xs border-[#333333] text-[#FFFFFF]">
          <Activity className="h-3.5 w-3.5 text-[#FFFFFF]" />
          Live
        </Badge>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#CCCCCC]">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#FFFFFF]"></div>
            {movingCount} Active
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-[#666666]"></div>
            {availableCount} Idle
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#333333] px-4 py-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#666666]" />
          <Input
            placeholder="Search AGVs or jobs..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 bg-[#000000] border-[#333333] text-[#FFFFFF] placeholder-[#666666] focus:border-[#FFFFFF]"
          />
        </div>
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(value: StatusFilter) => value && setStatusFilter(value)}
          className="rounded-lg border border-[#333333] p-1 bg-[#000000]"
        >
          {TOGGLE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className="gap-2 px-3 py-2 text-xs data-[state=on]:bg-[#FFFFFF] data-[state=on]:text-[#000000] text-[#CCCCCC] hover:bg-[#333333]"
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
          <SelectTrigger className="w-[180px] bg-[#000000] border-[#333333] text-[#FFFFFF]">
            <SelectValue placeholder="Sort AGVs" />
          </SelectTrigger>
          <SelectContent className="bg-[#000000] border-[#333333] text-[#FFFFFF]">
            <SelectItem value="status" className="text-[#FFFFFF] focus:bg-[#333333]">Status (Priority)</SelectItem>
            <SelectItem value="battery-desc" className="text-[#FFFFFF] focus:bg-[#333333]">Battery (High → Low)</SelectItem>
            <SelectItem value="battery-asc" className="text-[#FFFFFF] focus:bg-[#333333]">Battery (Low → High)</SelectItem>
            <SelectItem value="name-asc" className="text-[#FFFFFF] focus:bg-[#333333]">Name (A → Z)</SelectItem>
            <SelectItem value="name-desc" className="text-[#FFFFFF] focus:bg-[#333333]">Name (Z → A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {filteredAndSortedAgvs.length === 0 ? (
            <EmptyState searchQuery={searchQuery} />
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
    <Card className="flex flex-col gap-3 border-[#333333] bg-[#000000] p-3 shadow-none">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFFFFF]">
          <Bot className="h-5 w-5 text-[#000000]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-[#FFFFFF] truncate">{agv.name}</h4>
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#CCCCCC]">
            <span className="font-mono">{agv.id}</span>
            {hasJob && (
              <Tooltip>
                <TooltipTrigger>
                  <Package className="h-3 w-3 text-[#FFFFFF]" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#000000] border-[#333333] text-[#FFFFFF]">
                  <p>Job {agv.currentJob?.id}</p>
                  <p className="text-[#CCCCCC]">{agv.currentJob?.priority} priority</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-[#CCCCCC]">Battery Health</span>
          <span className={batteryVariant.textClass}>{batteryVariant.caption}</span>
        </div>
        <Progress value={agv.battery} className={`h-1.5 ${batteryVariant.barClass} bg-[#333333]`} />
      </div>

      {hasJob ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start gap-2 text-xs bg-[#000000] border-[#333333] text-[#FFFFFF] hover:bg-[#333333]">
              <Package className="h-3.5 w-3.5 text-[#FFFFFF]" />
              <div className="flex flex-col items-start leading-tight">
                <span className="font-medium text-[#FFFFFF]">{agv.currentJob?.itemName}</span>
                <span className="text-[#CCCCCC]">{agv.currentJob?.pickupLocation?.x},{agv.currentJob?.pickupLocation?.y} → {agv.currentJob?.dropLocation?.x},{agv.currentJob?.dropLocation?.y}</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#000000] border-[#333333] text-[#FFFFFF]">
            <p className="font-medium">{agv.currentJob?.itemName}</p>
            <p className="text-[#CCCCCC]">{agv.currentJob?.pickupLocation?.x},{agv.currentJob?.pickupLocation?.y} → {agv.currentJob?.dropLocation?.x},{agv.currentJob?.dropLocation?.y}</p>
            <p className="text-[#CCCCCC]">Priority: {agv.currentJob?.priority}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-[#333333] bg-[#000000] px-2 py-1">
          <span className="text-xs text-[#CCCCCC]">No active job</span>
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-[#FFFFFF] hover:bg-[#333333]">
            <Plus className="h-3 w-3" />
            Assign
          </Button>
        </div>
      )}
    </Card>
  );
};

/* ---------- HELPER COMPONENTS & UTILITIES ---------- */
const EmptyState = ({ searchQuery }: { searchQuery: string }) => (
  <Card className="border-dashed border-[#333333] bg-[#000000] py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#333333]">
      <Bot className="h-6 w-6 text-[#FFFFFF]" />
    </div>
    <h3 className="mt-4 text-sm font-medium text-[#FFFFFF]">No AGVs found</h3>
    <p className="mt-1 text-xs text-[#CCCCCC]">
      {searchQuery ? 'Try adjusting your search or filters' : 'No AGVs have been added to the system yet'}
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
  <div className="flex items-center justify-between gap-2 rounded-md bg-[#050608] px-2 py-1">
    <span className="flex items-center gap-1 text-[#9ca3af]">
      {icon}
      {label}
    </span>
    <span className="font-mono text-[11px] text-[#f5f5f5]">{value}</span>
  </div>
);

const StatusGlyph = () => null;

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
  paused: { variant: 'secondary', label: 'Paused' },
  manual: { variant: 'outline', label: 'Manual' },
  locked: { variant: 'destructive', label: 'Locked' },
};

const batteryVariants = {
  high: {
    icon: <BatteryFull className="h-2 w-2 text-[#FFFFFF]" />,
    caption: 'Optimal',
    barClass: '[&>div]:bg-[#FFFFFF]',
    textClass: 'text-[#FFFFFF]',
  },
  medium: {
    icon: <BatteryMedium className="h-3 w-3 text-[#CCCCCC]" />,
    caption: 'Moderate',
    barClass: '[&>div]:bg-[#CCCCCC]',
    textClass: 'text-[#CCCCCC]',
  },
  low: {
    icon: <BatteryMedium className="h-3 w-3 text-[#666666]" />,
    caption: 'Low',
    barClass: '[&>div]:bg-[#666666]',
    textClass: 'text-[#666666]',
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