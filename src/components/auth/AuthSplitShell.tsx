"use client";

import Image from "next/image";

export function AuthSplitShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}): JSX.Element {
  return (
    <main className="min-h-screen bg-[#eceff1] p-3 dark:bg-slate-950 md:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] w-full overflow-hidden rounded-xl border border-surface-border bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)] dark:bg-slate-950 md:min-h-[calc(100vh-2rem)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            alt="Team reviewing analytics dashboard"
            className="h-full w-full object-cover"
            fill
            priority
            sizes="50vw"
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/45 to-slate-950/75" />
          <div className="absolute inset-x-8 bottom-8 rounded-lg border border-white/25 bg-slate-950/45 p-6 text-white backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">LedgerBloom</p>
            <h1 className="mt-2 text-5xl font-semibold leading-[0.95]">{title}</h1>
            <p className="mt-4 text-sm text-white/85">{subtitle}</p>
          </div>
        </section>
        <section className="flex items-center justify-center bg-[#f8fafb] px-4 py-8 dark:bg-slate-950 md:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
