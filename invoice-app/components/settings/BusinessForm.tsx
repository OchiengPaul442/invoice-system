"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORTED_CURRENCIES } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { LogoUpload } from "@/components/settings/LogoUpload";

export interface BusinessProfileValues {
  businessName?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessCountry?: string;
  businessZip?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  taxId?: string;
  currency?: string;
  logoPath?: string | null;
  primaryColor?: string;
  accentColor?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  swiftCode?: string;
  paymentNotes?: string;
}

export function BusinessForm({
  initialValues,
  onSaved,
}: {
  initialValues?: BusinessProfileValues;
  onSaved?: () => void;
}): JSX.Element {
  const [values, setValues] = useState<BusinessProfileValues>({
    businessName: initialValues?.businessName || "",
    businessAddress: initialValues?.businessAddress || "",
    businessCity: initialValues?.businessCity || "",
    businessState: initialValues?.businessState || "",
    businessCountry: initialValues?.businessCountry || "Uganda",
    businessZip: initialValues?.businessZip || "",
    businessPhone: initialValues?.businessPhone || "",
    businessEmail: initialValues?.businessEmail || "",
    businessWebsite: initialValues?.businessWebsite || "",
    taxId: initialValues?.taxId || "",
    currency: initialValues?.currency || "UGX",
    logoPath: initialValues?.logoPath || null,
    primaryColor: initialValues?.primaryColor || "#2563EB",
    accentColor: initialValues?.accentColor || "#0F172A",
    bankName: initialValues?.bankName || "",
    bankAccount: initialValues?.bankAccount || "",
    bankBranch: initialValues?.bankBranch || "",
    swiftCode: initialValues?.swiftCode || "",
    paymentNotes: initialValues?.paymentNotes || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const update =
    (key: keyof BusinessProfileValues) =>
    (value: string): void => {
      setValues((current) => ({ ...current, [key]: value }));
    };

  const save = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save profile");
      }
      toast({ title: "Business profile updated" });
      onSaved?.();
    } catch (error) {
      console.error("Save business profile failed:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <LogoUpload
        value={values.logoPath}
        onUploaded={(logoPath) => setValues((current) => ({ ...current, logoPath }))}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Business Name</Label>
          <Input
            value={values.businessName}
            onChange={(event) => update("businessName")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Business Email</Label>
          <Input
            value={values.businessEmail}
            onChange={(event) => update("businessEmail")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Business Phone</Label>
          <Input
            value={values.businessPhone}
            onChange={(event) => update("businessPhone")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Website</Label>
          <Input
            value={values.businessWebsite}
            onChange={(event) => update("businessWebsite")(event.target.value)}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Business Address</Label>
          <Input
            value={values.businessAddress}
            onChange={(event) => update("businessAddress")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>City</Label>
          <Input
            value={values.businessCity}
            onChange={(event) => update("businessCity")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Country</Label>
          <Input
            value={values.businessCountry}
            onChange={(event) => update("businessCountry")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Currency</Label>
          <select
            className="h-10 w-full rounded-md border border-surface-border bg-white px-3 text-sm"
            value={values.currency}
            onChange={(event) => update("currency")(event.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Tax ID</Label>
          <Input value={values.taxId} onChange={(event) => update("taxId")(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Primary Color</Label>
          <Input
            type="color"
            value={values.primaryColor}
            onChange={(event) => update("primaryColor")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Accent Color</Label>
          <Input
            type="color"
            value={values.accentColor}
            onChange={(event) => update("accentColor")(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Payment Notes</Label>
        <Textarea
          value={values.paymentNotes}
          onChange={(event) => update("paymentNotes")(event.target.value)}
        />
      </div>
      <Button disabled={isSaving} onClick={() => void save()} type="button">
        {isSaving ? "Saving..." : "Save Business Profile"}
      </Button>
    </div>
  );
}
