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
  type: 'weekday' | 'timeInterval' | 'month' | 'subcategory';
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

// Funktion zum Abkürzen langer Kategorienamen
const shortenName = (name: string, maxLength = 20): string => {
  if (!name) return '';

  // Bekannte Abkürzungen
  const abbreviations: Record<string, string> = {
    "Media allgemeine Beratung": "Media allg. Beratung",
    "Energie allgemeine Beratung": "Energie allg. Beratung",
    "Media Vertragsabschluss": "Media Vertrag",
    "Energie Vertragsabschluss": "Energie Vertrag",
    "Media Rechnungen/FM": "Media Rech./FM",
    "Energie Rechnungen/FM": "Energie Rech./FM",
    "Energie/Kundenverwaltung": "Energie/Kundenv.",
    "Media Kundenverwaltung": "Media Kundenv.",
    "Energie Technik/HA": "Energie Technik",
    "Media Technik/HA": "Media Technik",
    "E-Mobilität/PV": "E-Mobilität"
  };

  // Verwende Abkürzung, falls vorhanden
  if (abbreviations[name]) {
    return abbreviations[name];
  }

  // Kürze ansonsten den Text ab
  if (name.length > maxLength) {
    return name.substring(0, maxLength - 3) + '...';
  }

  return name;
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
      case 'subcategory':
        return 'Besuchsverteilung nach Unterkategorien';
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

  // Limit the number of items shown for subcategory to avoid overcrowding
  const displayData = type === 'subcategory' 
    ? data.slice(0, 12).map(item => ({  // Reduzieren auf 12 Unterkategorien
        ...item,
        name: shortenName(item.name)    // Namen abkürzen
      }))
    : data;

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

        <ResponsiveContainer width="100%" height={type === 'subcategory' ? 400 : 300}>
          <BarChart 
            data={displayData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            barSize={type === 'subcategory' ? 18 : 28}  // Dünnere Balken für Unterkategorien
            barGap={type === 'subcategory' ? 4 : 2}
            layout={type === 'subcategory' ? 'vertical' : 'horizontal'}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            {type === 'subcategory' ? (
              <>
                <XAxis 
                  type="number"
                  domain={[0, maxValue * 1.1]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  width={120}  // Reduzierte Breite für Beschriftungen
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
              </>
            ) : (
              <>
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
              </>
            )}
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
                radius={type === 'subcategory' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}