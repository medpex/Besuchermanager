import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsDisplay from "@/components/stats-display";
import StatsTable from "@/components/stats-table";
import CategoryMonthlyStats from "@/components/category-monthly-stats";
import SubcategoryMonthlyStats from "@/components/subcategory-monthly-stats";
import LineChart from "@/components/charts/line-chart";
import HeatmapChart from "@/components/charts/heatmap-chart";
import BarChart from "@/components/charts/bar-chart";
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
  BarChart as BarChartIcon,
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
    "Allgemeines": "#f59e0b", // amber
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

  // Dynamischer maximaler Wert basierend auf dem tatsächlichen Wert
  const percentage = 100; // Immer volle Anzeige, da es ein Gesamt-Indikator ist

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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-2xl font-semibold">Zugriff verweigert</h2>
          <p className="mt-2 text-gray-500">
            Sie haben keine Berechtigung, auf diese Seite zuzugreifen. Bitte wenden Sie sich an einen Administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Administrator-Dashboard</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Benutzer hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
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
                        <Input placeholder="Benutzername" {...field} />
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
                        <Input type="password" placeholder="Passwort" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Administrator-Rechte</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Benutzer erstellen</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="w-full md:w-auto mb-4">
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
          <TabsTrigger value="tables">Tabellarische Auswertung</TabsTrigger>
          <TabsTrigger value="charts">Grafische Auswertung</TabsTrigger>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TotalVisitsCard value={statistics?.totalVisits} />
            <TodayVisitsCard 
              value={statistics?.visitsToday} 
              totalVisits={statistics?.totalVisits} 
              onReset={resetStats}
            />
          </div>

          <Collapsible
            open={isVisitsOpen}
            onOpenChange={setIsVisitsOpen}
            className="mb-6 border rounded-lg"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5" /> 
                <span>Besucherstatistiken</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 transition-transform duration-200 ease-in-out" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TopCategoriesCard data={stats?.topCategories} />
                <LocationsCard 
                  locations={statistics?.locations} 
                  locationCounts={statistics?.locationCounts}
                  totalVisits={statistics?.totalVisits}
                />
              </div>

              {/* Diagramme */}
              <div className="mt-6 grid grid-cols-1 gap-6">
                <StatsDisplay 
                  data={stats?.weekday} 
                  type="weekday" 
                />
                <StatsDisplay 
                  data={stats?.timeInterval} 
                  type="timeInterval" 
                />
                <StatsDisplay 
                  data={stats?.month} 
                  type="month" 
                />
                <StatsDisplay 
                  data={stats?.subcategory} 
                  type="subcategory" 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
        
        <TabsContent value="charts">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full md:w-auto mb-4">
              <TabsTrigger value="all">Alle Standorte</TabsTrigger>
              <TabsTrigger value="geesthacht">Geesthacht</TabsTrigger>
              <TabsTrigger value="buchen">Büchen</TabsTrigger>
              <TabsTrigger value="schwarzenbek">Schwarzenbek</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Grafische Auswertung für alle Standorte</h2>
                
                {stats && (
                  <>
                    <div className="mb-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Wochentag und Jahr (Heatmap)"
                        data={stats.weekday}
                        xAxisType="weekday"
                        height={300}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <LineChart
                        title="Besuchertrend nach Wochentag"
                        data={stats.weekday}
                        xAxisType="weekday"
                        height={350}
                      />
                      
                      <LineChart
                        title="Besuchertrend nach Tageszeit"
                        data={stats.timeInterval}
                        xAxisType="timeInterval"
                        height={350}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Monat und Jahr (Heatmap)"
                        data={stats.month}
                        xAxisType="month"
                        height={300}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                      <LineChart
                        title="Besuchertrend nach Monat"
                        data={stats.month}
                        xAxisType="month"
                        height={350}
                      />
                      
                      <LineChart
                        title="Besuchertrend nach Unterkategorie"
                        data={stats.subcategory}
                        xAxisType="category"
                        height={350}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="geesthacht">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Grafische Auswertung für Geesthacht</h2>
                
                {stats?.byLocation?.Geesthacht && (
                  <>
                    <div className="mb-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Wochentag und Jahr (Heatmap)"
                        data={stats.byLocation.Geesthacht.weekday}
                        xAxisType="weekday"
                        height={300}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <LineChart
                        title="Besuchertrend nach Wochentag"
                        data={stats.byLocation.Geesthacht.weekday}
                        xAxisType="weekday"
                        height={350}
                      />
                      
                      <LineChart
                        title="Besuchertrend nach Tageszeit"
                        data={stats.byLocation.Geesthacht.timeInterval}
                        xAxisType="timeInterval"
                        height={350}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Monat und Jahr (Heatmap)"
                        data={stats.byLocation.Geesthacht.month}
                        xAxisType="month"
                        height={300}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <LineChart
                        title="Besuchertrend nach Monat"
                        data={stats.byLocation.Geesthacht.month}
                        xAxisType="month"
                        height={350}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="buchen">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Grafische Auswertung für Büchen</h2>
                
                {stats?.byLocation?.Büchen && (
                  <>
                    <div className="mb-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Wochentag und Jahr (Heatmap)"
                        data={stats.byLocation.Büchen.weekday}
                        xAxisType="weekday"
                        height={300}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <LineChart
                        title="Besuchertrend nach Wochentag"
                        data={stats.byLocation.Büchen.weekday}
                        xAxisType="weekday"
                        height={350}
                      />
                      
                      <LineChart
                        title="Besuchertrend nach Tageszeit"
                        data={stats.byLocation.Büchen.timeInterval}
                        xAxisType="timeInterval"
                        height={350}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Monat und Jahr (Heatmap)"
                        data={stats.byLocation.Büchen.month}
                        xAxisType="month"
                        height={300}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <LineChart
                        title="Besuchertrend nach Monat"
                        data={stats.byLocation.Büchen.month}
                        xAxisType="month"
                        height={350}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="schwarzenbek">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Grafische Auswertung für Schwarzenbek</h2>
                
                {stats?.byLocation?.Schwarzenbek && (
                  <>
                    <div className="mb-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Wochentag und Jahr (Heatmap)"
                        data={stats.byLocation.Schwarzenbek.weekday}
                        xAxisType="weekday"
                        height={300}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <LineChart
                        title="Besuchertrend nach Wochentag"
                        data={stats.byLocation.Schwarzenbek.weekday}
                        xAxisType="weekday"
                        height={350}
                      />
                      
                      <LineChart
                        title="Besuchertrend nach Tageszeit"
                        data={stats.byLocation.Schwarzenbek.timeInterval}
                        xAxisType="timeInterval"
                        height={350}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <HeatmapChart
                        title="Besucherzahlen nach Monat und Jahr (Heatmap)"
                        data={stats.byLocation.Schwarzenbek.month}
                        xAxisType="month"
                        height={300}
                      />
                    </div>
                    
                    <div className="mt-8">
                      <LineChart
                        title="Besuchertrend nach Monat"
                        data={stats.byLocation.Schwarzenbek.month}
                        xAxisType="month"
                        height={350}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="tables">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full md:w-auto mb-4">
              <TabsTrigger value="all">Alle Standorte</TabsTrigger>
              <TabsTrigger value="geesthacht">Geesthacht</TabsTrigger>
              <TabsTrigger value="buchen">Büchen</TabsTrigger>
              <TabsTrigger value="schwarzenbek">Schwarzenbek</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Auswertung für alle Standorte</h2>
                
                {/* Importieren Sie die neue StatsTable Komponente */}
                {stats && (
                  <>
                    <StatsTable 
                      data={stats.weekday} 
                      type="weekday" 
                      title="Besuche - häufigster Wochentag"
                    />
                    
                    <StatsTable 
                      data={stats.timeInterval} 
                      type="timeInterval" 
                      title="Besuche - Uhrzeit Intervall"
                    />
                    
                    <StatsTable 
                      data={stats.month} 
                      type="month" 
                      title="Besuche - häufigster Monat"
                    />
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="geesthacht">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Auswertung für Geesthacht</h2>
                
                {stats?.byLocation?.Geesthacht && (
                  <>
                    <StatsTable 
                      data={stats.byLocation.Geesthacht.weekday} 
                      type="weekday" 
                      title="Besuche - häufigster Wochentag"
                      location="Geesthacht"
                    />
                    
                    <StatsTable 
                      data={stats.byLocation.Geesthacht.timeInterval} 
                      type="timeInterval" 
                      title="Besuche - Uhrzeit Intervall"
                      location="Geesthacht"
                    />
                    
                    <StatsTable 
                      data={stats.byLocation.Geesthacht.month} 
                      type="month" 
                      title="Besuche - häufigster Monat"
                      location="Geesthacht"
                    />
                    
                    {/* Tabs für die verschiedenen Jahre */}
                    <Tabs defaultValue="2025" className="w-full mt-8">
                      <TabsList className="w-full md:w-auto mb-4">
                        <TabsTrigger value="2025">2025</TabsTrigger>
                        <TabsTrigger value="2024">2024</TabsTrigger>
                        <TabsTrigger value="2023">2023</TabsTrigger>
                        <TabsTrigger value="2022">2022</TabsTrigger>
                        <TabsTrigger value="2021">2021</TabsTrigger>
                      </TabsList>
                      
                      {["2025", "2024", "2023", "2022", "2021"].map(year => (
                        <TabsContent key={year} value={year}>
                          <CategoryMonthlyStats 
                            data={stats.byLocation.Geesthacht.categoryData.filter((d: any) => d.year === year)} 
                            year={year}
                            location="Geesthacht"
                          />
                          
                          {/* Tabs für die verschiedenen Kategorien */}
                          <Tabs defaultValue="Media" className="w-full mt-8">
                            <TabsList className="w-full md:w-auto mb-4">
                              <TabsTrigger value="Media">Media</TabsTrigger>
                              <TabsTrigger value="Energie">Energie</TabsTrigger>
                              <TabsTrigger value="Allgemeines">Allgemeines</TabsTrigger>
                            </TabsList>
                            
                            {["Media", "Energie", "Allgemeines"].map(cat => (
                              <TabsContent key={cat} value={cat}>
                                <SubcategoryMonthlyStats 
                                  data={stats.byLocation.Geesthacht.categoryData.filter((d: any) => d.year === year)} 
                                  year={year}
                                  category={cat}
                                  location="Geesthacht"
                                />
                              </TabsContent>
                            ))}
                          </Tabs>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="buchen">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Auswertung für Büchen</h2>
                
                {stats?.byLocation?.Büchen && (
                  <>
                    <StatsTable 
                      data={stats.byLocation.Büchen.weekday} 
                      type="weekday" 
                      title="Besuche - häufigster Wochentag"
                      location="Büchen"
                    />
                    
                    <StatsTable 
                      data={stats.byLocation.Büchen.timeInterval} 
                      type="timeInterval" 
                      title="Besuche - Uhrzeit Intervall"
                      location="Büchen"
                    />
                    
                    <StatsTable 
                      data={stats.byLocation.Büchen.month} 
                      type="month" 
                      title="Besuche - häufigster Monat"
                      location="Büchen"
                    />
                    
                    {/* Tabs für die verschiedenen Jahre */}
                    <Tabs defaultValue="2025" className="w-full mt-8">
                      <TabsList className="w-full md:w-auto mb-4">
                        <TabsTrigger value="2025">2025</TabsTrigger>
                        <TabsTrigger value="2024">2024</TabsTrigger>
                        <TabsTrigger value="2023">2023</TabsTrigger>
                        <TabsTrigger value="2022">2022</TabsTrigger>
                        <TabsTrigger value="2021">2021</TabsTrigger>
                      </TabsList>
                      
                      {["2025", "2024", "2023", "2022", "2021"].map(year => (
                        <TabsContent key={year} value={year}>
                          <CategoryMonthlyStats 
                            data={stats.byLocation.Büchen.categoryData.filter((d: any) => d.year === year)} 
                            year={year}
                            location="Büchen"
                          />
                          
                          {/* Tabs für die verschiedenen Kategorien */}
                          <Tabs defaultValue="Media" className="w-full mt-8">
                            <TabsList className="w-full md:w-auto mb-4">
                              <TabsTrigger value="Media">Media</TabsTrigger>
                              <TabsTrigger value="Energie">Energie</TabsTrigger>
                              <TabsTrigger value="Allgemeines">Allgemeines</TabsTrigger>
                            </TabsList>
                            
                            {["Media", "Energie", "Allgemeines"].map(cat => (
                              <TabsContent key={cat} value={cat}>
                                <SubcategoryMonthlyStats 
                                  data={stats.byLocation.Büchen.categoryData.filter((d: any) => d.year === year)} 
                                  year={year}
                                  category={cat}
                                  location="Büchen"
                                />
                              </TabsContent>
                            ))}
                          </Tabs>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="schwarzenbek">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Auswertung für Schwarzenbek</h2>
                
                {stats?.byLocation?.Schwarzenbek && (
                  <>
                    <StatsTable 
                      data={stats.byLocation.Schwarzenbek.weekday} 
                      type="weekday" 
                      title="Besuche - häufigster Wochentag"
                      location="Schwarzenbek"
                    />
                    
                    <StatsTable 
                      data={stats.byLocation.Schwarzenbek.timeInterval} 
                      type="timeInterval" 
                      title="Besuche - Uhrzeit Intervall"
                      location="Schwarzenbek"
                    />
                    
                    <StatsTable 
                      data={stats.byLocation.Schwarzenbek.month} 
                      type="month" 
                      title="Besuche - häufigster Monat"
                      location="Schwarzenbek"
                    />
                    
                    {/* Tabs für die verschiedenen Jahre */}
                    <Tabs defaultValue="2025" className="w-full mt-8">
                      <TabsList className="w-full md:w-auto mb-4">
                        <TabsTrigger value="2025">2025</TabsTrigger>
                        <TabsTrigger value="2024">2024</TabsTrigger>
                        <TabsTrigger value="2023">2023</TabsTrigger>
                        <TabsTrigger value="2022">2022</TabsTrigger>
                        <TabsTrigger value="2021">2021</TabsTrigger>
                      </TabsList>
                      
                      {["2025", "2024", "2023", "2022", "2021"].map(year => (
                        <TabsContent key={year} value={year}>
                          <CategoryMonthlyStats 
                            data={stats.byLocation.Schwarzenbek.categoryData.filter((d: any) => d.year === year)} 
                            year={year}
                            location="Schwarzenbek"
                          />
                          
                          {/* Tabs für die verschiedenen Kategorien */}
                          <Tabs defaultValue="Media" className="w-full mt-8">
                            <TabsList className="w-full md:w-auto mb-4">
                              <TabsTrigger value="Media">Media</TabsTrigger>
                              <TabsTrigger value="Energie">Energie</TabsTrigger>
                              <TabsTrigger value="Allgemeines">Allgemeines</TabsTrigger>
                            </TabsList>
                            
                            {["Media", "Energie", "Allgemeines"].map(cat => (
                              <TabsContent key={cat} value={cat}>
                                <SubcategoryMonthlyStats 
                                  data={stats.byLocation.Schwarzenbek.categoryData.filter((d: any) => d.year === year)} 
                                  year={year}
                                  category={cat}
                                  location="Schwarzenbek"
                                />
                              </TabsContent>
                            ))}
                          </Tabs>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Benutzername</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Besuche</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Benutzer
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{user.visitCount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, !user.isActive)}
                      >
                        {user.isActive ? "Deaktivieren" : "Aktivieren"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}