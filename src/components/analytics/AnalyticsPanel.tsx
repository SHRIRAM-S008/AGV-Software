import { useCallback, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { Download, LineChart, Rss, Loader2, AlertTriangle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useWarehouseStore } from '@/store/warehouseStore';
import { CompletionTimeChart } from './CompletionTimeChart';
import { PriorityDistributionChart } from './PriorityDistributionChart';
import { HourlyJobChart } from './HourlyJobChart';
import { MetricsCards } from './MetricsCards';

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export const AnalyticsPanel = () => {
  const analytics = useWarehouseStore(
    (state) => state.analytics,
    shallow
  );

  const {
    completionTimes = [],
    jobsByPriority = [],
    hourlyJobCount = [],
    lastUpdated,
    streak,
    aggregateWindow = 'Today',
  } = analytics ?? {};

  const isLoading = !analytics;
  const hasAnyData =
    completionTimes.length > 0 || jobsByPriority.length > 0 || hourlyJobCount.length > 0;

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return 'Awaiting first data sync';
    const updatedDate = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    if (Number.isNaN(updatedDate.getTime())) return 'Awaiting first data sync';
    return `Updated ${timeFormatter.format(updatedDate)}`;
  }, [lastUpdated]);

  const handleExport = useCallback(() => {
    if (!analytics) return;
    const blob = new Blob([JSON.stringify(analytics, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `warehouse-analytics-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [analytics]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-border/80 bg-muted/10 px-4 py-3">
        <div>
          <span className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <LineChart className="h-5 w-5 text-primary" />
            Performance Analytics
          </span>
          <p className="text-xs text-muted-foreground">
            Real-time throughput, priority balance, and completion trends
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className="border-dashed">
              Window · {aggregateWindow}
            </Badge>
            {streak && (
              <Badge variant="secondary" className="gap-1">
                <Rss className="h-3.5 w-3.5 text-primary" />
                {streak}
              </Badge>
            )}
            <span>{lastUpdatedLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleExport}
                  disabled={!hasAnyData}
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                Downloads the current analytics snapshot for auditing.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {isLoading && (
            <Card className="flex items-center gap-3 border-border bg-card/70 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Aggregating metrics&hellip; hang tight just a moment.
            </Card>
          )}

          {!isLoading && hasAnyData && <MetricsCards analytics={analytics} />}

          {!isLoading && !hasAnyData && (
            <Card className="flex flex-col items-start gap-3 border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                No telemetry yet
              </div>
              <p>
                Jobs haven’t been dispatched in the selected window. Once activity resumes,
                completion and priority trends will populate automatically.
              </p>
              <ul className="list-inside list-disc text-xs">
                <li>Queue a few jobs to begin tracking throughput.</li>
                <li>Ensure AGVs are online and assigned.</li>
                <li>Refresh the dashboard after job completion events.</li>
              </ul>
            </Card>
          )}

          {hasAnyData && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-border bg-card/70 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Completion Time Trend</h3>
                <CompletionTimeChart data={completionTimes} />
              </Card>

              <Card className="border-border bg-card/70 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Priority Distribution</h3>
                <PriorityDistributionChart data={jobsByPriority} />
              </Card>
            </div>
          )}

          {hasAnyData && (
            <Card className="border-border bg-card/70 p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Hourly Job Completion</h3>
              <HourlyJobChart data={hourlyJobCount} />
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};