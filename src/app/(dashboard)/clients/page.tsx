"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientCard } from "@/components/client/ClientCard";
import { ClientForm } from "@/components/client/ClientForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientItem {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  _count?: {
    invoices?: number;
  };
}

export default function ClientsPage(): JSX.Element {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients?search=${encodeURIComponent(search)}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as { success: boolean; data?: ClientItem[] };
      if (payload.success && payload.data) {
        setClients(payload.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">Clients</h1>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Close" : "New Client"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Add Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm
              onSuccess={() => {
                setShowForm(false);
                void load();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search clients by name, email, or company..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`client-skeleton-${index}`}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !clients.length ? (
        <div className="rounded-md border border-dashed border-surface-border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-ink">No clients yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Add your first client to start creating invoices.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              company={client.company}
              email={client.email}
              id={client.id}
              invoiceCount={client._count?.invoices ?? 0}
              name={client.name}
            />
          ))}
        </div>
      )}

      <div>
        <Link className="text-sm text-brand-600 hover:underline" href="/invoices/new">
          Create a new invoice
        </Link>
      </div>
    </div>
  );
}
