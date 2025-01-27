import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StatsDisplayProps = {
  data: any[];
  type: 'weekday' | 'timeInterval' | 'month';
};

const CHART_COLORS = {
  '2020': '#8884d8',
  '2021': '#82ca9d',
  '2022': '#ffc658',
  '2023': '#ff7300',
  '2024': '#0088fe'
};

export default function StatsDisplay({ data, type }: StatsDisplayProps) {
  if (!data?.length) {
    return <div>Keine Daten verfügbar</div>;
  }

  const getTitle = () => {
    switch (type) {
      case 'weekday':
        return 'Besuche - häufigster Wochentag';
      case 'timeInterval':
        return 'Besuche - Uhrzeit Intervall';
      case 'month':
        return 'Besuche - häufigster Monat';
      default:
        return '';
    }
  };

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
          {Object.keys(CHART_COLORS).map((year) => (
            <Bar 
              key={year}
              dataKey={year}
              name={year}
              fill={CHART_COLORS[year]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}