import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CategoryMonthlyStatsProps = {
  data: any[];
  year: string;
  location: string;
  className?: string;
};

export default function CategoryMonthlyStats({ data, year, location, className = "" }: CategoryMonthlyStatsProps) {
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

  // Vorbereitete Monatsnamen in der richtigen Reihenfolge
  const months = [
    "Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", 
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
  ];

  // Extrahiere alle Kategorien aus den Daten
  const categories = Array.from(new Set(data.map(item => item.category)));

  // Gruppiere die Daten nach Kategorie und Monat
  const groupedData = data.reduce((acc, item) => {
    const month = new Date(item.timestamp).getMonth();
    if (!acc[item.category]) {
      acc[item.category] = Array(12).fill(0);
    }
    acc[item.category][month] += 1;
    return acc;
  }, {} as Record<string, number[]>);

  // Berechne Gesamtwerte für jede Kategorie und jeden Monat
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = (groupedData[category] || []).reduce((sum, count) => sum + count, 0);
    return acc;
  }, {} as Record<string, number>);

  const monthlyTotals = Array(12).fill(0);
  Object.values(groupedData).forEach(monthCounts => {
    monthCounts.forEach((count, idx) => {
      monthlyTotals[idx] += count;
    });
  });

  // Gesamtanzahl der Besuche
  const totalVisits = monthlyTotals.reduce((sum, count) => sum + count, 0);

  // Berechne Prozentsätze
  const calculatePercentage = (value: number) => {
    if (!totalVisits) return "0,00%";
    return ((value / totalVisits) * 100).toFixed(2).replace('.', ',') + '%';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{year} - {location}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Kategorie</TableHead>
                {months.map(month => (
                  <TableHead key={month} className="text-right font-bold">{month}</TableHead>
                ))}
                <TableHead className="text-right font-bold">Gesamt</TableHead>
                <TableHead className="text-right font-bold">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => {
                const monthlyCounts = groupedData[category] || Array(12).fill(0);
                const categoryTotal = categoryTotals[category] || 0;
                
                return (
                  <TableRow 
                    key={index} 
                    className={
                      category === "Media" ? "bg-purple-50" : 
                      category === "Energie" ? "bg-yellow-50" : 
                      "bg-green-50"
                    }
                  >
                    <TableCell className="font-medium">{category}</TableCell>
                    {monthlyCounts.map((count, idx) => (
                      <TableCell key={idx} className="text-right">{count}</TableCell>
                    ))}
                    <TableCell className="text-right font-semibold">{categoryTotal}</TableCell>
                    <TableCell className="text-right">{calculatePercentage(categoryTotal)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>Besuche gesamt</TableCell>
                {monthlyTotals.map((total, idx) => (
                  <TableCell key={idx} className="text-right">{total}</TableCell>
                ))}
                <TableCell className="text-right">{totalVisits}</TableCell>
                <TableCell className="text-right">100,00%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}