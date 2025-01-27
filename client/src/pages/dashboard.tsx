import { useVisits } from "@/hooks/use-visits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VisitorForm from "@/components/visitor-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const { visits } = useVisits();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <VisitorForm />
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aktuelle Besuche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeit</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Unterkategorie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits?.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        {new Date(visit.timestamp).toLocaleTimeString('de-DE')}
                      </TableCell>
                      <TableCell>{visit.officeLocation}</TableCell>
                      <TableCell>{visit.category}</TableCell>
                      <TableCell>{visit.subcategory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}