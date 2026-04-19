'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { RegionCount } from '../_lib/countByRegion';

export interface RegionChartProps {
  regionCounts: RegionCount[];
}

const BAR_COLOR = 'rgba(226, 138, 123, 0.75)';
const BAR_COLOR_ZERO = 'rgba(226, 138, 123, 0.20)';

export default function RegionChart({ regionCounts }: RegionChartProps) {
  const data = regionCounts.map(r => ({
    label: r.label,
    count: r.count,
    percentage: r.percentage,
  }));

  return (
    <div>
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-faint)',
          marginBottom: 'var(--s-2)',
        }}
      >
        Distribuição por região
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={130}
            tick={{ fontSize: 12, fill: 'var(--text-body)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--ink-2)' }}
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              fontSize: 12,
              color: 'var(--text-body)',
            }}
            formatter={(value: unknown, _name: unknown, props: { payload?: { percentage?: number } }) =>
              [`${value as number} (${props.payload?.percentage ?? 0}%)`, 'Lesões']
            }
          />
          <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count > 0 ? BAR_COLOR : BAR_COLOR_ZERO}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
