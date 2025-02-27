import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsDisplay from "@/components/stats-display";
import { useVisits } from "@/hooks/use-visits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { 
  AlertCircle, 
  ChevronsUpDown, 
  UserPlus, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  BarChart,
  PieChart,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import type { SelectUser } from "@db/schema";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type AdminUser = SelectUser & {
  visitCount?: number;
};

// Komponente für Top Kategorien mit prozentualer Verteilung
function TopCategoriesCard({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">Keine Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Farbcodes für die Kategorien
  const colors = {
    "Media": "#3b82f6", // blue
    "Energie": "#10b981", // green
    "Sonstiges": "#f59e0b", // amber
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Top Kategorien</p>
          <div className="p-2 bg-primary/10 rounded-full">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          {data.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.category}</span>
                <span className="text-sm font-medium">
                  {category.count} ({category.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${category.percentage}%`, 
                    backgroundColor: colors[category.category] || "#6366f1"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Komponente für Gesamtbesucher
function TotalVisitsCard({ value }) {
  if (!value) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">Keine Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxVisits = 1000; // Max für Progress-Bar
  const percentage = Math.min((value / maxVisits) * 100, 100);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Gesamtbesucher</p>
          <div className="p-2 bg-primary/10 rounded-full">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Gesamt</span>
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${percentage}%`, 
                  backgroundColor: "#3b82f6"
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Alle erfassten Besuche</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Komponente für Besuche heute
function TodayVisitsCard({ value, totalVisits, onReset }) {
  if (!value || !totalVisits) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">Keine Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = totalVisits ? (value / totalVisits) * 100 : 0;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Besuche heute</p>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={onReset}
              title="Zähler zurücksetzen"
            >
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Zähler zurücksetzen</span>
            </Button>
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Heute</span>
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${percentage}%`, 
                  backgroundColor: "#10b981"
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}% der Gesamtbesuche
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Komponente für Aktive Standorte
function LocationsCard({ locations, locationCounts, totalVisits }) {
  if (!locations || !locations.length || !locationCounts || !totalVisits) {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">Keine Daten verfügbar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const locationData = locations.map(location => ({
    name: location,
    count: locationCounts[location] || 0,
    percentage: ((locationCounts[location] || 0) / totalVisits * 100).toFixed(1)
  })).sort((a, b) => b.count - a.count);

  // Farbcodes für die Standorte
  const colors = {
    "Büchen": "#3b82f6", // blue
    "Schwarzenbek": "#f59e0b", // amber
    "Geesthacht": "#10b981", // green
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Aktive Standorte</p>
          <div className="p-2 bg-primary/10 rounded-full">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          {locationData.map((location, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{location.name}</span>
                <span className="text-sm font-medium">
                  {location.count} ({location.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${location.percentage}%`, 
                    backgroundColor: colors[location.name] || "#6366f1"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Typ für die persistierten Statistikdaten
type PersistedStats = {
  date: string;
  visitsByLocation: Record<string, number>;
  totalVisitsToday: number;
};

export default function AdminPage() {
  const { user } = useUser();
  const { visits } = useVisits();
  const { toast } = useToast();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isVisitsOpen, setIsVisitsOpen] = useState(true);

  // Eindeutigen Schlüssel für jeden Benutzer erstellen
  const statsStorageKey = `visitorStats_${user?.id || 'default'}`;

  // State für persistierte Statistiken
  const [persistedStats, setPersistedStats] = useState<PersistedStats | null>(null);

  // Fetch stats data
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch all users
  const { data: users, refetch } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.isAdmin,
  });

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      isAdmin: false,
    },
  });

  // Bei Seitenstart persitierte Daten laden
  useEffect(() => {
    if (!user) return; // Nur wenn ein Benutzer eingeloggt ist

    const loadPersistedStats = () => {
      const savedStats = localStorage.getItem(statsStorageKey);
      if (savedStats) {
        const parsed = JSON.parse(savedStats) as PersistedStats;

        // Überprüfen, ob die gespeicherten Daten vom aktuellen Tag sind
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today) {
          setPersistedStats(parsed);
        } else {
          // Wenn die Daten nicht vom aktuellen Tag sind, zurücksetzen
          resetStats();
        }
      } else {
        // Wenn keine Daten vorhanden sind, initialisieren
        resetStats();
      }
    };

    loadPersistedStats();
  }, [user, statsStorageKey]);

  // Zurücksetzen der Statistiken
  const resetStats = () => {
    if (!user) return; // Nur wenn ein Benutzer eingeloggt ist

    const today = new Date().toISOString().split('T')[0];
    const newStats: PersistedStats = {
      date: today,
      visitsByLocation: {},
      totalVisitsToday: 0
    };
    setPersistedStats(newStats);
    localStorage.setItem(statsStorageKey, JSON.stringify(newStats));

    toast({
      title: "Statistiken zurückgesetzt",
      description: "Die Tageszählung wurde zurückgesetzt."
    });
  };

  // Berechnung wichtiger Statistiken für die Übersicht
  const statistics = useMemo(() => {
    if (!visits || !stats) return null;

    // Eindeutige Standorte zählen
    const locations = [...new Set(visits.map(v => v.officeLocation))];

    // Heutiges Datum
    const today = new Date().toISOString().split('T')[0];

    // Falls persistierte Daten existieren und vom heutigen Tag sind, verwenden wir diese
    let visitsToday = 0;
    let locationCounts: Record<string, number> = {};

    if (persistedStats && persistedStats.date === today) {
      // Persistierte Daten verwenden
      visitsToday = persistedStats.totalVisitsToday;
      locationCounts = {...persistedStats.visitsByLocation};
    } else {
      // Neue Daten berechnen
      visitsToday = visits.filter(v => 
        new Date(v.timestamp).toISOString().split('T')[0] === today
      ).length;

      // Besuche nach Standort gruppieren
      locationCounts = locations.reduce((acc, loc) => {
        acc[loc] = visits.filter(v => 
          v.officeLocation === loc && 
          new Date(v.timestamp).toISOString().split('T')[0] === today
        ).length;
        return acc;
      }, {} as Record<string, number>);

      // Daten persistieren
      const newStats: PersistedStats = {
        date: today,
        visitsByLocation: locationCounts,
        totalVisitsToday: visitsToday
      };
      setPersistedStats(newStats);
      localStorage.setItem(statsStorageKey, JSON.stringify(newStats));
    }

    // Häufigste Kategorie ermitteln
    const categoryCount = visits.reduce((acc, visit) => {
      acc[visit.category] = (acc[visit.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalVisits: visits.length,
      visitsToday,
      locationCount: locations.length,
      locations,
      locationCounts,
      topCategory: topCategory ? topCategory[0] : 'Keine Daten',
      topCategoryCount: topCategory ? topCategory[1] : 0
    };
  }, [visits, stats, persistedStats, statsStorageKey, user]);

  // Wenn sich die Besuche ändern (ein neuer Besuch wurde hinzugefügt),
  // aktualisieren wir die persistierten Daten
  useEffect(() => {
    if (!visits || !statistics || !persistedStats || !user) return;

    const today = new Date().toISOString().split('T')[0];

    // Nur aktualisieren, wenn es sich um den aktuellen Tag handelt
    if (persistedStats.date !== today) return;

    // Neue Besuche für heute zählen
    const newVisitsToday = visits.filter(v => 
      new Date(v.timestamp).toISOString().split('T')[0] === today
    ).length;

    // Wenn keine Änderung vorliegt, nicht aktualisieren
    if (newVisitsToday === persistedStats.totalVisitsToday) return;

    // Besuche nach Standort gruppieren
    const newLocationCounts = statistics.locations.reduce((acc, loc) => {
      acc[loc] = visits.filter(v => 
        v.officeLocation === loc && 
        new Date(v.timestamp).toISOString().split('T')[0] === today
      ).length;
      return acc;
    }, {} as Record<string, number>);

    // Daten aktualisieren
    const updatedStats: PersistedStats = {
      date: today,
      visitsByLocation: newLocationCounts,
      totalVisitsToday: newVisitsToday
    };

    setPersistedStats(updatedStats);
    localStorage.setItem(statsStorageKey, JSON.stringify(updatedStats));
  }, [visits, statistics, persistedStats, user, statsStorageKey]);

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Erfolg",
        description: "Benutzer erfolgreich erstellt",
      });
      setIsAddUserOpen(false);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Erfolg",
        description: `Benutzer ${isActive ? "aktiviert" : "deaktiviert"}`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Sie haben keine Berechtigung, diese Seite aufzurufen.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="visits">
          <TabsList className="mb-6">
            <TabsTrigger value="visits" className="text-base">Besucherstatistiken</TabsTrigger>
            {user.isAdmin && (
              <TabsTrigger value="users" className="text-base">Benutzerverwaltung</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="visits">
            {statistics && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Übersicht</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TotalVisitsCard value={statistics.totalVisits} />
                  <TodayVisitsCard 
                    value={statistics.visitsToday} 
                    totalVisits={statistics.totalVisits} 
                    onReset={resetStats}
                  />
                  <LocationsCard 
                    locations={statistics.locations}
                    locationCounts={statistics.locationCounts}
                    totalVisits={statistics.totalVisits}
                  />
                  <TopCategoriesCard data={stats?.topCategories} />
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Detaillierte Statistiken</h2>
              <div className="grid gap-6">
                <StatsDisplay 
                  data={stats?.weekday || []} 
                  type="weekday" 
                />
                <StatsDisplay 
                  data={stats?.timeInterval || []} 
                  type="timeInterval" 
                />
                <StatsDisplay 
                  data={stats?.month || []} 
                  type="month" 
                />
                {/* Neue Unterkategorien-Statistik */}
                <StatsDisplay 
                  data={stats?.subcategory || []} 
                  type="subcategory"
                  className="mt-4" 
                />
              </div>
            </div>

            <Card className="mb-6 overflow-hidden">
              <Collapsible
                open={isVisitsOpen}
                onOpenChange={setIsVisitsOpen}
                className="w-full"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Aktuelle Besuche</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Besuche ein/ausklappen</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="p-6">
                    <div className="rounded-md border overflow-hidden">
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </TabsContent>

          {user.isAdmin && (
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Benutzerverwaltung</CardTitle>
                    <CardDescription>Verwalten Sie die Benutzerkonten im System</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddUserOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Neuer Benutzer
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Benutzername</TableHead>
                          <TableHead>Rolle</TableHead>
                          <TableHead>Besuche</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.isAdmin ? "Admin" : "Benutzer"}</TableCell>
                            <TableCell>{user.visitCount || 0}</TableCell>
                            <TableCell>
                              <Switch
                                checked={user.isAdmin}
                                onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Bearbeiten
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Benutzername</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Passwort</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="isAdmin"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel>Admin-Rechte</FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Benutzer erstellen
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}