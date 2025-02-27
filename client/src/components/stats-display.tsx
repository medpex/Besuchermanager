import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from "recharts";

type StatsDisplayProps = {
  data: any[];
  type: 'weekday' | 'timeInterval' | 'month';
  className?: string;
};

// Enhanced color palette for better visual appeal
const CHART_COLORS = {
  '2025': '#3b82f6', // blue
  '2024': '#10b981', // emerald
  '2023': '#f59e0b', // amber
  '2022': '#ef4444', // red
  '2021': '#8b5cf6', // violet
  '2020': '#6366f1'  // indigo
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="font-medium">{label}</p>
        <div className="space-y-1 mt-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm text-gray-600">
                {`Jahr ${entry.dataKey}: ${entry.value} Besuche`}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function StatsDisplay({ data, type, className = "" }: StatsDisplayProps) {
  if (!data?.length) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center p-8 text-gray-500">
          <p className="text-lg font-medium">Keine Daten verfügbar</p>
          <p className="text-sm">Für diesen Zeitraum liegen keine statistischen Daten vor.</p>
        </div>
      </Card>
    );
  }

  const getTitle = () => {
    switch (type) {
      case 'weekday':
        return 'Besuchsverteilung nach Wochentag';
      case 'timeInterval':
        return 'Besuchsverteilung nach Tageszeit';
      case 'month':
        return 'Besuchsverteilung nach Monat';
      default:
        return '';
    }
  };

  // Extract years from the first data point, excluding 'name' field
  const years = Object.keys(data[0] || {})
    .filter(key => key !== 'name')
    .sort((a, b) => b.localeCompare(a)); // Sort years in descending order

  // Calculate total visits for each year
  const yearTotals = years.reduce((acc, year) => {
    acc[year] = data.reduce((sum, item) => sum + (item[year] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  // Find max value for better y-axis scaling
  const maxValue = Math.max(...data.map(item => 
    Math.max(...years.map(year => item[year] || 0))
  ));

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col mb-4">
          <h3 className="text-lg font-semibold mb-2">{getTitle()}</h3>

          {/* Year summary */}
          <div className="flex flex-wrap gap-3 mb-4">
            {years.map(year => (
              <div 
                key={year} 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${CHART_COLORS[year]}20`, 
                  color: CHART_COLORS[year],
                  border: `1px solid ${CHART_COLORS[year]}40`
                }}
              >
                {year}: {yearTotals[year]} Besuche
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            barSize={28}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              allowDecimals={false}
              domain={[0, maxValue * 1.1]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle"
              formatter={(value) => `Jahr ${value}`}
            />
            {years.map((year) => (
              <Bar 
                key={year}
                dataKey={year}
                name={year}
                fill={CHART_COLORS[year] || '#000000'}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}