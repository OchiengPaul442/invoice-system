"use client";

import useSWR from "swr";
import { jsonFetcher } from "@/lib/fetcher";

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
  const key = `/api/clients${query ? `?${query}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<ClientsResponse<T>>(key, jsonFetcher, {
    revalidateOnFocus: true,
  });

  return {
    clients: data?.data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: async () => {
      await mutate();
    },
  };
}
