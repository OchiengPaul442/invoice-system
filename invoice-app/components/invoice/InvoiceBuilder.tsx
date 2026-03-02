"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useClients } from "@/hooks/useClients";
import { usePDFDownload } from "@/hooks/usePDFDownload";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, SUPPORTED_CURRENCIES } from "@/lib/utils";
import { useInvoiceBuilderStore } from "@/store/invoice-builder.store";
import { BillingType, LineItem, Milestone, TemplateType } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { LineItemsTable } from "@/components/invoice/LineItemsTable";

interface ClientOption {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  taxId?: string | null;
}

const templateOptions: Array<{ value: TemplateType; label: string; description: string }> = [
  { value: "CLASSIC", label: "Classic", description: "General freelance and consulting" },
  { value: "MODERN", label: "Modern", description: "Design-forward client invoices" },
  { value: "MINIMAL", label: "Minimal", description: "No-frills concise billing" },
  { value: "MILESTONE", label: "Milestone", description: "Project phase billing" },
  { value: "RETAINER", label: "Retainer", description: "Recurring monthly engagement" },
];

const billingTypes: BillingType[] = ["HOURLY", "FIXED", "RETAINER", "MILESTONE", "LICENSE"];

interface SaveResponse {
  success: boolean;
  data?: { id: string; invoiceNumber: string };
  error?: string;
}

interface InvoiceBuilderProps {
  invoiceId?: string;
}

export function InvoiceBuilder({ invoiceId }: InvoiceBuilderProps): JSX.Element {
  const router = useRouter();
  const { downloadPDF } = usePDFDownload();
  const { clients } = useClients<ClientOption>("isActive=true");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(Boolean(invoiceId));

  const store = useInvoiceBuilderStore();
  const dueDate = useInvoiceBuilderStore((state) => state.dueDate);
  const setField = useInvoiceBuilderStore((state) => state.setField);
  const loadInvoice = useInvoiceBuilderStore((state) => state.loadInvoice);
  const reset = useInvoiceBuilderStore((state) => state.reset);

  useEffect(() => {
    if (!dueDate) {
      setField("dueDate", addDays(new Date(), 30).toISOString().split("T")[0]);
    }
    return () => reset();
  }, [dueDate, reset, setField]);

  useEffect(() => {
    if (!invoiceId) return;

    const load = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, { cache: "no-store" });
        const payload = (await response.json()) as {
          success: boolean;
          data?: Record<string, unknown>;
          error?: string;
        };
        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error || "Failed to load invoice");
        }

        const data = payload.data as {
          templateType: TemplateType;
          billingType: BillingType;
          clientId?: string | null;
          invoiceNumber: string;
          issueDate: string;
          dueDate: string;
          servicePeriodStart?: string | null;
          servicePeriodEnd?: string | null;
          projectName?: string | null;
          projectDescription?: string | null;
          lineItems: LineItem[];
          milestones?: Milestone[];
          currency: string;
          discountType?: "percent" | "fixed" | null;
          discountValue?: number | null;
          taxRate: number;
          taxLabel: string;
          notes?: string | null;
          footer?: string | null;
          paymentTerms?: string | null;
          paymentInstructions?: string | null;
          primaryColor?: string | null;
          accentColor?: string | null;
          showLogo: boolean;
          billToName: string;
          billToEmail: string;
          billToCompany?: string | null;
          billToAddress?: string | null;
          billToCity?: string | null;
          billToCountry?: string | null;
          billToTaxId?: string | null;
        };

        loadInvoice({
          templateType: data.templateType,
          billingType: data.billingType,
          clientId: data.clientId || null,
          invoiceNumber: data.invoiceNumber,
          issueDate: data.issueDate.split("T")[0],
          dueDate: data.dueDate.split("T")[0],
          servicePeriodStart: data.servicePeriodStart
            ? data.servicePeriodStart.split("T")[0]
            : null,
          servicePeriodEnd: data.servicePeriodEnd ? data.servicePeriodEnd.split("T")[0] : null,
          projectName: data.projectName || "",
          projectDescription: data.projectDescription || "",
          lineItems: data.lineItems,
          milestones: data.milestones || [],
          currency: data.currency,
          discountType: data.discountType || null,
          discountValue: data.discountValue ? Number(data.discountValue) : 0,
          taxRate: Number(data.taxRate),
          taxLabel: data.taxLabel,
          notes: data.notes || "",
          footer: data.footer || "",
          paymentTerms: data.paymentTerms || "",
          paymentInstructions: data.paymentInstructions || "",
          primaryColor: data.primaryColor || "#2563EB",
          accentColor: data.accentColor || "#0F172A",
          showLogo: data.showLogo,
          billTo: {
            name: data.billToName,
            email: data.billToEmail,
            company: data.billToCompany || "",
            address: data.billToAddress || "",
            city: data.billToCity || "",
            country: data.billToCountry || "",
            taxId: data.billToTaxId || "",
          },
        });
      } catch (error) {
        console.error("Load invoice failed:", error);
        toast({
          variant: "destructive",
          title: "Load failed",
          description: error instanceof Error ? error.message : "Unable to load invoice",
        });
      } finally {
        setIsLoadingInvoice(false);
      }
    };

    void load();
  }, [invoiceId, loadInvoice]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === store.clientId) ?? null,
    [clients, store.clientId],
  );

  useEffect(() => {
    if (!selectedClient) return;
    setField("billTo", {
      name: selectedClient.name,
      email: selectedClient.email,
      company: selectedClient.company ?? "",
      address: selectedClient.address ?? "",
      city: selectedClient.city ?? "",
      country: selectedClient.country ?? "",
      taxId: selectedClient.taxId ?? "",
    });
  }, [selectedClient, setField]);

  const payload = useMemo(
    () => ({
      clientId: store.clientId || undefined,
      templateType: store.templateType,
      billingType: store.billingType,
      issueDate: store.issueDate,
      dueDate: store.dueDate,
      servicePeriodStart: store.servicePeriodStart || undefined,
      servicePeriodEnd: store.servicePeriodEnd || undefined,
      billToName: store.billTo.name,
      billToEmail: store.billTo.email,
      billToCompany: store.billTo.company || undefined,
      billToAddress: store.billTo.address || undefined,
      billToCity: store.billTo.city || undefined,
      billToCountry: store.billTo.country || undefined,
      billToTaxId: store.billTo.taxId || undefined,
      lineItems: store.lineItems,
      milestones: store.milestones.length ? store.milestones : undefined,
      currency: store.currency,
      discountType: store.discountType || undefined,
      discountValue: store.discountValue || undefined,
      taxRate: store.taxRate,
      taxLabel: store.taxLabel,
      projectName: store.projectName || undefined,
      projectDescription: store.projectDescription || undefined,
      notes: store.notes || undefined,
      footer: store.footer || undefined,
      paymentTerms: store.paymentTerms || undefined,
      paymentInstructions: store.paymentInstructions || undefined,
      primaryColor: store.primaryColor,
      accentColor: store.accentColor,
      showLogo: store.showLogo,
    }),
    [store],
  );

  const saveInvoice = async (downloadAfterSave: boolean): Promise<void> => {
    setIsSaving(true);
    try {
      const response = await fetch(invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: invoiceId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as SaveResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save invoice");
      }

      toast({
        title: "Invoice saved",
        description: invoiceId
          ? "Invoice updated successfully"
          : `Saved as ${data.data?.invoiceNumber ?? "invoice"}`,
      });

      const id = data.data?.id ?? invoiceId;
      const number = data.data?.invoiceNumber ?? store.invoiceNumber ?? "invoice";

      if (downloadAfterSave) {
        await downloadPDF(id as string, number);
      }

      router.push(`/invoices/${id}`);
      router.refresh();
    } catch (error) {
      console.error("Save invoice failed:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save invoice",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingInvoice) {
    return (
      <div className="rounded-md border border-surface-border bg-white p-6 text-sm text-ink-muted">
        Loading invoice...
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Template</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {templateOptions.map((template) => (
              <button
                key={template.value}
                className={`rounded-md border p-3 text-left transition-colors ${
                  store.templateType === template.value
                    ? "border-brand-600 bg-brand-50"
                    : "border-surface-border hover:bg-slate-50"
                }`}
                onClick={() => setField("templateType", template.value)}
                type="button"
              >
                <p className="font-medium text-ink">{template.label}</p>
                <p className="text-xs text-ink-muted">{template.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Select Existing Client</Label>
              <Select
                value={store.clientId ?? "__none__"}
                onValueChange={(value) => setField("clientId", value === "__none__" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No selected client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Bill To Name</Label>
                <Input
                  value={store.billTo.name}
                  onChange={(event) =>
                    setField("billTo", { ...store.billTo, name: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Bill To Email</Label>
                <Input
                  value={store.billTo.email}
                  onChange={(event) =>
                    setField("billTo", { ...store.billTo, email: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Company</Label>
                <Input
                  value={store.billTo.company || ""}
                  onChange={(event) =>
                    setField("billTo", { ...store.billTo, company: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <Input
                  value={store.billTo.address || ""}
                  onChange={(event) =>
                    setField("billTo", { ...store.billTo, address: event.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Meta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={store.issueDate}
                onChange={(event) => setField("issueDate", event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={store.dueDate}
                onChange={(event) => setField("dueDate", event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Billing Type</Label>
              <Select
                value={store.billingType}
                onValueChange={(value) => setField("billingType", value as BillingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select
                value={store.currency}
                onValueChange={(value) => setField("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Project Name</Label>
              <Input
                value={store.projectName}
                onChange={(event) => setField("projectName", event.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Project Description</Label>
              <Textarea
                value={store.projectDescription}
                onChange={(event) => setField("projectDescription", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <LineItemsTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals & Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Discount Type</Label>
              <Select
                value={store.discountType ?? "__none__"}
                onValueChange={(value) =>
                  setField("discountType", value === "__none__" ? null : (value as "percent" | "fixed"))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No discount</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Discount Value</Label>
              <Input
                min={0}
                step="any"
                type="number"
                value={store.discountValue}
                onChange={(event) => setField("discountValue", Number(event.target.value || 0))}
              />
            </div>
            <div className="space-y-1">
              <Label>Tax Label</Label>
              <Input
                value={store.taxLabel}
                onChange={(event) => setField("taxLabel", event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Tax Rate (%)</Label>
              <Input
                min={0}
                max={100}
                step="any"
                type="number"
                value={store.taxRate}
                onChange={(event) => setField("taxRate", Number(event.target.value || 0))}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Payment Terms</Label>
              <Input
                value={store.paymentTerms}
                onChange={(event) => setField("paymentTerms", event.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Payment Instructions</Label>
              <Textarea
                value={store.paymentInstructions}
                onChange={(event) => setField("paymentInstructions", event.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={store.notes}
                onChange={(event) => setField("notes", event.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Footer</Label>
              <Textarea
                value={store.footer}
                onChange={(event) => setField("footer", event.target.value)}
              />
            </div>
            <div className="md:col-span-2 rounded-md border border-surface-border bg-slate-50 p-3">
              <p className="text-sm font-semibold text-ink">
                Total: {formatCurrency(store.total, store.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="sticky top-20 space-y-3">
          <InvoicePreview />
          <div className="grid gap-2">
            <Button disabled={isSaving} onClick={() => void saveInvoice(false)} variant="outline">
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button disabled={isSaving} onClick={() => void saveInvoice(true)}>
              {isSaving ? "Saving..." : "Save & Download PDF"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
