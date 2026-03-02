"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export interface InvoiceDefaultsValues {
  defaultTemplate: "CLASSIC" | "MODERN" | "MINIMAL" | "MILESTONE" | "RETAINER";
  defaultPaymentTerms: number;
  defaultTaxRate: number;
  defaultTaxLabel: string;
  defaultCurrency: string;
  invoicePrefix: string;
  defaultFooter?: string | null;
  sendCopyToSelf: boolean;
}

export function BrandingSettings({
  initialValues,
  onSaved,
}: {
  initialValues?: Partial<InvoiceDefaultsValues>;
  onSaved?: () => void;
}): JSX.Element {
  const [values, setValues] = useState<InvoiceDefaultsValues>({
    defaultTemplate: initialValues?.defaultTemplate || "CLASSIC",
    defaultPaymentTerms: initialValues?.defaultPaymentTerms || 30,
    defaultTaxRate: initialValues?.defaultTaxRate || 0,
    defaultTaxLabel: initialValues?.defaultTaxLabel || "VAT",
    defaultCurrency: initialValues?.defaultCurrency || "UGX",
    invoicePrefix: initialValues?.invoicePrefix || "INV",
    defaultFooter: initialValues?.defaultFooter || "",
    sendCopyToSelf: initialValues?.sendCopyToSelf || false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const save = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/invoice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save defaults");
      }
      toast({ title: "Invoice defaults updated" });
      onSaved?.();
    } catch (error) {
      console.error("Save invoice defaults failed:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Default Template</Label>
          <select
            className="h-10 w-full rounded-md border border-surface-border bg-white px-3 text-sm"
            value={values.defaultTemplate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                defaultTemplate: event.target.value as InvoiceDefaultsValues["defaultTemplate"],
              }))
            }
          >
            <option value="CLASSIC">CLASSIC</option>
            <option value="MODERN">MODERN</option>
            <option value="MINIMAL">MINIMAL</option>
            <option value="MILESTONE">MILESTONE</option>
            <option value="RETAINER">RETAINER</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Invoice Prefix</Label>
          <Input
            value={values.invoicePrefix}
            onChange={(event) =>
              setValues((current) => ({ ...current, invoicePrefix: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Default Payment Terms (days)</Label>
          <Input
            min={0}
            type="number"
            value={values.defaultPaymentTerms}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                defaultPaymentTerms: Number(event.target.value || 0),
              }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Default Tax Rate (%)</Label>
          <Input
            min={0}
            max={100}
            step="any"
            type="number"
            value={values.defaultTaxRate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                defaultTaxRate: Number(event.target.value || 0),
              }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Default Tax Label</Label>
          <Input
            value={values.defaultTaxLabel}
            onChange={(event) =>
              setValues((current) => ({ ...current, defaultTaxLabel: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label>Default Currency</Label>
          <Input
            value={values.defaultCurrency}
            onChange={(event) =>
              setValues((current) => ({ ...current, defaultCurrency: event.target.value }))
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Default Footer</Label>
        <Textarea
          value={values.defaultFooter || ""}
          onChange={(event) =>
            setValues((current) => ({ ...current, defaultFooter: event.target.value }))
          }
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          checked={values.sendCopyToSelf}
          onChange={(event) =>
            setValues((current) => ({ ...current, sendCopyToSelf: event.target.checked }))
          }
          type="checkbox"
        />
        Send copy to self by default
      </label>
      <Button disabled={isSaving} onClick={() => void save()} type="button">
        {isSaving ? "Saving..." : "Save Invoice Defaults"}
      </Button>
    </div>
  );
}
