import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser } from "@db/schema";

export default function AuthPage() {
  const { login } = useUser();
  const { toast } = useToast();

  const loginForm = useForm<InsertUser>({
    defaultValues: { username: "", password: "" }
  });

  const onLogin = async (data: InsertUser) => {
    console.log("Login attempt with data:", data);
    try {
      toast({ title: "Info", description: "Login wird verarbeitet..." });
      const result = await login(data);
      console.log("Login result:", result);
      
      if (!result.ok) {
        toast({ title: "Fehler", description: result.message, variant: "destructive" });
      } else {
        toast({ title: "Erfolg", description: "Login erfolgreich!" });
        
        // Sofortige Weiterleitung mit hardRefresh
        const hardRefresh = () => {
          console.log("Performing hard refresh and redirect");
          window.sessionStorage.setItem('auth_redirect', 'true');
          window.location.href = '/'; 
          setTimeout(() => {
            window.location.reload(); // Erzwingt Reload vom Server statt Cache
          }, 100);
        };
        // Sofort ausführen
        hardRefresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        title: "Fehler", 
        description: error instanceof Error ? error.message : "Login fehlgeschlagen", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Besuchererfassungssystem</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
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
                control={loginForm.control}
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
              <Button type="submit" className="w-full">
                Anmelden
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}