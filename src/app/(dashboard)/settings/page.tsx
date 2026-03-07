"use client";

import { useEffect, useState } from "react";
import { BusinessForm, BusinessProfileValues } from "@/components/settings/BusinessForm";
import { BrandingSettings, InvoiceDefaultsValues } from "@/components/settings/BrandingSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [isLoading, setIsLoading] = useState(true);

  const load = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/settings", { cache: "no-store" });
      const data = (await response.json()) as SettingsPayload;
      if (data.success && data.data) {
        setPayload(data.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">Manage brand, defaults, and payment-ready profile details.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-10 w-44" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="business" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl p-1">
            <TabsTrigger className="rounded-lg py-2.5" value="business">
              Business Profile
            </TabsTrigger>
            <TabsTrigger className="rounded-lg py-2.5" value="invoice">
              Invoice Defaults
            </TabsTrigger>
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
                <BrandingSettings initialValues={payload?.invoiceSettings || undefined} onSaved={load} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
