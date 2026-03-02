import Link from "next/link";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceCardProps {
  id: string;
  invoiceNumber: string;
  billToName: string;
  projectName?: string | null;
  total: number;
  currency: string;
  status: string;
  dueDate: Date | string;
}

export function InvoiceCard({
  id,
  invoiceNumber,
  billToName,
  projectName,
  total,
  currency,
  status,
  dueDate,
}: InvoiceCardProps): JSX.Element {
  return (
    <Link
      href={`/invoices/${id}`}
      className="block rounded-lg border border-surface-border bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{invoiceNumber}</p>
          <p className="text-sm text-ink-muted">{billToName}</p>
          {projectName ? <p className="text-xs text-ink-subtle">{projectName}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-ink">{formatCurrency(total, currency)}</p>
          <p className="text-xs text-ink-muted">Due {formatDate(dueDate)}</p>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </Link>
  );
}
