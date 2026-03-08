"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "ledgerbloom.sidebar.collapsed";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (storedValue === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore storage read errors.
    }
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "IF";

  const handleLogout = async (): Promise<void> => {
    trackEvent("user_logout", { location: "sidebar" });
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const toggleCollapsed = (): void => {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage write errors.
      }
      trackEvent("sidebar_toggled", { collapsed: next });
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-r border-surface-border bg-white/90 backdrop-blur transition-[width] duration-200 dark:bg-slate-950/85 md:flex",
        isCollapsed ? "w-[88px]" : "w-72",
      )}
    >
      <div className={cn("border-b border-surface-border py-5", isCollapsed ? "px-3" : "px-6")}>
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className={cn("inline-flex min-w-0 items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
              <Image
                src="/LOGO.png"
                alt="LedgerBloom logo"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {!isCollapsed ? (
              <div>
                <p className="text-base font-bold text-ink">LedgerBloom</p>
                <p className="text-xs text-ink-muted">Billing workspace</p>
              </div>
            ) : null}
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 shrink-0", isCollapsed ? "hidden" : "inline-flex")}
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {isCollapsed ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-3 h-8 w-8 self-center"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isCollapsed && "justify-center px-2",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-emerald-100"
                  : "text-ink-muted hover:bg-slate-50 hover:text-ink dark:hover:bg-slate-900/80 dark:hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-3">
        <div
          className={cn(
            "mb-3 flex items-center rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900/90",
            isCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <div className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {initials}
            </div>
          </div>
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{session?.user?.name ?? "User"}</p>
              <p className="truncate text-xs text-ink-muted">{session?.user?.email}</p>
            </div>
          ) : null}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className={cn("w-full", isCollapsed ? "justify-center px-2" : "justify-start")} variant="outline">
              <LogOut className="h-4 w-4" />
              {!isCollapsed ? "Logout" : null}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-xl">
            <DialogHeader>
              <DialogTitle>Confirm logout</DialogTitle>
              <DialogDescription>
                You will be signed out of LedgerBloom on this device.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={() => void handleLogout()} type="button">
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
