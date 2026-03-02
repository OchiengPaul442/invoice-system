"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const templates = [
  {
    key: "CLASSIC",
    name: "Classic",
    description: "Traditional professional layout for general dev services.",
    image: "/template-previews/classic.png",
  },
  {
    key: "MODERN",
    name: "Modern",
    description: "Bold two-column design for design-forward clients.",
    image: "/template-previews/modern.png",
  },
  {
    key: "MINIMAL",
    name: "Minimal",
    description: "Minimal typography and whitespace for quick readability.",
    image: "/template-previews/minimal.png",
  },
  {
    key: "MILESTONE",
    name: "Milestone",
    description: "Phase and milestone breakdown ideal for project billing.",
    image: "/template-previews/milestone.png",
  },
  {
    key: "RETAINER",
    name: "Retainer",
    description: "Recurring engagement layout with service period highlight.",
    image: "/template-previews/retainer.png",
  },
] as const;

export default function TemplatesPage(): JSX.Element {
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const applyTemplate = async (template: string): Promise<void> => {
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Invoice Templates</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.key}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border border-surface-border">
                <Image
                  alt={`${template.name} template preview`}
                  className="h-auto w-full"
                  height={800}
                  src={template.image}
                  width={600}
                />
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                disabled={isSaving === template.key}
                onClick={() => void applyTemplate(template.key)}
                size="sm"
              >
                {isSaving === template.key ? "Saving..." : "Use Template"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
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
        ))}
      </div>
    </div>
  );
}
