"use client";

import { useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useInvoiceBuilderStore } from "@/store/invoice-builder.store";

function TotalsSummary({
  subtotal,
  discountAmount,
  taxAmount,
  taxRate,
  taxLabel,
  total,
  currency,
  color,
}: {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  total: number;
  currency: string;
  color: string;
}): JSX.Element {
  return (
    <div className="w-full max-w-xs space-y-1 text-xs">
      <div className="flex justify-between">
        <span className="text-ink-muted">Subtotal</span>
        <span>{formatCurrency(subtotal, currency)}</span>
      </div>
      {discountAmount > 0 ? (
        <div className="flex justify-between">
          <span className="text-ink-muted">Discount</span>
          <span>-{formatCurrency(discountAmount, currency)}</span>
        </div>
      ) : null}
      {taxRate > 0 ? (
        <div className="flex justify-between">
          <span className="text-ink-muted">
            {taxLabel} ({taxRate}%)
          </span>
          <span>{formatCurrency(taxAmount, currency)}</span>
        </div>
      ) : null}
      <div className="mt-2 flex justify-between rounded-md px-3 py-2 text-white" style={{ backgroundColor: color }}>
        <span className="font-semibold">Total</span>
        <span className="font-semibold">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
}

function SharedLineItems(): JSX.Element {
  const lineItems = useInvoiceBuilderStore((state) => state.lineItems);
  const currency = useInvoiceBuilderStore((state) => state.currency);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-12 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <p className="col-span-5">Description</p>
        <p className="col-span-2 text-center">Qty</p>
        <p className="col-span-2 text-center">Unit</p>
        <p className="col-span-3 text-right">Amount</p>
      </div>
      <div className="divide-y">
        {lineItems.map((item) => (
          <div key={item.id} className="grid grid-cols-12 px-3 py-2 text-xs">
            <p className="col-span-5 text-ink">{item.description || "-"}</p>
            <p className="col-span-2 text-center text-ink-muted">{item.quantity}</p>
            <p className="col-span-2 text-center text-ink-muted">{item.unit}</p>
            <p className="col-span-3 text-right font-medium text-ink">
              {formatCurrency(item.amount, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InvoicePreview(): JSX.Element {
  const store = useInvoiceBuilderStore();

  const totals = useMemo(
    () => ({
      subtotal: store.subtotal,
      discountAmount: store.discountAmount,
      taxAmount: store.taxAmount,
      total: store.total,
    }),
    [store.subtotal, store.discountAmount, store.taxAmount, store.total],
  );

  const color = store.primaryColor || "#0F766E";
  const accent = store.accentColor || "#1F2937";

  return (
    <div className="h-full w-full overflow-auto rounded-xl border border-surface-border bg-gradient-to-br from-[#f4fbf8] via-white to-[#fff6ea] p-3 sm:p-4">
      <div className="mx-auto min-h-[842px] w-full max-w-[595px] rounded-xl bg-white p-5 text-sm shadow-lg sm:p-8">
        {store.templateType === "MODERN" ? (
          <div>
            <header className="grid gap-4 rounded-xl p-4 text-white sm:grid-cols-[1fr_auto]" style={{ backgroundColor: accent }}>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/80">Invoice</p>
                <h2 className="mt-2 text-2xl font-bold">{store.invoiceNumber || "Pending Number"}</h2>
              </div>
              <div className="space-y-1 text-left text-xs sm:text-right">
                <p>Issued: {store.issueDate ? formatDate(store.issueDate) : "-"}</p>
                <p>Due: {store.dueDate ? formatDate(store.dueDate) : "-"}</p>
              </div>
            </header>

            <section className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Bill To</p>
                <p className="mt-2 font-semibold text-ink">{store.billTo.name || "Client Name"}</p>
                <p className="text-xs text-ink-muted">{store.billTo.email || "client@email.com"}</p>
                {store.billTo.company ? <p className="text-xs text-ink-muted">{store.billTo.company}</p> : null}
              </div>
              <div className="rounded-lg border border-surface-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Project</p>
                <p className="mt-2 font-semibold text-ink">{store.projectName || "Project Name"}</p>
                <p className="text-xs text-ink-muted">
                  {store.projectDescription || "Project description will appear here."}
                </p>
              </div>
            </section>

            <SharedLineItems />

            <section className="mt-6 flex justify-end">
              <TotalsSummary
                color={color}
                currency={store.currency}
                discountAmount={totals.discountAmount}
                subtotal={totals.subtotal}
                taxAmount={totals.taxAmount}
                taxLabel={store.taxLabel}
                taxRate={store.taxRate}
                total={totals.total}
              />
            </section>
          </div>
        ) : null}

        {store.templateType === "MINIMAL" ? (
          <div>
            <header className="border-b pb-4">
              <h2 className="text-3xl font-semibold text-ink">Invoice</h2>
              <p className="mt-2 text-xs text-ink-muted">{store.invoiceNumber || "Pending Number"}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {store.issueDate ? formatDate(store.issueDate) : "-"} - {store.dueDate ? formatDate(store.dueDate) : "-"}
              </p>
            </header>

            <section className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Bill To</p>
                <p className="mt-2 font-semibold text-ink">{store.billTo.name || "Client Name"}</p>
                <p className="text-xs text-ink-muted">{store.billTo.email || "client@email.com"}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-wide text-ink-muted">Project</p>
                <p className="mt-2 font-semibold text-ink">{store.projectName || "Project Name"}</p>
              </div>
            </section>

            <SharedLineItems />

            <section className="mt-6 flex justify-end">
              <TotalsSummary
                color={color}
                currency={store.currency}
                discountAmount={totals.discountAmount}
                subtotal={totals.subtotal}
                taxAmount={totals.taxAmount}
                taxLabel={store.taxLabel}
                taxRate={store.taxRate}
                total={totals.total}
              />
            </section>
          </div>
        ) : null}

        {store.templateType === "MILESTONE" ? (
          <div>
            <header className="border-b pb-4">
              <h2 className="text-2xl font-bold" style={{ color }}>
                Milestone Invoice
              </h2>
              <p className="mt-2 text-xs text-ink-muted">{store.invoiceNumber || "Pending Number"}</p>
            </header>

            <section className="mt-5 rounded-md border border-surface-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Milestones</p>
              {!store.milestones.length ? (
                <p className="mt-2 text-xs text-ink-muted">No milestones added yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {store.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs">
                      <div>
                        <p className="font-medium text-ink">{milestone.name || "Untitled milestone"}</p>
                        <p className="text-ink-muted">{milestone.dueDate || "No due date"}</p>
                      </div>
                      <p className="font-semibold text-ink">{formatCurrency(milestone.amount || 0, store.currency)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <SharedLineItems />

            <section className="mt-6 flex justify-end">
              <TotalsSummary
                color={color}
                currency={store.currency}
                discountAmount={totals.discountAmount}
                subtotal={totals.subtotal}
                taxAmount={totals.taxAmount}
                taxLabel={store.taxLabel}
                taxRate={store.taxRate}
                total={totals.total}
              />
            </section>
          </div>
        ) : null}

        {store.templateType === "RETAINER" ? (
          <div>
            <header className="rounded-lg px-4 py-3 text-white" style={{ backgroundColor: color }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Monthly Retainer</p>
              <h2 className="mt-2 text-xl font-bold">{store.invoiceNumber || "Pending Number"}</h2>
              <p className="mt-1 text-xs text-white/90">
                {store.servicePeriodStart || store.issueDate || "-"} - {store.servicePeriodEnd || store.dueDate || "-"}
              </p>
            </header>

            <section className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Bill To</p>
                <p className="mt-2 font-semibold text-ink">{store.billTo.name || "Client Name"}</p>
                <p className="text-xs text-ink-muted">{store.billTo.email || "client@email.com"}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Due Date</p>
                <p className="mt-2 font-semibold text-ink">
                  {store.dueDate ? formatDate(store.dueDate) : "-"}
                </p>
              </div>
            </section>

            <SharedLineItems />

            <section className="mt-6 flex justify-end">
              <TotalsSummary
                color={color}
                currency={store.currency}
                discountAmount={totals.discountAmount}
                subtotal={totals.subtotal}
                taxAmount={totals.taxAmount}
                taxLabel={store.taxLabel}
                taxRate={store.taxRate}
                total={totals.total}
              />
            </section>
          </div>
        ) : null}

        {store.templateType === "CLASSIC" ? (
          <div>
            <header className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color }}>
                  INVOICE
                </h2>
                <p className="mt-2 text-xs text-ink-muted">{store.invoiceNumber || "Pending Number"}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-ink-muted">Issued</p>
                <p className="font-medium text-ink">
                  {store.issueDate ? formatDate(store.issueDate) : "-"}
                </p>
                <p className="mt-2 text-ink-muted">Due</p>
                <p className="font-medium text-ink">{store.dueDate ? formatDate(store.dueDate) : "-"}</p>
              </div>
            </header>

            <section className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Bill To</p>
                <p className="mt-2 font-semibold text-ink">{store.billTo.name || "Client Name"}</p>
                <p className="text-xs text-ink-muted">{store.billTo.email || "client@email.com"}</p>
                {store.billTo.company ? <p className="text-xs text-ink-muted">{store.billTo.company}</p> : null}
                {store.billTo.address ? <p className="text-xs text-ink-muted">{store.billTo.address}</p> : null}
                {store.billTo.city ? (
                  <p className="text-xs text-ink-muted">
                    {store.billTo.city}
                    {store.billTo.country ? `, ${store.billTo.country}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Project</p>
                <p className="mt-2 font-semibold text-ink">{store.projectName || "Project Name"}</p>
                <p className="text-xs text-ink-muted">
                  {store.projectDescription || "Project description will appear here."}
                </p>
              </div>
            </section>

            <SharedLineItems />

            <section className="mt-6 flex justify-end">
              <TotalsSummary
                color={color}
                currency={store.currency}
                discountAmount={totals.discountAmount}
                subtotal={totals.subtotal}
                taxAmount={totals.taxAmount}
                taxLabel={store.taxLabel}
                taxRate={store.taxRate}
                total={totals.total}
              />
            </section>
          </div>
        ) : null}

        {(store.notes || store.footer) && (
          <section className="mt-8 space-y-3 border-t pt-4 text-xs">
            {store.notes ? (
              <div>
                <p className="font-semibold text-ink">Notes</p>
                <p className="text-ink-muted">{store.notes}</p>
              </div>
            ) : null}
            {store.footer ? <p className="text-center text-ink-subtle">{store.footer}</p> : null}
          </section>
        )}
      </div>
    </div>
  );
}
