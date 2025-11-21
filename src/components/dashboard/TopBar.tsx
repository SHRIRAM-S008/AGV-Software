import { useCallback, useEffect, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
  Activity,
  Package,
  AlertCircle,
  CheckCircle2,
  BatteryCharging,
  Clock,
  WifiOff,
  Play,
  Pause,
} from 'lucide-react';

import { useWarehouseStore } from '@/store/warehouseStore';
import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export const TopBar = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => ({
      jobs: state.jobs,
      agvs: state.agvs,
      isSimulationPlaying: state.isSimulationPlaying,
    }),
    []
  );

  const { jobs, agvs, isSimulationPlaying } = useWarehouseStore(selector, shallow);

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const jobStats = useMemo(() => {
    const base = { active: 0, pending: 0, completed: 0, errors: 0 };
    for (const job of jobs) {
      switch (job.status) {
        case 'in-progress':
          base.active += 1;
          break;
        case 'pending':
          base.pending += 1;
          break;
        case 'completed':
          base.completed += 1;
          break;
        case 'failed':
          base.errors += 1;
          break;
        default:
          break;
      }
    }
    return base;
  }, [jobs]);

  const fleetStats = useMemo(() => {
    if (agvs.length === 0) {
      return {
        connected: false,
        avgBattery: 0,
        lowBatteryCount: 0,
        label: 'System Offline',
        badgeVariant: 'destructive' as const,
        pulseColor: 'bg-destructive',
      };
    }

    const totalBattery = agvs.reduce((sum, vehicle) => sum + (vehicle.battery ?? 100), 0);
    const avgBattery = Math.round(totalBattery / agvs.length);
    const lowBatteryCount = agvs.filter((vehicle) => (vehicle.battery ?? 100) < 25).length;

    const label = isSimulationPlaying ? 'Simulation: Live' : 'Simulation: Ready';

    return {
      connected: true,
      avgBattery,
      lowBatteryCount,
      label,
      badgeVariant: isSimulationPlaying ? ('default' as const) : ('secondary' as const),
      pulseColor: isSimulationPlaying ? 'bg-emerald-400' : 'bg-slate-400',
    };
  }, [agvs, isSimulationPlaying]);

  const formattedTime = useMemo(() => timeFormatter.format(currentTime), [currentTime]);

  const totalJobs = jobs.length || 1;
  const completionRate = Math.round((jobStats.completed / totalJobs) * 100);

  return (
    <div className="flex w-full items-center justify-between gap-6 rounded-lg border border-border/60 bg-muted/10 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <span className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            AGV Control System
          </span>
          <p className="text-xs text-muted-foreground">
            Orchestrating {agvs.length} vehicle{agvs.length === 1 ? '' : 's'} · {jobs.length} job
            {jobs.length === 1 ? '' : 's'}
          </p>
        </div>

        <Badge variant={fleetStats.badgeVariant} className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full transition-all',
              fleetStats.connected ? 'animate-pulse' : 'animate-none',
              fleetStats.pulseColor
            )}
          />
          {fleetStats.connected ? fleetStats.label : 'System Offline'}
          {!fleetStats.connected && <WifiOff className="h-3.5 w-3.5" />}
          {fleetStats.connected && (isSimulationPlaying ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex cursor-help items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4 text-primary" />
          <span>Active</span>
          <span className="font-mono text-base text-success">{jobStats.active}</span>
        </div>

        <div className="flex cursor-help items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-warning" />
          <span>Pending</span>
          <span className="font-mono text-base text-warning">{jobStats.pending}</span>
        </div>

        <div className="flex cursor-help items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Complete</span>
          <span className="font-mono text-base text-emerald-500">{jobStats.completed}</span>
        </div>

        <div className="flex cursor-help items-center gap-2 text-muted-foreground">
          <BatteryCharging className="h-4 w-4 text-cyan-400" />
          <span>Fleet battery</span>
          <span className="font-mono text-base text-cyan-400">{fleetStats.avgBattery}%</span>
        </div>

        <div className="hidden h-6 w-px bg-border/70 sm:block" />

        <div className="flex items-center gap-2 font-mono text-sm text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>{formattedTime}</span>
        </div>

        <div className="hidden flex-col text-right text-[11px] text-muted-foreground sm:flex">
          <span>Completion rate</span>
          <span className="font-mono text-xs text-foreground">{completionRate}%</span>
        </div>
      </div>
    </div>
  );
};