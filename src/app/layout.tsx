import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LedgerBloom",
  description: "Mobile-first invoice management for modern teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var key = 'ledgerbloom-theme';
                var stored = localStorage.getItem(key);
                var theme = stored || 'light';
                if (theme === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>
        <SessionProvider>
          <SWRProvider>
            {children}
            <GoogleAnalytics />
            <Toaster />
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
