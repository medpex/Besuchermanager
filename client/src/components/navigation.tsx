import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user, logout } = useUser();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Stadtwerke Geesthacht</h1>
            <nav className="flex gap-4">
              <Link href="/">
                <span className="text-gray-600 hover:text-gray-900 cursor-pointer">
                  Besuchererfassung
                </span>
              </Link>
              {user?.isAdmin && (
                <Link href="/admin">
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">
                    Auswertungen
                  </span>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span>Angemeldet als {user?.username}</span>
            <Button variant="outline" onClick={() => logout()}>
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}