import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import type { AnalyticsData } from '@/types/agv';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  Gauge,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  analytics?: AnalyticsData | null;
}

const metricBaseClasses =
  'flex flex-1 flex-col justify-between gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition hover:border-border';

export const MetricsCards = ({ analytics }: MetricsCardsProps) => {
  const metrics = useMemo(() => {
    const safe = analytics ?? {
      totalJobsCompleted: 0,
      totalJobsFailed: 0,
      averageCompletionTime: 0,
      totalDistanceTraveled: 0,
      completionTrend: 0,
      distanceTrend: 0,
    };

    const completionRate = safe.totalJobsCompleted + safe.totalJobsFailed === 0
      ? 0
      : Math.round(
          (safe.totalJobsCompleted / (safe.totalJobsCompleted + safe.totalJobsFailed)) * 100
        );

    const distanceTrendDirection = Math.sign(safe.distanceTrend ?? 0);
    const completionTrendDirection = Math.sign(safe.completionTrend ?? 0);

    const trendMeta = (direction: number) => {
      if (direction > 0) return { icon: TrendingUp, tone: 'text-emerald-500', label: 'Improving' };
      if (direction < 0) return { icon: TrendingDown, tone: 'text-destructive', label: 'Slower' };
      return { icon: Gauge, tone: 'text-muted-foreground', label: 'Stable' };
    };

    return [
      {
        label: 'Jobs Completed',
        value: safe.totalJobsCompleted,
        icon: CheckCircle2,
        tone: 'text-emerald-500',
        hue: 'bg-emerald-500/15',
        footer: `${completionRate}% success rate`,
      },
      {
        label: 'Jobs Failed',
        value: safe.totalJobsFailed,
        icon: XCircle,
        tone: 'text-destructive',
        hue: 'bg-destructive/15',
        footer: completionRate >= 90 ? 'Healthy error rate' : 'Investigate alerts',
      },
      {
        label: 'Avg. Completion Time',
        value: `${safe.averageCompletionTime.toFixed(1)}s`,
        icon: Clock,
        tone: 'text-primary',
        hue: 'bg-primary/15',
        footerMeta: trendMeta(completionTrendDirection),
        footerValue:
          completionTrendDirection === 0
            ? 'Within normal range'
            : `${Math.abs(safe.completionTrend ?? 0).toFixed(1)}s vs. prev.`,
      },
      {
        label: 'Distance Traveled',
        value: `${safe.totalDistanceTraveled.toFixed(1)}m`,
        icon: Navigation,
        tone: 'text-amber-500',
        hue: 'bg-amber-500/15',
        footerMeta: trendMeta(distanceTrendDirection),
        footerValue:
          distanceTrendDirection === 0
            ? 'Route coverage steady'
            : `${Math.abs(safe.distanceTrend ?? 0).toFixed(1)}m change`,
      },
    ];
  }, [analytics]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(
        ({ label, value, icon: Icon, tone, hue, footer, footerMeta, footerValue }) => (
          <Card key={label} className={metricBaseClasses}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
                <span className="text-2xl font-semibold text-foreground">{value}</span>
              </div>
              <div className={cn('rounded-lg p-2', hue)}>
                <Icon className={cn('h-5 w-5', tone)} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {footerMeta ? (
                <>
                  <footerMeta.icon className={cn('h-3.5 w-3.5', footerMeta.tone)} />
                  <span className="font-medium text-foreground">{footerMeta.label}</span>
                  <span aria-hidden>•</span>
                  <span>{footerValue}</span>
                </>
              ) : (
                <span>{footer}</span>
              )}
            </div>
          </Card>
        )
      )}
    </div>
  );
};