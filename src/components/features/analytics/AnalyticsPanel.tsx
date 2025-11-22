import { useCallback, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { Download, LineChart, Rss, Loader2, AlertTriangle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const selector = useCallback(
    (state: ReturnType<typeof useWarehouseStore.getState>) => state.analytics,
    []
  );
  
  const analytics = useWarehouseStore(selector);

  const {
    completionTimes = [],
    jobsByPriority = { urgent: 0, high: 0, medium: 0, low: 0 },
    hourlyJobCount = [],
    lastUpdated,
    streak,
    aggregateWindow = 'Today',
  } = analytics ?? {};

  const isLoading = !analytics;
  const hasAnyData =
    completionTimes.length > 0 || (Object.values(jobsByPriority) as number[]).some(count => count > 0) || hourlyJobCount.length > 0;

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
    <Card className="flex h-full flex-col border-[#262a33] bg-[#12141a] backdrop-blur">
        <div className="flex items-center justify-between border-b border-[#262a33] px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wide">
              Performance Analytics
            </h3>
            <p className="text-xs text-[#9ca3af]/70">Real-time warehouse operations metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-[#050608] border-[#262a33] text-[#f5f5f5] hover:bg-[#1a1d29]"
                  onClick={handleExport}
                  disabled={!hasAnyData}
                >
                  <Download className="h-4 w-4 text-[#f5f5f5]" />
                  Export JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs bg-[#12141a] border-[#262a33] text-[#f5f5f5]">
                Downloads the current analytics snapshot for auditing.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {isLoading && (
              <Card className="flex items-center gap-3 border-[#262a33] bg-[#1a1d29] px-4 py-6 text-sm text-[#9ca3af]">
                <Loader2 className="h-4 w-4 animate-spin text-[#f5f5f5]" />
                Aggregating metrics&hellip; hang tight just a moment.
              </Card>
            )}

            {!isLoading && hasAnyData && <MetricsCards analytics={analytics} />}

            {!isLoading && !hasAnyData && (
              <Card className="flex flex-col items-start gap-3 border-dashed border-[#262a33] bg-[#1a1d29] p-6 text-sm text-[#9ca3af]">
                <div className="flex items-center gap-2 text-[#f5f5f5]">
                  <AlertTriangle className="h-4 w-4 text-[#9ca3af]" />
                  No telemetry yet
                </div>
                <p>
                  Jobs haven't been dispatched in the selected window. Once activity resumes,
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
                <Card className="border-[#262a33] bg-[#1a1d29] p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-[#f5f5f5]">Completion Time Trend</h3>
                  <CompletionTimeChart data={completionTimes} />
                </Card>

                <Card className="border-[#262a33] bg-[#1a1d29] p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-[#f5f5f5]">Priority Distribution</h3>
                  <PriorityDistributionChart data={jobsByPriority} />
                </Card>
              </div>
            )}

            {hasAnyData && (
              <Card className="border-[#262a33] bg-[#1a1d29] p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-[#f5f5f5]">Hourly Job Completion</h3>
                <HourlyJobChart data={hourlyJobCount} />
              </Card>
            )}
          </div>
        </ScrollArea>
      </Card>
  );
};