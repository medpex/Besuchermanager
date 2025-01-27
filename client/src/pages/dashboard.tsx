import { useVisits } from "@/hooks/use-visits";
import { Card, CardContent } from "@/components/ui/card";
import VisitorForm from "@/components/visitor-form";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <VisitorForm />
        </div>
      </main>
    </div>
  );
}