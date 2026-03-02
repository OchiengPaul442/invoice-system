import Link from "next/link";
import { InvoiceStatus } from "@prisma/client";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markOverdueInvoices } from "@/lib/overdue-checker";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; clientId?: string };
}): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await markOverdueInvoices(session.user.id);

  const status = searchParams.status || "";
  const search = searchParams.search || "";
  const clientId = searchParams.clientId || "";
  const allowedStatuses: InvoiceStatus[] = [
    "DRAFT",
    "SENT",
    "VIEWED",
    "PARTIAL",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ];
  const normalizedStatus = allowedStatuses.includes(status as InvoiceStatus)
    ? (status as InvoiceStatus)
    : null;

  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
        ...(clientId ? { clientId } : {}),
        ...(search
          ? {
              OR: [
                { invoiceNumber: { contains: search, mode: "insensitive" } },
                { billToName: { contains: search, mode: "insensitive" } },
                { projectName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.client.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">New Invoice</Link>
        </Button>
      </div>

      <form className="grid gap-3 rounded-md border border-surface-border bg-white p-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <Input
            className="pl-9"
            defaultValue={search}
            name="search"
            placeholder="Search invoice #, client, project..."
          />
        </div>
        <select
          className="h-10 rounded-md border border-surface-border bg-white px-3 text-sm"
          defaultValue={status}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          className="h-10 rounded-md border border-surface-border bg-white px-3 text-sm"
          defaultValue={clientId}
          name="clientId"
        >
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      {!invoices.length ? (
        <div className="rounded-md border border-dashed border-surface-border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-ink">No invoices yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Create your first invoice to get started.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/invoices/new">Create Invoice</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              billToName={invoice.billToName}
              currency={invoice.currency}
              dueDate={invoice.dueDate}
              id={invoice.id}
              invoiceNumber={invoice.invoiceNumber}
              projectName={invoice.projectName}
              status={invoice.status}
              total={Number(invoice.total)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
