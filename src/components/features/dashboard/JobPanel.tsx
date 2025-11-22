import { useMemo, useState, useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import {
  Plus,
  Play,
  AlertTriangle,
  Clock,
  Package,
  MapPin,
  Search,
  Filter,
  RefreshCcw,
  CheckCircle2,
  Loader2,
  PauseCircle,
  Activity,
  Navigation,
  XCircle,
} from 'lucide-react';

import { useWarehouseStore } from '@/store/warehouseStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { CreateJobDialog } from './CreateJobDialog';
import type { Job } from '@/types/agv';

type StatusFilter = 'all' | Job['status'];
type PriorityFilter = 'all' | Job['priority'];

const selectJobs = (state: ReturnType<typeof useWarehouseStore.getState>) => state.jobs;
const selectAssignJob = (state: ReturnType<typeof useWarehouseStore.getState>) => state.assignJobToAGV;

export const JobPanel = () => {
  const jobs = useWarehouseStore(selectJobs);
  const agvs = useWarehouseStore(state => state.agvs);
  const assignJobToAGV = useWarehouseStore(selectAssignJob);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortOption, setSortOption] = useState<'priority' | 'createdAt' | 'status'>('priority');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        job.id.toLowerCase().includes(normalizedQuery) ||
        job.itemName.toLowerCase().includes(normalizedQuery) ||
        job.assignedAgv?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesPriority && matchesQuery;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'createdAt':
          return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
        case 'status':
          return statusWeight(a.status) - statusWeight(b.status);
        case 'priority':
        default:
          return priorityWeight(b.priority) - priorityWeight(a.priority);
      }
    });
  }, [jobs, searchQuery, statusFilter, priorityFilter, sortOption]);

  const pendingCount = useMemo(() => jobs.filter((job) => job.status === 'pending').length, [jobs]);
  const activeCount = useMemo(() => jobs.filter((job) => job.status === 'in-progress').length, [jobs]);
  const completedCount = useMemo(() => jobs.filter((job) => job.status === 'completed').length, [jobs]);

  const handleAssign = useCallback(
    (jobId: string) => {
      // For now, assign to first available AGV (this could be enhanced with AGV selection)
      const availableAgvs = agvs.filter(agv => agv.status === 'idle');
      if (availableAgvs.length > 0) {
        assignJobToAGV(availableAgvs[0].id, jobId);
      }
    },
    [assignJobToAGV, agvs]
  );

  return (
    <Card className="flex h-full flex-col border-[#333333] bg-[#000000] backdrop-blur">
      <div className="flex items-center justify-between border-b border-[#333333] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-[#CCCCCC] uppercase tracking-wide">Job Queue</h3>
          <p className="text-xs text-[#CCCCCC]/70">Active warehouse operations</p>
        </div>
        <Badge variant="outline" className="gap-2 text-xs border-[#333333] text-[#FFFFFF]">
          <Activity className="h-3.5 w-3.5 text-[#FFFFFF]" />
          Live Data
        </Badge>
      </div>

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <div className="flex items-center gap-2 border-b border-[#262a33] px-4 py-2 text-[11px] text-[#9ca3af]">
        <Badge variant="outline" className="gap-1 text-[11px] border-[#4b5563] text-[#f5f5f5]">
          <Clock className="h-3 w-3 text-[#9ca3af]" />
          {pendingCount} pending
        </Badge>
        <Badge variant="outline" className="gap-1 text-[11px] border-[#4b5563] text-[#f5f5f5]">
          <Loader2 className="h-3 w-3 text-[#f5f5f5]" />
          {activeCount} active
        </Badge>
        <Badge variant="outline" className="gap-1 text-[11px] border-[#4b5563] text-[#f5f5f5]">
          <CheckCircle2 className="h-3 w-3 text-[#9ca3af]" />
          {completedCount} completed
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <EmptyState onCreate={() => setCreateDialogOpen(true)} />
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onAssign={handleAssign} />
            ))
          )}
        </div>
      </ScrollArea>

      <CreateJobDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </Card>
  );
};

/* ---------- Toolbar ---------- */
const Toolbar = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortOption,
  onSortChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  sortOption: 'priority' | 'createdAt' | 'status';
  onSortChange: (value: 'priority' | 'createdAt' | 'status') => void;
}) => (
  <div className="flex flex-wrap items-center gap-3 border-b border-[#333333] px-4 py-3">
    <div className="relative flex-1 min-w-[160px]">
      <Search className="absolute left-3 top-3 h-4 w-4 text-[#666666]" />
      <Input
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 bg-[#000000] border-[#333333] text-[#FFFFFF] placeholder-[#666666] focus:border-[#FFFFFF]"
      />
    </div>

    <ToggleGroup
      type="single"
      value={statusFilter}
      onValueChange={(value: StatusFilter) => value && onStatusChange(value)}
      className="rounded-lg border border-[#333333] p-1 bg-[#000000]"
    >
      {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
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

    <ToggleGroup
      type="single"
      value={priorityFilter}
      onValueChange={(value: PriorityFilter) => value && onPriorityChange(value)}
      className="rounded-lg border border-[#333333] p-1 bg-[#000000]"
    >
      {PRIORITY_FILTERS.map(({ value, label, tone }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className={`px-3 py-2 text-xs data-[state=on]:bg-[#FFFFFF] data-[state=on]:text-[#000000] text-[#CCCCCC] hover:bg-[#333333]`}
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>

    <Select value={sortOption} onValueChange={(value) => onSortChange(value as typeof sortOption)}>
      <SelectTrigger className="w-[170px] bg-[#000000] border-[#333333] text-[#FFFFFF]">
        <Filter className="mr-2 h-4 w-4 text-[#FFFFFF]" />
        <SelectValue placeholder="Sort jobs" />
      </SelectTrigger>
      <SelectContent className="bg-[#000000] border-[#333333] text-[#FFFFFF]">
        <SelectItem value="priority" className="text-[#FFFFFF] focus:bg-[#333333]">Priority First</SelectItem>
        <SelectItem value="createdAt" className="text-[#FFFFFF] focus:bg-[#333333]">Newest First</SelectItem>
        <SelectItem value="status" className="text-[#FFFFFF] focus:bg-[#333333]">By Status</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

/* ---------- Job Card ---------- */
const JobCard = ({ job, onAssign }: { job: Job; onAssign: (jobId: string) => void }) => {
  const priorityBadge = PRIORITY_BADGES[job.priority] ?? PRIORITY_BADGES.low;
  const statusBadge = STATUS_BADGES[job.status] ?? STATUS_BADGES.pending;
  const canStart = job.status === 'pending';

  return (
    <Card className="border-[#333333] bg-[#000000] p-3 shadow-none transition hover:border-[#FFFFFF]">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-[#FFFFFF] border-[#333333]">
              {job.id}
            </Badge>
            <Badge variant={statusBadge.variant} className="text-[11px] uppercase bg-[#333333] text-[#FFFFFF] border-[#333333]">
              {statusBadge.label}
            </Badge>
            {job.createdAt && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[11px] border-[#333333] text-[#FFFFFF]">
                    <Clock className="mr-1 h-3 w-3" />
                    {timeAgo(job.createdAt)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-xs bg-[#000000] border-[#333333] text-[#FFFFFF]">
                  Created {job.createdAt.toLocaleString()}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <h4 className="text-sm font-semibold text-[#FFFFFF]">{job.itemName}</h4>
          <p className="text-xs text-[#CCCCCC]">
            Qty <span className="font-mono text-[#FFFFFF]">{job.quantity}</span>
          </p>
        </div>
        <Badge variant={priorityBadge.variant} className="text-xs bg-[#333333] text-[#FFFFFF] border-[#333333]">
          {priorityBadge.label}
        </Badge>
      </div>

      <Separator className="my-3 bg-[#333333]" />

      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <Metric
          icon={<Package className="h-3 w-3 text-[#CCCCCC]" />}
          label="Assigned AGV"
          value={job.assignedAgv ? job.assignedAgv : '—'}
        />
        <Metric
          icon={<MapPin className="h-3 w-3 text-[#CCCCCC]" />}
          label="Pick-up"
          value={`(${job.pickupLocation.x}, ${job.pickupLocation.y})`}
        />
        <Metric
          icon={<MapPin className="h-3 w-3 rotate-180 text-[#CCCCCC]" />}
          label="Drop-off"
          value={`(${job.dropLocation.x}, ${job.dropLocation.y})`}
        />
        {job.startedAt && (
          <Metric
            icon={<Loader2 className="h-3 w-3 animate-spin text-[#CCCCCC]" />}
            label="Started"
            value={timeAgo(job.startedAt)}
          />
        )}
      </div>

      {canStart && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-2 bg-[#000000] border-[#333333] text-[#FFFFFF] hover:bg-[#333333]"
              onClick={() => onAssign(job.id)}
            >
              <Play className="h-3.5 w-3.5" />
              Dispatch
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#000000] border-[#333333] text-[#FFFFFF]">
            Assign to nearest available AGV
          </TooltipContent>
        </Tooltip>
      )}

      {job.status === 'failed' && job.assignedAgv && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-[#333333] px-2 py-1 text-xs text-[#FFFFFF]">
          <AlertTriangle className="h-3 w-3" />
          Requires reassignment
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {canStart && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-[#FFFFFF] hover:bg-[#333333]"
            onClick={() => onAssign(job.id)}
          >
            <RefreshCcw className="h-3 w-3" />
            Reassign
          </Button>
        )}
        {job.status === 'in-progress' && (
          <Badge variant="outline" className="gap-1 text-[11px] border-[#4b5563] text-[#f5f5f5]">
            <Loader2 className="h-3 w-3 animate-spin text-[#f5f5f5]" />
            In transit
          </Badge>
        )}
        {!canStart && job.status !== 'failed' && (
          <Badge variant="secondary" className="gap-1 text-[11px] bg-[#262a33] text-[#9ca3af] border-[#4b5563]">
            <PauseCircle className="h-3 w-3" />
            Awaiting completion
          </Badge>
        )}
      </div>
    </Card>
  );
};

/* ---------- Helper Components ---------- */
const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-[#333333] bg-[#000000] py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#333333]">
      <Package className="h-6 w-6 text-[#FFFFFF]" />
    </div>
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-[#FFFFFF]">No jobs found</h3>
      <p className="mx-auto mt-1 max-w-[200px] text-xs text-[#CCCCCC]">
        Create your first job to get started with the warehouse simulation.
      </p>
      <Button size="sm" onClick={onCreate} className="mt-4 bg-[#333333] text-[#FFFFFF] border-[#333333] hover:bg-[#FFFFFF] hover:text-[#000000]">
        Create Job
      </Button>
    </div>
  </Card>
);

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2 rounded-md bg-[#000000] px-2 py-1">
    <span className="text-[#CCCCCC]">{icon}</span>
    <span className="text-[#CCCCCC]">{label}:</span>
    <span className="font-mono text-[11px] text-[#FFFFFF]">{value}</span>
  </div>
);

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; icon: React.ComponentType<any> }> = [
  { value: 'all', label: 'Status', icon: Activity },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in-progress', label: 'In Progress', icon: Navigation },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'failed', label: 'Failed', icon: XCircle },
];

const PRIORITY_FILTERS: Array<{ value: PriorityFilter; label: string; tone: string }> = [
  { value: 'all', label: 'Priority', tone: 'data-[state=on]:bg-[#262a33]' },
  { value: 'urgent', label: 'Urgent', tone: 'data-[state=on]:bg-[#262a33]' },
  { value: 'high', label: 'High', tone: 'data-[state=on]:bg-[#262a33]' },
  { value: 'medium', label: 'Medium', tone: 'data-[state=on]:bg-[#262a33]' },
  { value: 'low', label: 'Low', tone: 'data-[state=on]:bg-[#262a33]' },
];

const STATUS_BADGES: Record<Job['status'], { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  pending: { variant: 'secondary', label: 'Pending' },
  'in-progress': { variant: 'default', label: 'In Progress' },
  completed: { variant: 'outline', label: 'Completed' },
  failed: { variant: 'destructive', label: 'Failed' },
};

const PRIORITY_BADGES: Record<Job['priority'], { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
  urgent: { variant: 'destructive', label: 'Urgent' },
  high: { variant: 'default', label: 'High' },
  medium: { variant: 'secondary', label: 'Medium' },
  low: { variant: 'outline', label: 'Low' },
};

const priorityWeight = (priority: Job['priority']) => {
  switch (priority) {
    case 'urgent':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
};

const statusWeight = (status: Job['status']) => {
  switch (status) {
    case 'failed':
      return 0;
    case 'in-progress':
      return 1;
    case 'pending':
      return 2;
    case 'completed':
      return 3;
    default:
      return 4;
  }
};

const timeAgo = (timestamp: Date): string => {
  const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};