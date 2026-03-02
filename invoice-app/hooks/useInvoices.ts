"use client";

import { useCallback, useEffect, useState } from "react";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface InvoiceListResponse<T> {
  success: boolean;
  data?: {
    invoices: T[];
    pagination: Pagination;
  };
  error?: string;
}

export function useInvoices<T>(query = ""): {
  invoices: T[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [invoices, setInvoices] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as InvoiceListResponse<T>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load invoices");
      }
      setInvoices(payload.data.invoices);
      setPagination(payload.data.pagination);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load invoices";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, pagination, isLoading, error, refetch: fetchInvoices };
}
