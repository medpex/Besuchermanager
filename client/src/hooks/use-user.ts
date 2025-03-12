import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InsertUser, SelectUser } from "@db/schema";
import { api, ApiResponse } from "@/lib/api";

type RequestResult = {
  ok: true;
} | {
  ok: false;
  message: string;
};

async function handleRequest(
  url: string,
  method: string,
  body?: InsertUser
): Promise<RequestResult> {
  console.log(`Handling ${method} request to ${url}`, body);
  
  try {
    const result = method === 'POST' 
      ? await api.post(url, body)
      : await api.get(url);
    
    if (!result.ok) {
      return { ok: false, message: result.message || 'Unbekannter Fehler' };
    }
    
    return { ok: true };
  } catch (e: any) {
    console.error("Request error:", e);
    return { ok: false, message: e.toString() };
  }
}

async function fetchUser(): Promise<SelectUser | null> {
  console.log("Fetching user...");
  const result = await api.get('/api/user');
  
  if (!result.ok) {
    if (result.status === 401) {
      console.log("User not authenticated");
      return null;
    }
    
    console.error("User fetch error:", result.message);
    throw new Error(result.message);
  }
  
  console.log("User fetched successfully:", result.data);
  return result.data;
}

export function useUser() {
  const queryClient = useQueryClient();

  const { data: user, error, isLoading } = useQuery<SelectUser | null, Error>({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: Infinity,
    retry: false
  });

  const loginMutation = useMutation<RequestResult, Error, InsertUser>({
    mutationFn: (userData) => handleRequest('/api/login', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logoutMutation = useMutation<RequestResult, Error>({
    mutationFn: () => handleRequest('/api/logout', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const registerMutation = useMutation<RequestResult, Error, InsertUser>({
    mutationFn: (userData) => handleRequest('/api/register', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
  };
}
