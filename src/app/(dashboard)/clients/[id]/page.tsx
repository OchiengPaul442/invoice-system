"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClientForm } from "@/components/client/ClientForm";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  dueDate: string;
}

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  defaultCurrency?: string | null;
  taxId?: string | null;
  notes?: string | null;
  invoices: ClientInvoice[];
}

export default function ClientDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients/${params.id}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        success: boolean;
        data?: ClientDetail;
      };
      if (payload.success && payload.data) {
        setClient(payload.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-52 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!client) {
    return <div className="text-sm text-red-600">Client not found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{client.name}</h1>
          <p className="text-sm text-ink-muted">{client.email}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEdit((value) => !value)} variant="outline">
            {showEdit ? "Close Edit" : "Edit Client"}
          </Button>
          <Button asChild>
            <Link href={`/invoices/new?clientId=${client.id}`}>New Invoice for Client</Link>
          </Button>
        </div>
      </div>

      {showEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm
              clientId={client.id}
              initialValues={{
                name: client.name,
                email: client.email,
                company: client.company || "",
                phone: client.phone || "",
                website: client.website || "",
                address: client.address || "",
                city: client.city || "",
                state: client.state || "",
                country: client.country || "",
                zipCode: client.zipCode || "",
                defaultCurrency: client.defaultCurrency || "UGX",
                taxId: client.taxId || "",
                notes: client.notes || "",
              }}
              onSuccess={() => {
                setShowEdit(false);
                void load();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {!client.invoices.length ? (
            <p className="text-sm text-ink-muted">No invoices for this client yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-ink-muted">
                    <th className="py-2">Invoice</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {client.invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-surface-border/70">
                      <td className="py-2 font-medium text-ink">{invoice.invoiceNumber}</td>
                      <td className="py-2 text-ink">
                        {formatCurrency(Number(invoice.total), invoice.currency)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="py-2 text-ink-muted">{formatDate(invoice.dueDate)}</td>
                      <td className="py-2">
                        <Link className="text-brand-600 hover:underline" href={`/invoices/${invoice.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
