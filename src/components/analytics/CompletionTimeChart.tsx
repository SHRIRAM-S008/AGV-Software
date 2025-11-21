import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface CompletionTimeChartProps {
  data: Array<{
    timestamp: Date;
    duration: number;
    jobId: string;
  }>;
}

const chartMargin = { top: 12, right: 20, bottom: 8, left: 12 };

export const CompletionTimeChart = ({ data }: CompletionTimeChartProps) => {
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((item, index) => {
      const parsed = new Date(item.timestamp);
      return {
        index: index + 1,
        duration: item.duration,
        jobId: item.jobId,
        timestamp: parsed,
        label: `${format(parsed, 'HH:mm:ss')} · #${item.jobId}`,
      };
    });
  }, [data]);

  const averageDuration = useMemo(() => {
    if (!chartData.length) return 0;
    const total = chartData.reduce((sum, item) => sum + item.duration, 0);
    return Number((total / chartData.length).toFixed(2));
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
        <span>No completion data yet</span>
        <span className="text-xs">Jobs will appear here as they finish.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={chartMargin}>
        <defs>
          <linearGradient id="completionLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.65} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />

        <XAxis
          dataKey="timestamp"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={(value: Date) => format(value, 'HH:mm')}
          minTickGap={24}
          axisLine={false}
        />

        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          domain={['auto', 'auto']}
          width={56}
          axisLine={false}
          tickLine={false}
          label={{
            value: 'Seconds',
            angle: -90,
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 12,
            offset: 12,
          }}
        />

        <ReferenceLine
          y={averageDuration}
          stroke="hsl(var(--primary))"
          strokeDasharray="4 3"
          strokeOpacity={0.6}
          label={{
            value: `Avg · ${averageDuration}s`,
            position: 'right',
            fill: 'hsl(var(--primary))',
            fontSize: 11,
          }}
        />

        <Tooltip
          content={<CompletionTooltip />}
          cursor={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.2, strokeWidth: 2 }}
        />

        <Line
          type="monotone"
          dataKey="duration"
          stroke="url(#completionLine)"
          strokeWidth={2.5}
          dot={{
            r: 4,
            stroke: 'hsl(var(--card))',
            strokeWidth: 1.5,
            fill: 'hsl(var(--primary))',
          }}
          activeDot={{
            r: 6,
            stroke: 'hsl(var(--card))',
            strokeWidth: 2,
            fill: 'hsl(var(--primary))',
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const CompletionTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as {
    duration: number;
    jobId: string;
    timestamp: Date;
    label: string;
  };

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-foreground">{point.label}</div>
      <div className="mt-1 text-muted-foreground">
        Duration: <span className="font-mono text-foreground">{point.duration.toFixed(2)}s</span>
      </div>
      <div className="text-muted-foreground">
        Job ID: <span className="font-mono text-foreground">{point.jobId}</span>
      </div>
    </div>
  );
};