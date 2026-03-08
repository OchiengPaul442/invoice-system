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
    <main className="min-h-screen bg-[#eef4f2] dark:bg-slate-950">
      <div className="grid w-full min-h-screen overflow-hidden bg-white dark:bg-slate-950 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            alt="Team reviewing analytics dashboard"
            className="object-cover w-full h-full"
            fill
            priority
            sizes="50vw"
            src="/images/auth-bg.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/35 via-slate-900/55 to-slate-950/80" />
          <div className="absolute p-6 text-white border inset-x-8 bottom-8 border-white/25 bg-slate-950/50 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">
              LedgerBloom
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight">
              {title}
            </h1>
            <p className="mt-3 text-sm text-white/85">{subtitle}</p>
          </div>
        </section>
        <section className="flex items-center justify-center bg-[#f7fbfa] px-4 py-8 dark:bg-slate-950 md:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
