import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Check, User, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Schema für die Passwortänderung
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
  newPassword: z.string()
    .min(4, "Neues Passwort muss mindestens 4 Zeichen lang sein"),
  confirmPassword: z.string().min(1, "Passwortbestätigung ist erforderlich"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(data: PasswordFormValues) {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }),
        credentials: "include"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setSuccess(true);
      form.reset();

      toast({
        title: "Erfolg",
        description: "Ihr Passwort wurde erfolgreich geändert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Passwortänderung fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleClearDatabase = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Erfolg",
        description: "Datenbank wurde erfolgreich geleert",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Leeren der Datenbank",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-2xl font-semibold">Nicht angemeldet</h2>
          <p className="mt-2 text-gray-500">
            Sie müssen angemeldet sein, um diese Seite aufzurufen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profileinstellungen</h1>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Benutzerprofil
              </CardTitle>
              <CardDescription>
                Ihre Kontoinformationen und Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Benutzername:</div>
                  <div className="col-span-2">{user.username}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Rolle:</div>
                  <div className="col-span-2">{user.isAdmin ? "Administrator" : "Benutzer"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {user.isAdmin && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Datenbank-Verwaltung
                </CardTitle>
                <CardDescription>
                  Vorsicht: Diese Aktionen können nicht rückgängig gemacht werden
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={isClearing}
                    >
                      {isClearing ? "Wird geleert..." : "Datenbank leeren"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Datenbank leeren</AlertDialogTitle>
                      <AlertDialogDescription>
                        Diese Aktion wird alle Besuche aus der Datenbank löschen. Diese Aktion kann nicht rückgängig gemacht werden.
                        Sind Sie sicher, dass Sie fortfahren möchten?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearDatabase}>
                        Datenbank leeren
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Passwort ändern</CardTitle>
            <CardDescription>
              Aktualisieren Sie Ihr Passwort, um die Sicherheit Ihres Kontos zu gewährleisten
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Passwort aktualisiert</AlertTitle>
                <AlertDescription className="text-green-700">
                  Ihr Passwort wurde erfolgreich geändert
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktuelles Passwort</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neues Passwort</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mindestens 4 Zeichen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passwort bestätigen</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Wird gespeichert..." : "Passwort ändern"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 