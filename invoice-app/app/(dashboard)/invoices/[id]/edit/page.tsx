import { InvoiceBuilder } from "@/components/invoice/InvoiceBuilder";

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Edit Invoice</h1>
        <p className="text-sm text-ink-muted">
          Update details and regenerate your invoice output.
        </p>
      </div>
      <InvoiceBuilder invoiceId={params.id} />
    </div>
  );
}
