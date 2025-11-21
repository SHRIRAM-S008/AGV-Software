import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PriorityDistributionChartProps {
  data: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

const PRIORITY_COLORS = {
  urgent: 'hsl(var(--destructive))',
  high: 'hsl(var(--warning))',
  medium: 'hsl(var(--primary))',
  low: 'hsl(var(--muted-foreground))',
} as const;

const legendFormatter = (value: string, entry: { color: string }) => (
  <span className="text-sm text-muted-foreground" style={{ color: entry.color }}>
    {value}
  </span>
);

export const PriorityDistributionChart = ({ data }: PriorityDistributionChartProps) => {
  const { total, chartData } = useMemo(() => {
    const entries = [
      { key: 'urgent', name: 'Urgent', value: data.urgent, color: PRIORITY_COLORS.urgent },
      { key: 'high', name: 'High', value: data.high, color: PRIORITY_COLORS.high },
      { key: 'medium', name: 'Medium', value: data.medium, color: PRIORITY_COLORS.medium },
      { key: 'low', name: 'Low', value: data.low, color: PRIORITY_COLORS.low },
    ];

    const filtered = entries.filter((item) => item.value > 0);
    const sum = filtered.reduce((acc, item) => acc + item.value, 0);

    return {
      total: sum,
      chartData: filtered.map((item) => ({
        ...item,
        percent: sum === 0 ? 0 : Number(((item.value / sum) * 100).toFixed(1)),
      })),
    };
  }, [data]);

  if (total === 0) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 text-sm text-muted-foreground">
        <span>No priority data yet</span>
        <span className="text-xs">Queue jobs across priorities to populate this view.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          label={({ name, percent }) => `${name} ${percent}%`}
          labelLine={false}
        >
          {chartData.map((slice) => (
            <Cell key={slice.key} fill={slice.color} stroke="hsl(var(--card))" strokeWidth={1.5} />
          ))}
        </Pie>

        <Tooltip
          content={<PriorityTooltip total={total} />}
          cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.08 }}
        />

        <Legend
          verticalAlign="bottom"
          height={28}
          iconSize={10}
          formatter={legendFormatter}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    percent: number;
    value: number;
  };
}

const PriorityTooltip = ({ active, payload, total }: { active?: boolean; payload?: TooltipPayload[]; total: number }) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0];

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-foreground">{entry.name}</div>
      <div className="text-muted-foreground">
        Jobs: <span className="font-mono text-foreground">{entry.value}</span>
      </div>
      <div className="text-muted-foreground">
        Share: <span className="font-mono text-foreground">{entry.payload.percent}%</span>
      </div>
      <div className="text-muted-foreground">
        Total queue: <span className="font-mono text-foreground">{total}</span>
      </div>
    </div>
  );
};