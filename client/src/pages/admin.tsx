import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatsDisplay from "@/components/stats-display";
import { useVisits } from "@/hooks/use-visits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import type { SelectUser } from "@db/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type AdminUser = SelectUser & {
  visitCount?: number;
};

export default function AdminPage() {
  const { user } = useUser();
  const { visits } = useVisits();
  const { toast } = useToast();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

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
          <TabsList className="mb-4">
            <TabsTrigger value="visits">Besucherstatistiken</TabsTrigger>
            {user.isAdmin && (
              <TabsTrigger value="users">Benutzerverwaltung</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="visits">
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

              <Card>
                <CardHeader className="flex flex-row justify-between">
                  <CardTitle>Aktuelle Besuche</CardTitle>
                  <Button variant="outline" onClick={() => setIsAddUserOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Neuer Benutzer
                  </Button>
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
            </div>
          </TabsContent>

          {user.isAdmin && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Benutzerverwaltung</CardTitle>
                </CardHeader>
                <CardContent>
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
                          <TableCell>{user.username}</TableCell>
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