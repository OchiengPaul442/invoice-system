"use client";

import Link from "next/link";
import { FileText, UserPlus } from "lucide-react";
import useSWR from "swr";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { jsonFetcher } from "@/lib/fetcher";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  dueDate: string;
  billToName: string;
  total: number;
  currency: string;
}

interface DashboardResponse {
  success: boolean;
  data?: {
    totalInvoices: number;
    totalRevenue: number;
    outstanding: number;
    overdueCount: number;
    draftCount: number;
    preferredCurrency: string;
    recentInvoices: DashboardInvoice[];
  };
}

export function DashboardClient(): JSX.Element {
  const { data, isLoading } = useSWR<DashboardResponse>("/api/dashboard/stats", jsonFetcher, {
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`stat-skeleton-${index}`}>
              <CardContent className="space-y-2 pt-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = data?.data;
  const preferredCurrency = stats?.preferredCurrency || "UGX";
  const recentInvoices = stats?.recentInvoices || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">
              {formatCurrency(stats?.totalRevenue || 0, preferredCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">
              {formatCurrency(stats?.outstanding || 0, preferredCurrency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">{stats?.overdueCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Draft Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">{stats?.draftCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices ({stats?.totalInvoices || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentInvoices.length ? (
            <div className="rounded-md border border-dashed border-surface-border p-8 text-center">
              <p className="text-sm text-ink-muted">No invoices yet.</p>
              <div className="mt-4 flex justify-center">
                <Button asChild size="sm">
                  <Link href="/invoices/new">Create your first invoice</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-ink-muted">
                    <th className="py-2">Invoice</th>
                    <th className="py-2">Client</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-surface-border/60">
                      <td className="py-2 font-medium text-ink">{invoice.invoiceNumber}</td>
                      <td className="py-2 text-ink-muted">{invoice.billToName}</td>
                      <td className="py-2 text-ink">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="py-2 text-ink-muted">{formatDate(invoice.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Button asChild variant="outline">
          <Link href="/invoices/new" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/clients" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>
    </div>
  );
}

