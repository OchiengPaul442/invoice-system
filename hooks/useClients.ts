"use client";

import { useCallback, useEffect, useState } from "react";

interface ClientsResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

export function useClients<T>(query = ""): {
  clients: T[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [clients, setClients] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ClientsResponse<T>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load clients");
      }
      setClients(payload.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load clients";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  return { clients, isLoading, error, refetch: fetchClients };
}
