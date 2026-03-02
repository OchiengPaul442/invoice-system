"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
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

  const matched = Object.keys(titleMap).find((key) =>
    pathname === key || pathname.startsWith(`${key}/`),
  );
  const title = matched ? titleMap[matched] : "Invoice-App";

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/invoices/new">New Invoice</Link>
          </Button>
          <button
            aria-label="Notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-border text-ink-muted transition-colors hover:bg-slate-50 hover:text-ink"
            type="button"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
