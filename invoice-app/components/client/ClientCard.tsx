import Link from "next/link";

export function ClientCard({
  id,
  name,
  email,
  company,
  invoiceCount,
}: {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  invoiceCount: number;
}): JSX.Element {
  return (
    <Link
      href={`/clients/${id}`}
      className="block rounded-md border border-surface-border bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
    >
      <p className="font-semibold text-ink">{name}</p>
      <p className="text-sm text-ink-muted">{email}</p>
      {company ? <p className="text-sm text-ink-subtle">{company}</p> : null}
      <p className="mt-2 text-xs text-ink-muted">{invoiceCount} invoices</p>
    </Link>
  );
}
