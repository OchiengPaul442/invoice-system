"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function LogoUpload({
  value,
  onUploaded,
  onCleared,
}: {
  value?: string | null;
  onUploaded: (logoPath: string) => void;
  onCleared: () => void;
}): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<void> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { logoPath: string };
        error?: string;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Upload failed");
      }
      onUploaded(payload.data.logoPath);
      toast({ title: "Logo uploaded successfully" });
    } catch (error) {
      console.error("Logo upload failed:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unable to upload logo",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearLogo = async (): Promise<void> => {
    try {
      const response = await fetch("/api/upload/logo", { method: "DELETE" });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to remove logo");
      }

      onCleared();
      toast({ title: "Logo removed" });
    } catch (error) {
      console.error("Logo remove failed:", error);
      toast({
        variant: "destructive",
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Unable to remove logo",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-surface-border bg-slate-50 p-4"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="text-center">
          <Upload className="mx-auto h-5 w-5 text-ink-muted" />
          <p className="mt-2 text-sm text-ink-muted">
            Drag and drop logo here, or click to upload
          </p>
          <p className="text-xs text-ink-subtle">PNG, JPG, WEBP, SVG up to 5MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {value ? (
        <div className="rounded-md border border-surface-border p-2">
          <Image
            alt="Business logo"
            className="h-16 w-auto object-contain"
            height={64}
            src={value}
            unoptimized
            width={160}
          />
        </div>
      ) : null}
      {isUploading ? <p className="text-xs text-ink-muted">Uploading...</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          Choose File
        </Button>
        {value ? (
          <Button type="button" variant="ghost" onClick={() => void clearLogo()}>
            Remove Logo
          </Button>
        ) : null}
      </div>
    </div>
  );
}
