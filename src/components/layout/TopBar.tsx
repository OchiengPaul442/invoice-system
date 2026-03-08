"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/invoices": "Invoices",
  "/clients": "Clients",
  "/templates": "Templates",
  "/settings": "Settings",
};

export function TopBar(): JSX.Element {
  const pathname = usePathname();

  const matched = Object.keys(titleMap).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  const title = matched ? titleMap[matched] : "LedgerBloom";

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-white/90 px-4 py-3 backdrop-blur dark:bg-slate-950/85 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Workspace</p>
          <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="h-9 rounded-xl px-3" size="sm">
            <Link href="/invoices/new">
              <Plus className="h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
