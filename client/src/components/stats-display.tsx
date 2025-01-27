import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StatsDisplayProps = {
  stats: any[];
};

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  if (!stats?.length) {
    return <div>No data available</div>;
  }

  const chartData = stats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString(),
    visits: stat.count,
    category: stat.category,
  }));

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="visits" name="Visits" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
