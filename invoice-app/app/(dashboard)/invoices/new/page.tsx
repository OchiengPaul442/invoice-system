import { InvoiceBuilder } from "@/components/invoice/InvoiceBuilder";

export default function NewInvoicePage(): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Create Invoice</h1>
        <p className="text-sm text-ink-muted">Build and preview your invoice in real time.</p>
      </div>
      <InvoiceBuilder />
    </div>
  );
}
