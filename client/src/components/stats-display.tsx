import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StatsDisplayProps = {
  data: any[];
  type: 'weekday' | 'timeInterval' | 'month';
};

const CHART_COLORS = {
  '2024': '#0088fe',
  '2023': '#00c49f',
  '2022': '#ffbb28',
  '2021': '#ff8042',
  '2020': '#8884d8'
};

export default function StatsDisplay({ data, type }: StatsDisplayProps) {
  if (!data?.length) {
    return <div>Keine Daten verfügbar</div>;
  }

  const getTitle = () => {
    switch (type) {
      case 'weekday':
        return 'Besuche nach Wochentag';
      case 'timeInterval':
        return 'Besuche nach Uhrzeit';
      case 'month':
        return 'Besuche nach Monat';
      default:
        return '';
    }
  };

  const years = Object.keys(data[0] || {})
    .filter(key => key !== 'name')
    .sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {years.map((year) => (
            <Bar 
              key={year}
              dataKey={year}
              name={`Jahr ${year}`}
              fill={CHART_COLORS[year] || '#000000'}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}