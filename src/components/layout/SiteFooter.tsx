"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-surface-border pt-4", className)}>
      <div className="flex flex-col gap-2 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} LedgerBloom. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link className="transition-colors hover:text-ink" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="transition-colors hover:text-ink" href="/terms">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
