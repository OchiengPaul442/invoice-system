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
  Sparkles,
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
    : "IF";

  const handleLogout = async (): Promise<void> => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-72 shrink-0 flex-col border-r border-surface-border bg-white/90 backdrop-blur md:flex">
      <div className="border-b border-surface-border px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-base font-bold text-ink">InvoiceFlow</p>
            <p className="text-xs text-ink-muted">Billing workspace</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
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
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{session?.user?.name ?? "User"}</p>
            <p className="truncate text-xs text-ink-muted">{session?.user?.email}</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-xl">
            <DialogHeader>
              <DialogTitle>Confirm logout</DialogTitle>
              <DialogDescription>
                You will be signed out of InvoiceFlow on this device.
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
