"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ClientCard({
  id,
  name,
  email,
  company,
  invoiceCount,
  onDeleted,
}: {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  invoiceCount: number;
  onDeleted?: () => void;
}): JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete client "${name}"? This will deactivate the client.`,
      )
    )
      return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to delete");
      toast({
        title: "Client deleted",
        description: `${name} has been removed.`,
      });
      onDeleted?.();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Could not delete client",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative rounded-md border border-surface-border bg-card transition-colors hover:border-brand-200 hover:bg-brand-50/30 dark:hover:bg-brand-500/10">
      <Link href={`/clients/${id}`} className="block p-4">
        <p className="font-semibold text-ink">{name}</p>
        <p className="text-sm text-ink-muted">{email}</p>
        {company ? <p className="text-sm text-ink-subtle">{company}</p> : null}
        <p className="mt-2 text-xs text-ink-muted">{invoiceCount} invoices</p>
      </Link>
      <button
        type="button"
        disabled={isDeleting}
        onClick={(e) => void handleDelete(e)}
        className="absolute right-3 top-3 rounded-md p-1.5 text-ink-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20"
        title="Delete client"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
