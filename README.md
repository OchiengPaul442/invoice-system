# LedgerBloom

Mobile-first invoice management built with Next.js, Prisma, PostgreSQL, and NextAuth.

## What Was Improved

- Fixed the `Maximum update depth exceeded` crash when creating invoices.
- Refactored invoice template flow so selecting and applying templates works correctly.
- Added a **Custom Template Studio** so users can design and save their own invoice styles.
- Removed low-value Settings tabs and consolidated useful payment fields in Business Profile.
- Added loading skeletons for data-heavy pages.
- Added logout confirmation dialog.
- Added production email sending endpoint for invoices using the free Resend tier.
- Rebranded UI with a modern non-blue primary palette and improved responsive layout.
- Cleaned unused files and legacy scaffolding.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- NextAuth (Credentials + Google/GitHub OAuth)
- Tailwind CSS + Radix UI
- React PDF renderer

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Set required env values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

4. Sync schema and generate Prisma client:

```bash
pnpm exec prisma db push
pnpm db:generate
```

5. Start development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ledgerbloom"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="LedgerBloom"
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
MAX_UPLOAD_SIZE_MB=5
EMAIL_FROM="LedgerBloom <noreply@your-domain.com>"
FEEDBACK_RECEIVER_EMAIL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
REMINDERS_CRON_SECRET=""
RESEND_API_KEY=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE="false"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_FOLDER="invoiceflow/invoices"
EXCHANGE_RATES_API_URL="https://open.er-api.com/v6/latest/USD"
```

## Email Sending (Free Provider)

Invoice email sending (`/api/invoices/[id]/send`) now supports:

- `RESEND_API_KEY` (Resend free tier), or
- SMTP via Nodemailer (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) for providers like Zoho/Mailgun/Gmail SMTP.

You only need one provider path configured.

### If using Resend

1. Create a free account at Resend.
2. Generate API key from dashboard.
3. Verify sender domain.
4. Set `RESEND_API_KEY` and `EMAIL_FROM`.

### If using SMTP (Nodemailer)

1. Use your SMTP credentials from your mail provider.
2. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`.
3. Set `EMAIL_FROM`.

Deliverability notes:
- Use a verified domain, not shared/testing sender.
- Keep subject/body consistent and invoice-focused.
- Avoid spammy wording and excessive links.

Invoice emails include:
- attached PDF invoice
- secure external view link (no app account required)

## OAuth Sign-In

Social authentication is enabled when provider env vars are set:

- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- GitHub: `GITHUB_ID`, `GITHUB_SECRET`

Without these vars, only email/password login is shown.
Linked providers can be managed in `Settings -> Linked Accounts`.

## Linked Accounts Security

- OAuth links are tracked in `user_oauth_connections`.
- Google sign-in requires verified email from the provider.
- Provider account ID is pinned to one LedgerBloom user to prevent cross-account linking.
- Use the same email on LedgerBloom and OAuth provider for best security.

## In-App Feedback

- Users can submit issues and enhancement requests in `Settings -> Feedback`.
- Feedback is stored in the `feedback` table.
- Optional notifications can be sent to `FEEDBACK_RECEIVER_EMAIL`.

## Automatic Due/Overdue Reminders

Run `POST /api/reminders/due` from a scheduler (for example every morning) with header:

- `x-reminder-secret: <REMINDERS_CRON_SECRET>`

The endpoint sends:
- due-soon reminders (up to 2 days before due date)
- overdue reminders (once per day per invoice state)

## Cloudinary Invoice PDF Storage

On invoice create/update, PDF snapshots are generated and uploaded to Cloudinary (raw files) when Cloudinary env vars are set.

Required vars:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (optional, defaults to `invoiceflow/invoices`)

Database fields used:
- `Invoice.pdfUrl`
- `Invoice.pdfPublicId`

After schema changes, run:

```bash
pnpm db:generate
pnpm exec prisma db push
```

## Multi-Currency Dashboard Conversion

Dashboard totals are converted to the user preferred currency using live exchange rates from a free endpoint (`open.er-api.com` by default).

If conversion API is unavailable, the dashboard falls back gracefully and shows a note.

## Template Workflow

### Built-in Templates

- Classic Ledger
- Modern Studio
- Minimal Mono
- Milestone Matrix
- Retainer Pulse

### Custom Template Studio

Users can:
- choose a base layout
- choose primary and accent colors
- save reusable presets locally
- launch invoice creation with one click using a custom preset
- set custom presets as default (template + brand colors)

## Scripts

- `pnpm dev` - run locally
- `pnpm build` - production build
- `pnpm start` - start production server
- `pnpm lint` - lint and type checks through Next.js lint pipeline
- `pnpm db:migrate` - run Prisma migration
- `pnpm db:generate` - generate Prisma client
- `pnpm db:studio` - open Prisma Studio
- `pnpm db:reset` - reset database

## Deploy

### Option A: Vercel

1. Push repository to GitHub/GitLab.
2. Import project into Vercel.
3. Add all env variables.
4. Ensure Postgres is reachable from Vercel.
5. Run migrations before first production traffic.

### Option B: VPS / Docker Host

1. Build image:

```bash
docker build -t ledgerbloom:latest .
```

2. Run container:

```bash
docker run --env-file .env.local -p 3000:3000 ledgerbloom:latest
```

3. Put behind Apache or Nginx reverse proxy (HTTPS required).
4. Run `pnpm exec prisma db push` (or your migration workflow) on release.

## Design Direction

UI direction was refreshed to feel human-designed and trustworthy:
- mobile-first spacing and layout behavior
- stronger visual hierarchy
- modern typography pairing
- fresh brand palette (teal/earth tones, no pink/purple)
- professional invoice presentation inspired by modern fintech and SaaS showcase patterns

## License

Licensed under Apache License 2.0. See [LICENSE](./LICENSE).
