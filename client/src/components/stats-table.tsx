import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type StatsTableProps = {
  data: any[];
  type: 'weekday' | 'timeInterval' | 'month' | 'subcategory';
  title: string;
  className?: string;
  location?: string;
};

export default function StatsTable({ data, type, title, className = "", location = "" }: StatsTableProps) {
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

  // Get years from the data
  const years = Object.keys(data[0] || {})
    .filter(key => key !== 'name')
    .sort((a, b) => b.localeCompare(a)); // Sort years in descending order

  // Calculate totals for each year and grand total
  const totals = years.reduce((acc, year) => {
    acc[year] = data.reduce((sum, item) => sum + (parseInt(item[year]) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const grandTotal = years.reduce((sum, year) => sum + (totals[year] || 0), 0);

  // Function to calculate percentages
  const calculatePercentage = (value: number, total: number) => {
    if (!total) return "0,00%";
    return ((value / total) * 100).toFixed(2).replace('.', ',') + '%';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}{location ? ` - ${location}` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">{type === 'weekday' ? 'Tage' : type === 'timeInterval' ? 'Intervall' : type === 'month' ? 'Monat' : 'Kategorie'}</TableHead>
                {years.map(year => (
                  <TableHead key={year} className="text-right font-bold">{year}</TableHead>
                ))}
                <TableHead className="text-right font-bold">Gesamt</TableHead>
                <TableHead className="text-right font-bold">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const rowTotal = years.reduce((sum, year) => sum + (parseInt(row[year]) || 0), 0);
                const rowPercentage = calculatePercentage(rowTotal, grandTotal);
                
                return (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    {years.map(year => (
                      <TableCell key={year} className="text-right">{row[year] || 0}</TableCell>
                    ))}
                    <TableCell className="text-right font-semibold">{rowTotal}</TableCell>
                    <TableCell className="text-right">{rowPercentage}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>Besuche gesamt</TableCell>
                {years.map(year => (
                  <TableCell key={year} className="text-right">{totals[year] || 0}</TableCell>
                ))}
                <TableCell className="text-right">{grandTotal}</TableCell>
                <TableCell className="text-right">100,00%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}