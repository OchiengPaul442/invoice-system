import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, UserPlus } from "lucide-react";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [totalInvoices, paidAgg, outstandingAgg, overdueCount, draftCount, recentInvoices] =
    await Promise.all([
      prisma.invoice.count({ where: { userId } }),
      prisma.invoice.aggregate({
        where: { userId, status: "PAID" },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { userId, status: { in: ["SENT", "OVERDUE", "PARTIAL"] } },
        _sum: { balanceDue: true },
      }),
      prisma.invoice.count({ where: { userId, status: "OVERDUE" } }),
      prisma.invoice.count({ where: { userId, status: "DRAFT" } }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">
              {formatCurrency(Number(paidAgg._sum.total || 0), "UGX")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">
              {formatCurrency(Number(outstandingAgg._sum.balanceDue || 0), "UGX")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-ink-muted">Draft Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">{draftCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices ({totalInvoices})</CardTitle>
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
                        {formatCurrency(Number(invoice.total), "UGX")}
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
