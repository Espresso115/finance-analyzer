import { Bar, BarChart, ResponsiveContainer } from 'recharts';

interface SparklineBarProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparklineBar({ data, color = '#1667f2', height = 40 }: SparklineBarProps) {
  const chartData = data.map((value, i) => ({ i, v: value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="v" fill={color} radius={[2, 2, 0, 0]} opacity={0.6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
