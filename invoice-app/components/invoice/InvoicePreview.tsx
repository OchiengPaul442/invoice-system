"use client";

import { useMemo } from "react";
import { useInvoiceBuilderStore } from "@/store/invoice-builder.store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function InvoicePreview(): JSX.Element {
  const store = useInvoiceBuilderStore();
  const lineItems = store.lineItems;

  const totals = useMemo(
    () => ({
      subtotal: store.subtotal,
      discountAmount: store.discountAmount,
      taxAmount: store.taxAmount,
      total: store.total,
    }),
    [store.subtotal, store.discountAmount, store.taxAmount, store.total],
  );

  return (
    <div className="h-full w-full overflow-auto rounded-lg border border-surface-border bg-slate-100 p-4">
      <div className="mx-auto min-h-[842px] w-full max-w-[595px] rounded-lg bg-white p-8 text-sm shadow-lg">
        <header className="flex items-start justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-brand-600">
              INVOICE
            </h2>
            <p className="mt-2 text-xs text-ink-muted">
              {store.invoiceNumber || "Pending Number"}
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="text-ink-muted">Issued</p>
            <p className="font-medium text-ink">
              {store.issueDate ? formatDate(store.issueDate) : "-"}
            </p>
            <p className="mt-2 text-ink-muted">Due</p>
            <p className="font-medium text-ink">
              {store.dueDate ? formatDate(store.dueDate) : "-"}
            </p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Bill To
            </p>
            <p className="mt-2 font-semibold text-ink">
              {store.billTo.name || "Client Name"}
            </p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Project
            </p>
            <p className="mt-2 font-semibold text-ink">
              {store.projectName || "Project Name"}
            </p>
            <p className="text-xs text-ink-muted">
              {store.projectDescription || "Project description will appear here."}
            </p>
          </div>
        </section>

        <section className="mt-6">
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
                  {formatCurrency(item.amount, store.currency)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span>{formatCurrency(totals.subtotal, store.currency)}</span>
            </div>
            {totals.discountAmount > 0 ? (
              <div className="flex justify-between">
                <span className="text-ink-muted">Discount</span>
                <span>-{formatCurrency(totals.discountAmount, store.currency)}</span>
              </div>
            ) : null}
            {store.taxRate > 0 ? (
              <div className="flex justify-between">
                <span className="text-ink-muted">
                  {store.taxLabel} ({store.taxRate}%)
                </span>
                <span>{formatCurrency(totals.taxAmount, store.currency)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between rounded-md bg-brand-600 px-3 py-2 text-white">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                {formatCurrency(totals.total, store.currency)}
              </span>
            </div>
          </div>
        </section>

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
