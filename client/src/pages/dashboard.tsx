import { useUser } from "@/hooks/use-user";
import { useVisits } from "@/hooks/use-visits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VisitorForm from "@/components/visitor-form";
import StatsDisplay from "@/components/stats-display";

export default function Dashboard() {
  const { user, logout } = useUser();
  const { visits, stats } = useVisits();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Visitor Tracking System</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Record New Visit</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsDisplay stats={stats} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Subcategory</th>
                    <th className="p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {visits?.map((visit) => (
                    <tr key={visit.id} className="border-b">
                      <td className="p-2">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2">{visit.category}</td>
                      <td className="p-2">{visit.subcategory}</td>
                      <td className="p-2">{visit.officeLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
