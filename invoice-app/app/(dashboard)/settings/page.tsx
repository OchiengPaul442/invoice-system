"use client";

import { useEffect, useState } from "react";
import {
  BusinessForm,
  BusinessProfileValues,
} from "@/components/settings/BusinessForm";
import {
  BrandingSettings,
  InvoiceDefaultsValues,
} from "@/components/settings/BrandingSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsPayload {
  success: boolean;
  data?: {
    user: { id: string; name: string; email: string };
    profile: BusinessProfileValues | null;
    invoiceSettings: Partial<InvoiceDefaultsValues> | null;
  };
}

export default function SettingsPage(): JSX.Element {
  const [payload, setPayload] = useState<SettingsPayload["data"] | null>(null);

  const load = async (): Promise<void> => {
    const response = await fetch("/api/settings", { cache: "no-store" });
    const data = (await response.json()) as SettingsPayload;
    if (data.success && data.data) {
      setPayload(data.data);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business Profile</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Defaults</TabsTrigger>
          <TabsTrigger value="payment">Payment Details</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessForm initialValues={payload?.profile || undefined} onSaved={load} />
          </CardContent>
        </Card>
      </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
            <CardTitle>Invoice Defaults</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandingSettings
              initialValues={payload?.invoiceSettings || undefined}
              onSaved={load}
            />
          </CardContent>
        </Card>
      </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink-muted">
              Configure payment fields under Business Profile for bank details and payment
              notes.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-ink-muted">
              <p>Name: {payload?.user.name || "-"}</p>
              <p>Email: {payload?.user.email || "-"}</p>
              <p>Account update and password change flows can be extended in this tab.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
