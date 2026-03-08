import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";

const LAST_UPDATED = "March 8, 2026";

export const metadata: Metadata = {
  title: "Terms of Service | LedgerBloom",
  description: "Legally binding terms governing your use of LedgerBloom.",
};

export default function TermsOfServicePage(): JSX.Element {
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
          <h1 className="mt-4 text-3xl font-semibold text-ink">Terms of Service</h1>
          <p className="mt-2 text-sm text-ink-muted">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-7 pt-6 text-sm leading-7 text-ink-muted">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">1. Acceptance of Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) form a legally binding agreement between you and
              LedgerBloom (&quot;LedgerBloom,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service,
              you agree to these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">2. Eligibility and Accounts</h2>
            <p>
              You represent that you have the legal capacity to enter into contracts. You are
              responsible for maintaining account security, safeguarding credentials, and all activity
              under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">3. Service Use</h2>
            <p>
              You may use the Service to create, manage, and distribute invoices and related business
              records. You agree to provide accurate information and comply with applicable tax,
              accounting, and commercial laws in your jurisdiction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">4. Prohibited Conduct</h2>
            <p>You must not:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use the Service for unlawful, fraudulent, or deceptive activity.</li>
              <li>Interfere with system security, stability, or availability.</li>
              <li>Attempt unauthorized access to accounts, systems, or data.</li>
              <li>Upload malware or harmful code.</li>
              <li>Infringe intellectual property or privacy rights of others.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">5. Customer Data and Responsibility</h2>
            <p>
              You retain ownership of content and data you submit. You grant us a limited license to
              process such data solely to provide and improve the Service. You are responsible for the
              legality, accuracy, and integrity of your submitted content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">6. Intellectual Property</h2>
            <p>
              The Service, including software, branding, content structure, and documentation, is owned
              by LedgerBloom or its licensors and protected by applicable intellectual property laws.
              No rights are granted except as expressly stated in these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">7. Fees and Changes</h2>
            <p>
              If paid features are introduced, pricing and billing terms will be disclosed before
              purchase. We may modify, suspend, or discontinue features at any time where reasonably
              necessary, including for maintenance, security, or legal compliance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">8. Disclaimers</h2>
            <p>
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any
              kind, express or implied, to the fullest extent permitted by law. We do not warrant that
              the Service will be uninterrupted, error-free, or suitable for every legal, tax, or
              accounting use case.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, LedgerBloom will not be liable for indirect,
              incidental, special, consequential, exemplary, or punitive damages, or for loss of data,
              revenue, profits, goodwill, or business opportunities arising from or related to the
              Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless LedgerBloom, its affiliates, and personnel from
              claims, liabilities, damages, and costs arising out of your use of the Service, your
              content, or your breach of these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">11. Termination</h2>
            <p>
              We may suspend or terminate access where necessary for security, legal compliance, abuse
              prevention, or material breach of these Terms. You may stop using the Service at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">12. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the Republic of Uganda, excluding conflict of law
              principles. Any dispute shall be subject to the competent courts of Uganda unless
              otherwise required by applicable mandatory law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">13. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Updated Terms become effective on the
              published date. Continued use of the Service after changes means you accept the revised
              Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink">14. Contact</h2>
            <p>
              For legal questions, contact{" "}
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
