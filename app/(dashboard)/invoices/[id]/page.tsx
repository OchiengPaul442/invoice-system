"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Pencil, Send, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePDFDownload } from "@/hooks/usePDFDownload";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  billToName: string;
  billToEmail: string;
  billToCompany?: string | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    amount: number;
  }>;
  currency: string;
  subtotal: number;
  discountAmount?: number | null;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
  notes?: string | null;
  footer?: string | null;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    paidAt: string;
    reference?: string | null;
  }>;
  activityLog: Array<{
    id: string;
    action: string;
    note?: string | null;
    createdAt: string;
  }>;
}

export default function InvoiceDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { downloadPDF } = usePDFDownload();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoice = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        success: boolean;
        data?: InvoiceDetail;
        error?: string;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to load invoice");
      }
      setInvoice(payload.data);
    } catch (error) {
      console.error("Load invoice detail failed:", error);
      toast({
        variant: "destructive",
        title: "Load failed",
        description: error instanceof Error ? error.message : "Unable to load invoice",
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  const updateStatus = async (status: string): Promise<void> => {
    if (!invoice) return;
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update status");
      }
      toast({ title: "Status updated", description: `Invoice marked as ${status}` });
      await loadInvoice();
    } catch (error) {
      console.error("Update status failed:", error);
      toast({
        variant: "destructive",
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Unable to update status",
      });
    }
  };

  const deleteInvoice = async (): Promise<void> => {
    if (!invoice) return;
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete invoice");
      }
      toast({ title: "Invoice deleted" });
      router.push("/invoices");
      router.refresh();
    } catch (error) {
      console.error("Delete invoice failed:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unable to delete invoice",
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-ink-muted">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="text-sm text-red-600">Invoice not found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-ink">{invoice.invoiceNumber}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-ink-muted">
            Issued {formatDate(invoice.issueDate)} - Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => void downloadPDF(invoice.id, invoice.invoiceNumber)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => void updateStatus("SENT")}>
            <Send className="mr-2 h-4 w-4" />
            Mark Sent
          </Button>
          <Button onClick={() => void updateStatus("PAID")}>Mark Paid</Button>
          <Button variant="destructive" onClick={() => void deleteInvoice()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs uppercase text-ink-muted">Bill To</p>
            <p className="font-medium text-ink">{invoice.billToName}</p>
            <p className="text-sm text-ink-muted">{invoice.billToEmail}</p>
            {invoice.billToCompany ? (
              <p className="text-sm text-ink-muted">{invoice.billToCompany}</p>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-md border border-surface-border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Unit Price</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-t border-surface-border">
                    <td className="px-3 py-2">{item.description}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(Number(item.unitPrice), invoice.currency)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatCurrency(Number(item.amount), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Subtotal</span>
              <span>{formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
            </div>
            {Number(invoice.discountAmount || 0) > 0 ? (
              <div className="flex justify-between">
                <span className="text-ink-muted">Discount</span>
                <span>
                  -{formatCurrency(Number(invoice.discountAmount || 0), invoice.currency)}
                </span>
              </div>
            ) : null}
            {Number(invoice.taxRate) > 0 ? (
              <div className="flex justify-between">
                <span className="text-ink-muted">
                  {invoice.taxLabel} ({invoice.taxRate}%)
                </span>
                <span>{formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(Number(invoice.total), invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-brand-700">
              <span>Balance Due</span>
              <span>{formatCurrency(Number(invoice.balanceDue), invoice.currency)}</span>
            </div>
          </div>

          {invoice.notes ? (
            <div>
              <p className="text-xs uppercase text-ink-muted">Notes</p>
              <p className="text-sm text-ink">{invoice.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {!invoice.payments.length ? (
              <p className="text-sm text-ink-muted">No payments recorded.</p>
            ) : (
              <ul className="space-y-2">
                {invoice.payments.map((payment) => (
                  <li key={payment.id} className="rounded-md border border-surface-border p-2 text-sm">
                    <p className="font-medium text-ink">
                      {formatCurrency(Number(payment.amount), invoice.currency)} via{" "}
                      {payment.method}
                    </p>
                    <p className="text-xs text-ink-muted">{formatDate(payment.paidAt)}</p>
                    {payment.reference ? (
                      <p className="text-xs text-ink-muted">Ref: {payment.reference}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {!invoice.activityLog.length ? (
              <p className="text-sm text-ink-muted">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {invoice.activityLog.map((activity) => (
                  <li key={activity.id} className="rounded-md border border-surface-border p-2 text-sm">
                    <p className="font-medium capitalize text-ink">{activity.action}</p>
                    {activity.note ? <p className="text-xs text-ink-muted">{activity.note}</p> : null}
                    <p className="text-xs text-ink-muted">{formatDate(activity.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

