"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    businessName: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessCountry: "Uganda",
    businessZip: "",
    businessPhone: "",
    businessEmail: "",
    businessWebsite: "",
    taxId: "",
    currency: "UGX",
    logoPath: null,
    primaryColor: "#0F766E",
    accentColor: "#1F2937",
    bankName: "",
    bankAccount: "",
    bankBranch: "",
    swiftCode: "",
    paymentNotes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues({
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
      primaryColor: initialValues?.primaryColor || "#0F766E",
      accentColor: initialValues?.accentColor || "#1F2937",
      bankName: initialValues?.bankName || "",
      bankAccount: initialValues?.bankAccount || "",
      bankBranch: initialValues?.bankBranch || "",
      swiftCode: initialValues?.swiftCode || "",
      paymentNotes: initialValues?.paymentNotes || "",
    });
  }, [initialValues]);

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
        onCleared={() => setValues((current) => ({ ...current, logoPath: null }))}
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
          <Select
            value={values.currency}
            onValueChange={(value) => update("currency")(value)}
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
        <div className="space-y-1">
          <Label>Bank Name</Label>
          <Input
            value={values.bankName}
            onChange={(event) => update("bankName")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Bank Account</Label>
          <Input
            value={values.bankAccount}
            onChange={(event) => update("bankAccount")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Bank Branch</Label>
          <Input
            value={values.bankBranch}
            onChange={(event) => update("bankBranch")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>SWIFT Code</Label>
          <Input
            value={values.swiftCode}
            onChange={(event) => update("swiftCode")(event.target.value)}
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
      <Button className="rounded-xl" disabled={isSaving} onClick={() => void save()} type="button">
        {isSaving ? "Saving..." : "Save Business Profile"}
      </Button>
    </div>
  );
}
