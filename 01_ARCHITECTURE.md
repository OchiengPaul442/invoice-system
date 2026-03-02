# 01 — System Architecture

## Architecture Pattern

DevInvoice uses a **monolithic Next.js 14 App Router** architecture with server-side rendering, server actions, and RESTful API routes. This is intentional for a solo developer tool — minimal infrastructure overhead, single deployment unit, zero microservice complexity.

```
Client (Browser)
     │
     ▼
Next.js App (Single Process)
├── App Router (RSC + Client Components)
├── API Routes (/api/*)
├── Server Actions (form submissions)
│
     │
     ▼
Prisma ORM
     │
     ▼
PostgreSQL Database
     │
Local File System (logo uploads → /public/uploads)
```

---

## Why This Stack

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Full-stack in one repo, server components reduce client JS, API routes for client-side PDF generation |
| Prisma over raw SQL | Type-safe queries, migration management, readable schema |
| NextAuth.js | Battle-tested auth, supports credentials + future OAuth providers, free |
| @react-pdf/renderer | Declarative React-based PDF generation, runs server-side, no browser dependency, free |
| shadcn/ui | Component ownership (copied into project, not a dependency), highly customizable, Tailwind-native |
| Zustand | Minimal state management for invoice builder, no boilerplate |
| Local file storage | No S3 costs, logos are small files, self-hosted keeps everything in one place |

---

## Folder Structure

The AI agent must create this exact folder structure.

```
devinvoice/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group — auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/              # Route group — protected pages
│   │   ├── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   ├── page.tsx              # Dashboard home (stats + recent invoices)
│   │   ├── invoices/
│   │   │   ├── page.tsx          # Invoice list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Invoice builder
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Invoice detail/view
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edit existing invoice
│   │   ├── clients/
│   │   │   ├── page.tsx          # Client list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Client detail
│   │   ├── settings/
│   │   │   └── page.tsx          # User + business settings
│   │   └── templates/
│   │       └── page.tsx          # Template gallery/selector
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── invoices/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE by ID
│   │   ├── clients/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── pdf/
│   │   │   └── [id]/
│   │   │       └── route.ts      # Generate and stream PDF
│   │   ├── upload/
│   │   │   └── route.ts          # Logo file upload
│   │   └── settings/
│   │       └── route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css
│
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── invoice/
│   │   ├── InvoiceBuilder.tsx    # Main invoice creation form
│   │   ├── InvoicePreview.tsx    # Live preview pane
│   │   ├── LineItemsTable.tsx    # Dynamic line items
│   │   ├── InvoiceCard.tsx       # List item card
│   │   └── StatusBadge.tsx       # Invoice status indicator
│   ├── pdf/
│   │   ├── templates/
│   │   │   ├── ClassicTemplate.tsx
│   │   │   ├── ModernTemplate.tsx
│   │   │   ├── MinimalTemplate.tsx
│   │   │   ├── MilestoneTemplate.tsx
│   │   │   └── RetainerTemplate.tsx
│   │   └── PDFDocument.tsx       # Template switcher wrapper
│   ├── client/
│   │   ├── ClientForm.tsx
│   │   └── ClientCard.tsx
│   ├── settings/
│   │   ├── BusinessForm.tsx
│   │   ├── LogoUpload.tsx
│   │   └── BrandingSettings.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       └── MobileNav.tsx
│
├── lib/                          # Utility functions and configs
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── pdf.ts                    # PDF generation utilities
│   ├── invoice-number.ts         # Invoice number generation logic
│   ├── calculations.ts           # Tax, totals, discount calculations
│   ├── upload.ts                 # File upload handler
│   └── utils.ts                  # General utilities (cn, formatCurrency, etc.)
│
├── types/                        # TypeScript type definitions
│   ├── invoice.ts
│   ├── client.ts
│   ├── user.ts
│   └── api.ts
│
├── schemas/                      # Zod validation schemas
│   ├── invoice.schema.ts
│   ├── client.schema.ts
│   └── settings.schema.ts
│
├── store/                        # Zustand state stores
│   └── invoice-builder.store.ts  # Invoice builder state
│
├── hooks/                        # Custom React hooks
│   ├── useInvoices.ts
│   ├── useClients.ts
│   └── usePDFDownload.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   └── uploads/                  # Local logo storage
│
├── .env
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Data Flow — Invoice Creation

```
User fills InvoiceBuilder form
         │
         ▼
Zustand store (invoice-builder.store.ts)
updates in real time
         │
         ├──► InvoicePreview component reads store
         │    renders live preview (HTML/CSS)
         │
         ▼
User clicks "Save Invoice"
         │
         ▼
API POST /api/invoices
         │
         ▼
Zod validation → Prisma create → PostgreSQL
         │
         ▼
Return invoice ID
         │
         ▼
User clicks "Download PDF"
         │
         ▼
API GET /api/pdf/[id]
         │
         ▼
Server fetches invoice from DB
         │
         ▼
@react-pdf/renderer renders template
         │
         ▼
PDF streamed as binary response
         │
         ▼
Browser triggers file download
```

---

## Authentication Flow

```
Register → Bcrypt hash password → Store in DB
Login → Verify password → Create NextAuth session (JWT)
Session stored in HTTP-only cookie
Protected routes check session via middleware.ts
API routes verify session via getServerSession()
```

---

## Key Architectural Constraints

1. **PDF generation runs server-side only.** `@react-pdf/renderer` must never be imported in client components. Keep all PDF code in `/api/pdf/` and `/components/pdf/`.
2. **File uploads stored locally.** Logo files go to `/public/uploads/{userId}/logo.{ext}`. Max 5MB. Accepted: jpg, png, webp, svg.
3. **Invoice numbers are user-scoped.** Format: `INV-{YEAR}-{SEQUENCE}` e.g. `INV-2025-0042`. Sequence resets per year per user.
4. **Middleware protects all dashboard routes.** `middleware.ts` at root level intercepts all `/(dashboard)` routes and redirects unauthenticated users to `/login`.
5. **No external API calls.** Everything runs locally. No Stripe, no SendGrid, no S3. Pure self-hosted.
