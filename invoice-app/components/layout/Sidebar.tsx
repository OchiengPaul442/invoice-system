"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DV";

  const handleLogout = async (): Promise<void> => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-surface-border bg-white md:flex">
      <div className="border-b border-surface-border px-6 py-5">
        <h1 className="text-xl font-bold text-brand-600">Invoice-App</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-muted hover:bg-slate-50 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-surface-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {session?.user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-ink-muted">{session?.user?.email}</p>
          </div>
        </div>
        <button
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-slate-50 hover:text-ink"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
