"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { TemplateType } from "@/types/invoice";

const sampleLineItems = [
  { description: "Product design sprint", qty: 1, amount: 1800 },
  { description: "Frontend implementation", qty: 24, amount: 2400 },
  { description: "QA and launch support", qty: 8, amount: 800 },
];

function ClassicPreview(): JSX.Element {
  return (
    <div className="h-full rounded-xl bg-white p-4 text-[10px] text-slate-700 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between border-b border-slate-200 pb-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">LedgerBloom Studio</p>
          <p className="mt-1 text-xs font-semibold text-slate-900">Invoice INV-2026-019</p>
        </div>
        <p className="text-right text-[9px] text-slate-500">Due Apr 16, 2026</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-slate-500">Bill to</p>
          <p className="font-semibold text-slate-900">Kampala Tech Ltd</p>
          <p>accounts@kampalatech.com</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-wide text-slate-500">Project</p>
          <p className="font-semibold text-slate-900">Mobile Billing Portal</p>
          <p>March sprint</p>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {sampleLineItems.map((item) => (
          <div key={item.description} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
            <span>{item.description}</span>
            <span className="font-medium text-slate-900">{formatCurrency(item.amount, "USD")}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end">
        <div className="w-28 rounded bg-emerald-700 px-2 py-1 text-right text-[10px] font-semibold text-white">
          {formatCurrency(5000, "USD")}
        </div>
      </div>
    </div>
  );
}

function ModernPreview(): JSX.Element {
  return (
    <div className="h-full rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="grid h-full grid-cols-[0.36fr_0.64fr] overflow-hidden rounded-xl">
        <div className="bg-slate-900 p-3 text-[9px] text-slate-200">
          <p className="text-[10px] font-semibold text-white">LedgerBloom</p>
          <p className="mt-1">bill@ledgerbloom.com</p>
          <p className="mt-1">Kampala, Uganda</p>
          <div className="mt-3 border-t border-slate-700 pt-2">
            <p className="text-[8px] uppercase tracking-[0.16em] text-slate-400">Bill to</p>
            <p className="mt-1 font-semibold text-white">Mombasa Creative Agency</p>
            <p>finance@mca.co.ke</p>
          </div>
        </div>
        <div className="p-3 text-[10px] text-slate-700">
          <p className="text-lg font-bold leading-none text-emerald-700">INVOICE</p>
          <p className="mt-1 text-[9px] text-slate-500">INV-2026-019 · Due Apr 16, 2026</p>
          <div className="mt-2 space-y-1">
            {sampleLineItems.map((item) => (
              <div key={item.description} className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span>{item.description}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(item.amount, "USD")}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end text-xs font-semibold text-slate-900">
            Total: {formatCurrency(5000, "USD")}
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalPreview(): JSX.Element {
  return (
    <div className="h-full rounded-xl bg-white p-4 text-[10px] text-slate-700 shadow-sm ring-1 ring-slate-200">
      <p className="text-base font-semibold leading-none text-slate-900">Invoice</p>
      <p className="mt-1 text-[9px] text-slate-500">INV-2026-019 · Apr 16, 2026</p>
      <div className="mt-3 space-y-1">
        {sampleLineItems.map((item) => (
          <div key={item.description} className="grid grid-cols-[1fr_auto] gap-2 border-b border-slate-200 pb-1">
            <span>{item.description}</span>
            <span className="font-medium text-slate-900">{formatCurrency(item.amount, "USD")}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end border-t border-slate-300 pt-2 text-[11px] font-semibold text-slate-900">
        {formatCurrency(5000, "USD")}
      </div>
    </div>
  );
}

function MilestonePreview(): JSX.Element {
  return (
    <div className="h-full rounded-xl bg-white p-4 text-[10px] text-slate-700 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-emerald-700">Milestone Invoice</p>
      <p className="mt-1 text-[9px] text-slate-500">INV-2026-019 · Due Apr 16, 2026</p>
      <div className="mt-3 space-y-1">
        <div className="rounded bg-sky-50 px-2 py-1">
          <p className="font-medium text-slate-900">Discovery complete</p>
          <p className="text-[9px] text-slate-600">Apr 02 · {formatCurrency(1200, "USD")}</p>
        </div>
        <div className="rounded bg-amber-50 px-2 py-1">
          <p className="font-medium text-slate-900">Build phase delivered</p>
          <p className="text-[9px] text-slate-600">Apr 09 · {formatCurrency(2200, "USD")}</p>
        </div>
        <div className="rounded bg-emerald-50 px-2 py-1">
          <p className="font-medium text-slate-900">Final launch</p>
          <p className="text-[9px] text-slate-600">Apr 16 · {formatCurrency(1600, "USD")}</p>
        </div>
      </div>
    </div>
  );
}

function RetainerPreview(): JSX.Element {
  return (
    <div className="h-full rounded-xl bg-white p-4 text-[10px] text-slate-700 shadow-sm ring-1 ring-slate-200">
      <div className="rounded bg-emerald-700 px-3 py-2 text-white">
        <p className="text-[9px] uppercase tracking-[0.16em] text-emerald-100">Monthly retainer</p>
        <p className="mt-1 text-xs font-semibold">Mar 15 - Apr 15</p>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
          <span>Support engineering hours</span>
          <span className="font-medium text-slate-900">{formatCurrency(2800, "USD")}</span>
        </div>
        <div className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
          <span>Maintenance and monitoring</span>
          <span className="font-medium text-slate-900">{formatCurrency(1200, "USD")}</span>
        </div>
      </div>
      <div className="mt-3 flex justify-end text-xs font-semibold text-slate-900">
        Total: {formatCurrency(4000, "USD")}
      </div>
    </div>
  );
}

function PreviewInner({ template }: { template: TemplateType }): JSX.Element {
  if (template === "MODERN") return <ModernPreview />;
  if (template === "MINIMAL") return <MinimalPreview />;
  if (template === "MILESTONE") return <MilestonePreview />;
  if (template === "RETAINER") return <RetainerPreview />;
  return <ClassicPreview />;
}

export function TemplatePreviewCard({
  template,
  className,
  expanded = false,
}: {
  template: TemplateType;
  className?: string;
  expanded?: boolean;
}): JSX.Element {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-surface-border bg-slate-50/70 p-3",
        expanded ? "w-full" : "",
        className,
      )}
    >
      <div className={cn("mx-auto", expanded ? "max-w-3xl" : "max-w-[420px]")}>
        <div className={cn("mx-auto", expanded ? "aspect-[1.414/1]" : "aspect-[1.35/1]")}>
          <PreviewInner template={template} />
        </div>
      </div>
    </div>
  );
}
