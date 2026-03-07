# InvoiceFlow

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
- NextAuth (Credentials)
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

4. Run migrations and generate Prisma client:

```bash
pnpm db:migrate
pnpm db:generate
```

5. Start development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/invoice-app"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="InvoiceFlow"
UPLOAD_DIR="./public/uploads"
MAX_UPLOAD_SIZE_MB=5
RESEND_API_KEY=""
EMAIL_FROM="InvoiceFlow <noreply@your-domain.com>"
```

## Email Sending (Free Provider)

Invoice email sending uses Resend API (`/api/invoices/[id]/send`).

1. Create a free Resend account.
2. Verify your sender domain.
3. Add SPF, DKIM, and DMARC DNS records for deliverability.
4. Set:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` (must match verified domain)

Deliverability notes:
- Use a verified domain, not shared/testing sender.
- Keep subject/body consistent and invoice-focused.
- Avoid spammy wording and excessive links.

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

1. Build app:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
```

2. Start app:

```bash
pnpm start
```

3. Put behind Apache or Nginx reverse proxy (HTTPS required).
4. Run `prisma migrate deploy` on release.

## Design Direction

UI direction was refreshed to feel human-designed and trustworthy:
- mobile-first spacing and layout behavior
- stronger visual hierarchy
- modern typography pairing
- fresh brand palette (teal/earth tones, no pink/purple)
- professional invoice presentation inspired by modern fintech and SaaS showcase patterns

## License

Licensed under Apache License 2.0. See [LICENSE](./LICENSE).
