import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SubcategoryMonthlyStatsProps = {
  data: any[];
  year: string;
  category: string;
  location: string;
  className?: string;
};

export default function SubcategoryMonthlyStats({ 
  data, 
  year, 
  category, 
  location, 
  className = "" 
}: SubcategoryMonthlyStatsProps) {
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

  // Filter data by category
  const filteredData = data.filter(item => item.category === category);

  // Vorbereitete Monatsnamen in der richtigen Reihenfolge
  const months = [
    "Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", 
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
  ];

  // Extrahiere alle Unterkategorien für diese Kategorie
  const subcategories = Array.from(
    new Set(filteredData.map(item => item.subcategory))
  ).sort();

  // Gruppiere die Daten nach Unterkategorie und Monat
  const groupedData = filteredData.reduce((acc, item) => {
    const month = new Date(item.timestamp).getMonth();
    if (!acc[item.subcategory]) {
      acc[item.subcategory] = Array(12).fill(0);
    }
    acc[item.subcategory][month] += 1;
    return acc;
  }, {} as Record<string, number[]>);

  // Berechne Gesamtwerte für jede Unterkategorie und jeden Monat
  const subcategoryTotals = subcategories.reduce((acc, subcategory) => {
    acc[subcategory] = (groupedData[subcategory] || []).reduce((sum, count) => sum + count, 0);
    return acc;
  }, {} as Record<string, number>);

  const monthlyTotals = Array(12).fill(0);
  Object.values(groupedData).forEach(monthCounts => {
    monthCounts.forEach((count, idx) => {
      monthlyTotals[idx] += count;
    });
  });

  // Gesamtanzahl der Besuche für diese Kategorie
  const totalVisits = monthlyTotals.reduce((sum, count) => sum + count, 0);

  // Berechne Prozentsätze
  const calculatePercentage = (value: number) => {
    if (!totalVisits) return "0,00%";
    return ((value / totalVisits) * 100).toFixed(2).replace('.', ',') + '%';
  };

  // Bestimme die Hintergrundfarbe basierend auf der Kategorie
  const getBgColor = () => {
    switch (category) {
      case "Media": return "bg-purple-50";
      case "Energie": return "bg-yellow-50";
      case "Allgemeines": return "bg-green-50";
      default: return "bg-gray-50";
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className={`pb-2 ${getBgColor()}`}>
        <CardTitle className="text-lg font-semibold">
          {category} - {year} - {location}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Unterkategorie</TableHead>
                {months.map(month => (
                  <TableHead key={month} className="text-right font-bold">{month}</TableHead>
                ))}
                <TableHead className="text-right font-bold">Gesamt</TableHead>
                <TableHead className="text-right font-bold">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((subcategory, index) => {
                const monthlyCounts = groupedData[subcategory] || Array(12).fill(0);
                const subcategoryTotal = subcategoryTotals[subcategory] || 0;
                
                return (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium">{subcategory}</TableCell>
                    {monthlyCounts.map((count, idx) => (
                      <TableCell key={idx} className="text-right">{count}</TableCell>
                    ))}
                    <TableCell className="text-right font-semibold">{subcategoryTotal}</TableCell>
                    <TableCell className="text-right">{calculatePercentage(subcategoryTotal)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className={`font-bold ${getBgColor()}`}>
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