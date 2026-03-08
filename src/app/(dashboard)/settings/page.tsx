"use client";

import { useEffect, useState } from "react";
import { BusinessForm, BusinessProfileValues } from "@/components/settings/BusinessForm";
import { BrandingSettings, InvoiceDefaultsValues } from "@/components/settings/BrandingSettings";
import { ConnectedAccounts } from "@/components/settings/ConnectedAccounts";
import { FeedbackPanel } from "@/components/settings/FeedbackPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";

interface SettingsPayload {
  success: boolean;
  data?: {
    user: { id: string; name: string; email: string };
    profile: BusinessProfileValues | null;
    invoiceSettings: Partial<InvoiceDefaultsValues> | null;
  };
}

export default function SettingsPage(): JSX.Element {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [payload, setPayload] = useState<SettingsPayload["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    initialTab === "accounts" || initialTab === "feedback" || initialTab === "invoice"
      ? initialTab
      : "business",
  );

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

  useEffect(() => {
    if (initialTab === "accounts" || initialTab === "feedback" || initialTab === "invoice") {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">
          Manage sender profile, invoice defaults, linked accounts, and product feedback.
        </p>
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
        <Tabs className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1 md:grid-cols-4">
            <TabsTrigger className="rounded-lg py-2.5" value="business">
              Sender Profile
            </TabsTrigger>
            <TabsTrigger className="rounded-lg py-2.5" value="invoice">
              Invoice Defaults
            </TabsTrigger>
            <TabsTrigger className="rounded-lg py-2.5" value="accounts">
              Linked Accounts
            </TabsTrigger>
            <TabsTrigger className="rounded-lg py-2.5" value="feedback">
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Sender Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessForm
                  accountEmail={payload?.user.email}
                  accountName={payload?.user.name}
                  initialValues={payload?.profile || undefined}
                  onSaved={load}
                />
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

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>Linked Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <ConnectedAccounts />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Product Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackPanel accountEmail={payload?.user.email} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
