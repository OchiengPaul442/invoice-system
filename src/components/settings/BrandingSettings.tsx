"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    defaultTemplate: "CLASSIC",
    defaultPaymentTerms: 30,
    defaultTaxRate: 0,
    defaultTaxLabel: "VAT",
    defaultCurrency: "UGX",
    invoicePrefix: "INV",
    defaultFooter: "",
    sendCopyToSelf: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues({
      defaultTemplate: initialValues?.defaultTemplate || "CLASSIC",
      defaultPaymentTerms: initialValues?.defaultPaymentTerms || 30,
      defaultTaxRate: initialValues?.defaultTaxRate || 0,
      defaultTaxLabel: initialValues?.defaultTaxLabel || "VAT",
      defaultCurrency: initialValues?.defaultCurrency || "UGX",
      invoicePrefix: initialValues?.invoicePrefix || "INV",
      defaultFooter: initialValues?.defaultFooter || "",
      sendCopyToSelf: initialValues?.sendCopyToSelf || false,
    });
  }, [initialValues]);

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
          <Select
            value={values.defaultTemplate}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                defaultTemplate: value as InvoiceDefaultsValues["defaultTemplate"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLASSIC">Classic</SelectItem>
              <SelectItem value="MODERN">Modern</SelectItem>
              <SelectItem value="MINIMAL">Minimal</SelectItem>
              <SelectItem value="MILESTONE">Milestone</SelectItem>
              <SelectItem value="RETAINER">Retainer</SelectItem>
            </SelectContent>
          </Select>
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
      <Button className="rounded-xl" disabled={isSaving} onClick={() => void save()} type="button">
        {isSaving ? "Saving..." : "Save Invoice Defaults"}
      </Button>
    </div>
  );
}
