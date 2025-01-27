import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertVisit, SelectVisit } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useVisits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: visits } = useQuery<SelectVisit[]>({
    queryKey: ["/api/visits"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const createVisit = useMutation({
    mutationFn: async (visit: Omit<InsertVisit, "createdBy">) => {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visit),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Visit recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    visits,
    stats,
    createVisit: createVisit.mutateAsync,
  };
}
