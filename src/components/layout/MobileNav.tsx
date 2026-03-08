"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Layers, LayoutDashboard, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-border bg-white/95 px-2 pb-1 pt-1 backdrop-blur dark:bg-slate-950/90 md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-muted",
                )}
                href={item.href}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
