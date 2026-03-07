import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface-muted">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 pb-28 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:duration-300 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
