"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ClientFormValues {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  defaultCurrency?: string;
  taxId?: string;
  notes?: string;
}

export function ClientForm({
  initialValues,
  clientId,
  onSuccess,
}: {
  initialValues?: ClientFormValues;
  clientId?: string;
  onSuccess?: () => void;
}): JSX.Element {
  const [values, setValues] = useState<ClientFormValues>(
    initialValues || {
      name: "",
      email: "",
      company: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      defaultCurrency: "UGX",
      taxId: "",
      notes: "",
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const response = await fetch(clientId ? `/api/clients/${clientId}` : "/api/clients", {
        method: clientId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save client");
      }

      toast({
        title: "Client saved",
        description: "Client details updated successfully.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Save client failed:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save client",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const set =
    (key: keyof ClientFormValues) =>
    (value: string): void => {
      setValues((current) => ({ ...current, [key]: value }));
    };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={values.name} onChange={(event) => set("name")(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => set("email")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Company</Label>
          <Input
            value={values.company || ""}
            onChange={(event) => set("company")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input value={values.phone || ""} onChange={(event) => set("phone")(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Website</Label>
          <Input
            value={values.website || ""}
            onChange={(event) => set("website")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Tax ID</Label>
          <Input value={values.taxId || ""} onChange={(event) => set("taxId")(event.target.value)} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Address</Label>
          <Input
            value={values.address || ""}
            onChange={(event) => set("address")(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>City</Label>
          <Input value={values.city || ""} onChange={(event) => set("city")(event.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Country</Label>
          <Input
            value={values.country || ""}
            onChange={(event) => set("country")(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea value={values.notes || ""} onChange={(event) => set("notes")(event.target.value)} />
      </div>
      <Button disabled={isSubmitting} onClick={() => void submit()} type="button">
        {isSubmitting ? "Saving..." : "Save Client"}
      </Button>
    </div>
  );
}
