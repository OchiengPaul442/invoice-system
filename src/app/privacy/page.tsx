import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";

const LAST_UPDATED = "March 8, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | LedgerBloom",
  description: "How LedgerBloom collects, uses, stores, and protects personal data.",
};

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-surface-muted px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-surface-border bg-white p-6 shadow-sm dark:bg-slate-950/80 md:p-8">
        <header className="border-b border-surface-border pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">LedgerBloom Legal</p>
            <div className="flex items-center gap-2">
              <Link className="text-sm font-medium text-brand-700 hover:underline" href="/">
                Back to Dashboard
              </Link>
              <Link className="text-sm text-ink-muted hover:text-ink" href="/login">
                Sign In
              </Link>
              <Link className="text-sm text-ink-muted hover:text-ink" href="/register">
                Create Account
              </Link>
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-ink">Privacy Policy</h1>
          <p className="mt-2 text-sm text-ink-muted">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-7 pt-6 text-sm leading-7 text-ink-muted">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">1. Scope</h2>
            <p>
              This Privacy Policy explains how LedgerBloom (&quot;LedgerBloom,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              collects, uses, discloses, and safeguards information when you use our website, dashboard,
              APIs, and related services (collectively, the &quot;Service&quot;). By using the Service, you
              acknowledge this Privacy Policy as part of your legally binding agreement with us.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">2. Information We Collect</h2>
            <p>We may collect and process the following categories of data:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Account data, such as your name, email address, and authentication credentials.</li>
              <li>Business and invoice data you create, including client details and invoice content.</li>
              <li>Payment and transaction metadata associated with invoice records.</li>
              <li>Technical data, such as device details, IP address, browser type, and log data.</li>
              <li>Usage analytics data, including page views and product interaction events.</li>
              <li>Support and feedback communications submitted through the Service.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">3. How We Use Information</h2>
            <p>We process personal data where necessary to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide, maintain, and secure the Service.</li>
              <li>Create and deliver invoices and related communications.</li>
              <li>Authenticate accounts and prevent fraud or abuse.</li>
              <li>Improve product experience, performance, and reliability.</li>
              <li>Comply with legal and regulatory obligations.</li>
              <li>Communicate service updates, policy changes, and support responses.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">4. Legal Bases for Processing</h2>
            <p>
              We process data based on one or more of the following legal grounds, as applicable:
              contractual necessity, legitimate interests, legal compliance, and your consent (where
              required by law).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">5. Data Sharing</h2>
            <p>
              We may share information with service providers that support hosting, authentication,
              file storage, analytics, communications, and infrastructure operations. We may also
              disclose information where required by law, lawful request, or to protect rights, users,
              and platform integrity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">6. International Transfers</h2>
            <p>
              Your data may be processed in jurisdictions outside your country of residence. Where
              required, we use reasonable safeguards and contractual protections for cross-border data
              transfers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">7. Data Retention</h2>
            <p>
              We retain personal data for as long as needed to provide the Service, satisfy legal and
              accounting requirements, resolve disputes, and enforce agreements. Retention periods vary
              by data category and lawful purpose.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">8. Security</h2>
            <p>
              We implement commercially reasonable technical and organizational safeguards designed to
              protect personal data. No method of transmission or storage is completely secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">9. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights to access, correct, delete, restrict,
              or object to processing of personal data, and to request data portability. You may also
              withdraw consent where processing is based on consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">10. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under 18. We do not knowingly collect personal
              data from children under 18. If you believe such data has been provided, contact us so we
              can take appropriate action.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">11. Policy Changes</h2>
            <p>
              We may revise this Privacy Policy from time to time. Updated versions become effective on
              the posted date. Continued use of the Service after updates constitutes acceptance of the
              revised policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">12. Contact</h2>
            <p>
              For privacy requests or concerns, contact us at{" "}
              <a className="text-brand-700 hover:underline" href="mailto:legal@ledgerbloom.app">
                legal@ledgerbloom.app
              </a>
              .
            </p>
          </section>
        </div>

        <SiteFooter className="mt-10" />
      </div>
    </main>
  );
}
