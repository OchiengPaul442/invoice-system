# DevInvoice — Developer Invoicing System
## Complete Build Documentation for AI Agent Execution

---

## Project Overview

DevInvoice is a self-hosted, full-stack web application designed specifically for solo developers and small dev teams to generate, manage, and export professional invoices. It supports multiple invoice templates tailored to common developer billing scenarios (hourly, project-based, retainer, milestone, SaaS licensing) with full PDF export using open-source tooling.

---

## Documentation Index

| File | Purpose |
|------|---------|
| `00_README.md` | This file — project overview, setup, navigation |
| `01_ARCHITECTURE.md` | System design, tech stack decisions, folder structure |
| `02_DATABASE_SCHEMA.md` | Full PostgreSQL schema with Prisma ORM definitions |
| `03_API_SPECIFICATION.md` | All backend API routes — request/response contracts |
| `04_FRONTEND_SPECIFICATION.md` | Page-by-page UI specs, component hierarchy, state |
| `05_INVOICE_TEMPLATES.md` | All invoice template definitions and field schemas |
| `06_IMPLEMENTATION_GUIDE.md` | Step-by-step build order for the AI agent |
| `07_DEPENDENCIES.md` | Complete dependency list — all free and open source |

---

## Core Requirements

- **Solo developer** primary user — fast invoice creation is the priority
- **Highly customizable** invoices: logo toggle, color scheme, layout selection
- **Multiple developer-specific templates**: hourly, fixed project, retainer, milestone, SaaS license
- **PDF export** — professional, print-ready output using open-source libraries
- **Account-based** — invoices saved per user account, retrievable and editable
- **Self-hostable** — runs on any VPS, no paid SaaS dependencies
- **All free, open-source dependencies** — zero licensing costs

---

## Quick Start (Post-Build)

```bash
# 1. Clone and install
git clone <repo>
cd devinvoice
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Set up database
npx prisma migrate dev --name init
npx prisma generate

# 4. Run development server
npm run dev

# 5. Production build
npm run build
npm start
```

---

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devinvoice"

# Auth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="DevInvoice"

# File Uploads (local storage path)
UPLOAD_DIR="./public/uploads"
MAX_UPLOAD_SIZE_MB=5
```

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | latest |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 5.x |
| Auth | NextAuth.js | 5.x (beta) |
| PDF Generation | @react-pdf/renderer | 3.x |
| Form Handling | React Hook Form + Zod | latest |
| State | Zustand | 4.x |
| Date Handling | date-fns | 3.x |
| ID Generation | nanoid | 5.x |

All free and open source. No paid services.

---

## Project Principles for the AI Agent

1. **Do not skip error handling.** Every API route must have try/catch with proper HTTP status codes.
2. **Type everything.** No `any` types in TypeScript. All interfaces defined in `/types`.
3. **Validate all inputs.** Every form and API endpoint uses Zod schemas.
4. **No inline styles.** Tailwind utility classes only, except inside `@react-pdf/renderer` components which require inline styles.
5. **Server Components by default.** Only add `"use client"` where interactivity is required.
6. **Prisma for all DB access.** No raw SQL unless absolutely necessary.
7. **Mobile-responsive.** All pages must work on screens 375px and wider.
8. **One feature at a time.** Follow the build order in `06_IMPLEMENTATION_GUIDE.md` strictly.
