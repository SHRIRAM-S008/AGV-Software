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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { CreateJobDialog } from './CreateJobDialog';
import type { Job } from '@/types/agv';

type StatusFilter = 'all' | Job['status'];
type PriorityFilter = 'all' | Job['priority'];

const selectJobs = (state: ReturnType<typeof useWarehouseStore.getState>) => state.jobs;
const selectAssignJob = (state: ReturnType<typeof useWarehouseStore.getState>) => state.assignJobToAGV;

export const JobPanel = () => {
  const jobs = useWarehouseStore(selectJobs, shallow);
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
      assignJobToAGV(jobId);
    },
    [assignJobToAGV]
  );

  return (
    <Card className="flex h-full flex-col border-border bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Job Queue
          </h3>
          <p className="text-xs text-muted-foreground/70">Manage tasks awaiting fulfillment</p>
        </div>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Job
        </Button>
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

      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
        <Badge variant="outline" className="gap-1 text-[11px]">
          <Clock className="h-3 w-3 text-amber-400" />
          {pendingCount} pending
        </Badge>
        <Badge variant="outline" className="gap-1 text-[11px]">
          <Loader2 className="h-3 w-3 text-sky-400" />
          {activeCount} active
        </Badge>
        <Badge variant="outline" className="gap-1 text-[11px]">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
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
  <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
    <div className="relative flex-1 min-w-[160px]">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search jobs, SKUs, or AGVs..."
        className="pl-9"
      />
    </div>

    <ToggleGroup
      type="single"
      value={statusFilter}
      onValueChange={(value: StatusFilter) => value && onStatusChange(value)}
      className="rounded-lg border border-border p-1"
    >
      {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
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

    <ToggleGroup
      type="single"
      value={priorityFilter}
      onValueChange={(value: PriorityFilter) => value && onPriorityChange(value)}
      className="rounded-lg border border-border p-1"
    >
      {PRIORITY_FILTERS.map(({ value, label, tone }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className={`px-3 py-2 text-xs data-[state=on]:text-white ${tone}`}
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>

    <Select value={sortOption} onValueChange={(value) => onSortChange(value as typeof sortOption)}>
      <SelectTrigger className="w-[170px]">
        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Sort jobs" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="priority">Priority (High → Low)</SelectItem>
        <SelectItem value="createdAt">Newest First</SelectItem>
        <SelectItem value="status">Status</SelectItem>
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
    <Card className="border-border bg-secondary/40 p-3 shadow-none transition hover:border-primary/60">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary">
              {job.id}
            </Badge>
            <Badge variant={statusBadge.variant} className="text-[11px] uppercase">
              {statusBadge.label}
            </Badge>
            {job.createdAt && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[11px]">
                      <Clock className="mr-1 h-3 w-3" />
                      {timeAgo(job.createdAt)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    Created {job.createdAt.toLocaleString()}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <h4 className="text-sm font-semibold text-foreground">{job.itemName}</h4>
          <p className="text-xs text-muted-foreground">
            Qty <span className="font-mono text-foreground">{job.quantity}</span>
          </p>
        </div>
        <Badge variant={priorityBadge.variant} className="text-xs">
          {priorityBadge.label}
        </Badge>
      </div>

      <Separator className="my-3 bg-border/60" />

      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <Metric
          icon={<Package className="h-3 w-3 text-sky-400" />}
          label="Assigned AGV"
          value={job.assignedAgv ? job.assignedAgv : '—'}
        />
        <Metric
          icon={<MapPin className="h-3 w-3 text-emerald-400" />}
          label="Pick-up"
          value={`(${job.pickupLocation.x}, ${job.pickupLocation.y})`}
        />
        <Metric
          icon={<MapPin className="h-3 w-3 rotate-180 text-rose-400" />}
          label="Drop-off"
          value={`(${job.dropoffLocation.x}, ${job.dropoffLocation.y})`}
        />
        {job.startedAt && (
          <Metric
            icon={<Loader2 className="h-3 w-3 animate-spin text-primary" />}
            label="Started"
            value={timeAgo(job.startedAt)}
          />
        )}
      </div>

      {job.completedAt && (
        <div className="mt-2 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
          Completed {timeAgo(job.completedAt)}
        </div>
      )}

      {job.status === 'failed' && job.assignedAgv && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-rose-500/10 px-2 py-1 text-xs text-rose-400">
          <AlertTriangle className="h-3 w-3" />
          Requires reassignment
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {canStart && (
          <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => onAssign(job.id)}>
            <Play className="h-3 w-3" />
            Dispatch
          </Button>
        )}
        {job.status === 'in-progress' && (
          <Badge variant="outline" className="gap-1 text-[11px]">
            <Loader2 className="h-3 w-3 animate-spin text-sky-400" />
            In transit
          </Badge>
        )}
        {!canStart && job.status !== 'failed' && (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <PauseCircle className="h-3 w-3" />
            Awaiting completion
          </Badge>
        )}
      </div>
    </Card>
  );
};

/* ---------- Helper Components ---------- */
const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-md bg-background/50 px-2 py-1">
    <span className="flex items-center gap-1 text-muted-foreground">
      {icon}
      {label}
    </span>
    <span className="font-mono text-[11px] text-foreground">{value}</span>
  </div>
);

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <Card className="border-dashed border-border bg-background/60 py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
      <RefreshCcw className="h-5 w-5 text-muted-foreground" />
    </div>
    <h4 className="mt-3 text-sm font-semibold text-foreground">No jobs to display</h4>
    <p className="mx-auto mt-1 max-w-[220px] text-xs text-muted-foreground">
      Change filters or create a new job to populate the queue.
    </p>
    <Button size="sm" variant="outline" className="mt-4" onClick={onCreate}>
      <Plus className="mr-2 h-3 w-3" />
      Create job
    </Button>
  </Card>
);

/* ---------- Utility Functions ---------- */
const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = [
  { value: 'all', label: 'All', icon: RefreshCcw },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in-progress', label: 'Active', icon: Loader2 },
  { value: 'completed', label: 'Done', icon: CheckCircle2 },
  { value: 'failed', label: 'Failed', icon: AlertTriangle },
];

const PRIORITY_FILTERS: Array<{ value: PriorityFilter; label: string; tone: string }> = [
  { value: 'all', label: 'Priority', tone: 'data-[state=on]:bg-primary' },
  { value: 'urgent', label: 'Urgent', tone: 'data-[state=on]:bg-red-500' },
  { value: 'high', label: 'High', tone: 'data-[state=on]:bg-orange-500' },
  { value: 'medium', label: 'Medium', tone: 'data-[state=on]:bg-amber-500' },
  { value: 'low', label: 'Low', tone: 'data-[state=on]:bg-emerald-500' },
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
    case 'urgent':
      return 0;
    case 'in-progress':
      return 1;
    case 'pending':
      return 2;
    case 'completed':
      return 3;
    case 'failed':
      return 0;
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