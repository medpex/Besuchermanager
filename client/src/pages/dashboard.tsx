import { useUser } from "@/hooks/use-user";
import { useVisits } from "@/hooks/use-visits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VisitorForm from "@/components/visitor-form";
import StatsDisplay from "@/components/stats-display";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const { user, logout } = useUser();
  const { visits, stats } = useVisits();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Besuchererfassungssystem</h1>
          <div className="flex items-center gap-4">
            <span>Willkommen, {user?.username}</span>
            <Button variant="outline" onClick={() => logout()}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>

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