"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Paintbrush, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { TemplateType } from "@/types/invoice";

interface TemplateCard {
  key: TemplateType;
  name: string;
  description: string;
  image: string;
  origin: string;
}

interface CustomPreset {
  id: string;
  name: string;
  description: string;
  templateType: TemplateType;
  primaryColor: string;
  accentColor: string;
}

interface SettingsResponse {
  success: boolean;
  data?: {
    invoiceSettings?: {
      defaultTemplate?: TemplateType;
    } | null;
  };
}

const CUSTOM_PRESET_STORAGE_KEY = "invoiceflow.custom-templates.v1";

const templates: TemplateCard[] = [
  {
    key: "CLASSIC",
    name: "Classic Ledger",
    description: "Trusted enterprise style inspired by legal and financial billing docs.",
    image: "/template-previews/classic.png",
    origin: "Structured typography from accounting-led invoice systems.",
  },
  {
    key: "MODERN",
    name: "Modern Studio",
    description: "Confident card layout inspired by modern SaaS and design agency billing.",
    image: "/template-previews/modern.png",
    origin: "Inspired by contemporary dashboard patterns on Dribbble.",
  },
  {
    key: "MINIMAL",
    name: "Minimal Mono",
    description: "Sparse high-contrast invoice that keeps attention on numbers and terms.",
    image: "/template-previews/minimal.png",
    origin: "Inspired by editorial finance layouts used by technical teams.",
  },
  {
    key: "MILESTONE",
    name: "Milestone Matrix",
    description: "Phase-based invoice for project retainers and delivery checkpoints.",
    image: "/template-previews/milestone.png",
    origin: "Inspired by project-finance milestone reporting patterns.",
  },
  {
    key: "RETAINER",
    name: "Retainer Pulse",
    description: "Recurring service invoice with prominent period and fee visibility.",
    image: "/template-previews/retainer.png",
    origin: "Inspired by subscription and managed-service billing workflows.",
  },
];

const emptyPreset: Omit<CustomPreset, "id"> = {
  name: "",
  description: "",
  templateType: "MODERN",
  primaryColor: "#0F766E",
  accentColor: "#1F2937",
};

export default function TemplatesPage(): JSX.Element {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);
  const [defaultTemplate, setDefaultTemplate] = useState<TemplateType | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomPreset[]>([]);
  const [draftPreset, setDraftPreset] = useState<Omit<CustomPreset, "id">>(emptyPreset);

  useEffect(() => {
    const raw = window.localStorage.getItem(CUSTOM_PRESET_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CustomPreset[];
      setCustomTemplates(parsed);
    } catch (error) {
      console.error("Read custom template presets failed:", error);
    }
  }, []);

  useEffect(() => {
    const loadDefaults = async (): Promise<void> => {
      try {
        setIsLoadingDefault(true);
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = (await response.json()) as SettingsResponse;
        if (response.ok && payload.success) {
          setDefaultTemplate(payload.data?.invoiceSettings?.defaultTemplate || "CLASSIC");
        }
      } catch (error) {
        console.error("Load settings failed:", error);
      } finally {
        setIsLoadingDefault(false);
      }
    };

    void loadDefaults();
  }, []);

  const persistCustomTemplates = (templatesToSave: CustomPreset[]): void => {
    setCustomTemplates(templatesToSave);
    window.localStorage.setItem(CUSTOM_PRESET_STORAGE_KEY, JSON.stringify(templatesToSave));
  };

  const applyTemplate = async (template: TemplateType): Promise<void> => {
    setIsSaving(template);
    try {
      const response = await fetch("/api/settings/invoice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultTemplate: template }),
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update template");
      }
      setDefaultTemplate(template);
      toast({ title: "Default template updated", description: template });
    } catch (error) {
      console.error("Use template failed:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to save template",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const createCustomTemplate = (): void => {
    if (!draftPreset.name.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Provide a template name before saving.",
      });
      return;
    }

    const nextPreset: CustomPreset = {
      id: crypto.randomUUID(),
      ...draftPreset,
    };

    persistCustomTemplates([nextPreset, ...customTemplates]);
    setDraftPreset(emptyPreset);
    toast({ title: "Custom template saved", description: nextPreset.name });
  };

  const removeCustomTemplate = (id: string): void => {
    persistCustomTemplates(customTemplates.filter((template) => template.id !== id));
  };

  const applyCustomAsDefault = async (template: CustomPreset): Promise<void> => {
    setIsSaving(template.id);
    try {
      const [invoiceResponse, profileResponse] = await Promise.all([
        fetch("/api/settings/invoice", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ defaultTemplate: template.templateType }),
        }),
        fetch("/api/settings/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primaryColor: template.primaryColor,
            accentColor: template.accentColor,
          }),
        }),
      ]);

      const invoicePayload = (await invoiceResponse.json()) as { success: boolean; error?: string };
      const profilePayload = (await profileResponse.json()) as { success: boolean; error?: string };

      if (!invoiceResponse.ok || !invoicePayload.success) {
        throw new Error(invoicePayload.error || "Failed to set default template");
      }
      if (!profileResponse.ok || !profilePayload.success) {
        throw new Error(profilePayload.error || "Failed to save template colors");
      }

      setDefaultTemplate(template.templateType);
      toast({ title: "Custom default applied", description: template.name });
    } catch (error) {
      console.error("Apply custom default failed:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to apply custom template",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const openTemplate = (template: Pick<CustomPreset, "templateType" | "primaryColor" | "accentColor">): void => {
    const params = new URLSearchParams({
      template: template.templateType,
      primaryColor: template.primaryColor,
      accentColor: template.accentColor,
    });
    router.push(`/invoices/new?${params.toString()}`);
  };

  const inspirationSummary = useMemo(
    () =>
      "Visual direction combines trustworthy accounting layouts with modern SaaS hierarchy, informed by professional invoice explorations on Dribbble.",
    [],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-surface-border bg-white p-4">
        <h1 className="text-2xl font-semibold text-ink">Invoice Templates</h1>
        <p className="mt-2 text-sm text-ink-muted">{inspirationSummary}</p>
      </div>

      {isLoadingDefault ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={`template-loading-${idx}`}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-44 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isDefault = defaultTemplate === template.key;
            return (
              <Card key={template.key} className={isDefault ? "border-brand-600" : undefined}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    {isDefault ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                        Default
                      </span>
                    ) : null}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="overflow-hidden rounded-lg border border-surface-border">
                    <Image
                      alt={`${template.name} template preview`}
                      className="h-auto w-full"
                      height={800}
                      src={template.image}
                      width={600}
                    />
                  </div>
                  <p className="text-xs text-ink-muted">{template.origin}</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    className="rounded-xl"
                    disabled={isSaving === template.key}
                    onClick={() => void applyTemplate(template.key)}
                    size="sm"
                  >
                    {isSaving === template.key ? "Saving..." : "Set Default"}
                  </Button>
                  <Button
                    className="rounded-xl"
                    onClick={() =>
                      openTemplate({
                        templateType: template.key,
                        primaryColor: "#0F766E",
                        accentColor: "#1F2937",
                      })
                    }
                    size="sm"
                    variant="outline"
                  >
                    Use in New Invoice
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-xl" size="sm" variant="outline">
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-xl">
                      <DialogHeader>
                        <DialogTitle>{template.name} Preview</DialogTitle>
                      </DialogHeader>
                      <Image
                        alt={`${template.name} full preview`}
                        className="h-auto w-full rounded-md border border-surface-border"
                        height={800}
                        src={template.image}
                        width={600}
                      />
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-brand-700" />
            Custom Template Studio
          </CardTitle>
          <CardDescription>
            Design your own professional look by combining a base structure with your brand colors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Template Name</Label>
              <Input
                placeholder="Enterprise Olive"
                value={draftPreset.name}
                onChange={(event) =>
                  setDraftPreset((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Base Layout</Label>
              <Select
                value={draftPreset.templateType}
                onValueChange={(value) =>
                  setDraftPreset((current) => ({ ...current, templateType: value as TemplateType }))
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
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={draftPreset.primaryColor}
                onChange={(event) =>
                  setDraftPreset((current) => ({ ...current, primaryColor: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Accent Color</Label>
              <Input
                type="color"
                value={draftPreset.accentColor}
                onChange={(event) =>
                  setDraftPreset((current) => ({ ...current, accentColor: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Clean invoice for consulting clients with warm highlights."
                value={draftPreset.description}
                onChange={(event) =>
                  setDraftPreset((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
          </div>
          <Button className="rounded-xl" onClick={createCustomTemplate} type="button">
            <Plus className="h-4 w-4" />
            Save Custom Template
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {customTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>{template.description || "Custom template preset."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="rounded-full bg-slate-100 px-2 py-1">{template.templateType}</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: template.primaryColor }} />
                  {template.primaryColor}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: template.accentColor }} />
                  {template.accentColor}
                </span>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="rounded-xl" onClick={() => openTemplate(template)} size="sm">
                Use for New Invoice
              </Button>
              <Button
                className="rounded-xl"
                disabled={isSaving === template.id}
                onClick={() => void applyCustomAsDefault(template)}
                size="sm"
                variant="outline"
              >
                {isSaving === template.id ? "Saving..." : "Set as Default"}
              </Button>
              <Button
                className="rounded-xl"
                onClick={() => removeCustomTemplate(template.id)}
                size="sm"
                variant="outline"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
