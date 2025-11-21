import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface HourlyJobChartProps {
  data: Array<{
    hour: number;
    count: number;
  }>;
}

const HOURS_IN_DAY = 24;

export const HourlyJobChart = ({ data }: HourlyJobChartProps) => {
  const { chartData, hasActivity, peakHour } = useMemo(() => {
    if (!data?.length) {
      return { chartData: [], hasActivity: false, peakHour: null };
    }

    const normalized = Array.from({ length: HOURS_IN_DAY }, (_, hour) => {
      const found = data.find((entry) => entry.hour === hour);
      return {
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        count: found?.count ?? 0,
      };
    });

    const sorted = normalized.sort((a, b) => a.hour - b.hour);
    const peak = sorted.reduce(
      (best, current) => (current.count > best.count ? current : best),
      sorted[0]
    );

    const active = sorted.some((item) => item.count > 0);

    return {
      chartData: sorted,
      hasActivity: active,
      peakHour: active ? peak : null,
    };
  }, [data]);

  if (!hasActivity) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
        <span>No hourly data yet</span>
        <span className="text-xs">Once jobs start completing, we’ll plot your busiest times.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 8 }}>
        <defs>
          <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />

        <XAxis
          dataKey="label"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          interval={2}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />

        {peakHour && (
          <ReferenceLine
            x={peakHour.label}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 2"
            label={{
              value: `Peak · ${peakHour.count}`,
              position: 'insideTop',
              fill: 'hsl(var(--primary))',
              fontSize: 11,
            }}
          />
        )}

        <Tooltip content={<HourlyTooltip />} cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.08 }} />

        <Bar
          dataKey="count"
          fill="url(#hourlyFill)"
          radius={[6, 6, 0, 0]}
          barSize={18}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const HourlyTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload as { label: string; count: number };

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-foreground">{point.label}</div>
      <div className="text-muted-foreground">
        Jobs completed: <span className="font-mono text-foreground">{point.count}</span>
      </div>
    </div>
  );
};