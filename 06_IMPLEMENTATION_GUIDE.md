# 06 — Implementation Guide

## Build Order

The AI agent must follow this order exactly. Do not skip ahead. Each phase must be complete and functional before moving to the next.

---

## Phase 1 — Project Setup

### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest devinvoice \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd devinvoice
```

### 1.2 Install All Dependencies
```bash
# Core dependencies
npm install \
  prisma \
  @prisma/client \
  next-auth@beta \
  bcryptjs \
  @types/bcryptjs \
  react-hook-form \
  @hookform/resolvers \
  zod \
  zustand \
  nanoid \
  date-fns \
  clsx \
  tailwind-merge

# PDF generation
npm install @react-pdf/renderer

# UI components base
npm install @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-popover \
  @radix-ui/react-switch \
  @radix-ui/react-separator \
  @radix-ui/react-avatar \
  @radix-ui/react-label \
  @radix-ui/react-slot \
  class-variance-authority \
  lucide-react

# Optional but recommended
npm install @dnd-kit/core @dnd-kit/sortable  # drag-to-reorder line items
```

### 1.3 Initialize shadcn/ui
```bash
npx shadcn-ui@latest init
# When prompted:
# Style: Default
# Base color: Slate
# CSS variables: Yes
```

### 1.4 Add Required shadcn Components
```bash
npx shadcn-ui@latest add button input label card badge
npx shadcn-ui@latest add dialog sheet tabs select
npx shadcn-ui@latest add toast dropdown-menu popover
npx shadcn-ui@latest add form separator avatar
npx shadcn-ui@latest add table skeleton
```

### 1.5 Initialize Prisma
```bash
npx prisma init
```

### 1.6 Create File Structure
Create all folders listed in `01_ARCHITECTURE.md` folder structure. Create empty placeholder files so imports don't break during development:
```bash
mkdir -p app/{auth}/login app/{auth}/register
mkdir -p "app/(dashboard)/invoices/new" "app/(dashboard)/invoices/[id]/edit"
mkdir -p "app/(dashboard)/clients/[id]"
mkdir -p "app/(dashboard)/{settings,templates}"
mkdir -p app/api/{register,invoices,clients,settings,pdf,upload,dashboard}
mkdir -p "app/api/invoices/[id]" "app/api/clients/[id]" "app/api/pdf/[id]" "app/api/upload/logo"
mkdir -p components/{ui,invoice,pdf/templates,pdf/shared,client,settings,layout}
mkdir -p lib types schemas store hooks
mkdir -p public/uploads public/template-previews
```

### 1.7 Configure Environment
Create `.env` with all required variables (see `00_README.md`).
Create `.env.example` with empty placeholders.

### 1.8 Create `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  // Required for @react-pdf/renderer server-side
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

module.exports = nextConfig;
```

---

## Phase 2 — Database

### 2.1 Write Prisma Schema
Copy full schema from `02_DATABASE_SCHEMA.md` into `prisma/schema.prisma`.

### 2.2 Run Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 2.3 Create Prisma Singleton
Create `lib/prisma.ts` — code in `02_DATABASE_SCHEMA.md`.

### 2.4 Verify Connection
```bash
npx prisma studio
# Should open web UI at localhost:5555 showing all tables
```

---

## Phase 3 — Authentication

### 3.1 Create Auth Config
Create `lib/auth.ts` — code in `04_FRONTEND_SPECIFICATION.md`.

### 3.2 Create NextAuth Route Handler
Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 3.3 Create Register API Route
Create `app/api/register/route.ts` — code in `03_API_SPECIFICATION.md`.

### 3.4 Create Zod Schemas
Create `schemas/settings.schema.ts`:
```typescript
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessCountry: z.string().optional(),
  businessZip: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessWebsite: z.string().url().optional().or(z.literal("")),
  taxId: z.string().optional(),
  currency: z.string().default("UGX"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankBranch: z.string().optional(),
  swiftCode: z.string().optional(),
  paymentNotes: z.string().optional(),
});
```

### 3.5 Create Middleware
Create `middleware.ts` at root — code in `04_FRONTEND_SPECIFICATION.md`.

### 3.6 Create Session Provider
Create `components/providers/SessionProvider.tsx`:
```typescript
"use client";
import { SessionProvider as NextAuthProvider } from "next-auth/react";
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
```

### 3.7 Create Root Layout
Create `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevInvoice",
  description: "Professional invoicing for developers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 3.8 Build Login Page
Create `app/(auth)/login/page.tsx` — centered card layout with email/password form using react-hook-form + zod. On success, call `signIn("credentials", {...})` from next-auth.

### 3.9 Build Register Page
Create `app/(auth)/register/page.tsx` — similar to login with additional fields.

### ✅ Phase 3 Checkpoint
Test: Register a user → Login → Verify redirect to dashboard → Verify `/invoices` returns 401 without session.

---

## Phase 4 — Core Utilities

### 4.1 Create All Utility Files
- `lib/utils.ts` — cn, formatCurrency, formatDate, getStatusColor (code in `04_FRONTEND_SPECIFICATION.md`)
- `lib/calculations.ts` — calculateInvoiceTotals (code in `04_FRONTEND_SPECIFICATION.md`)
- `lib/invoice-number.ts` — generateInvoiceNumber (code in `02_DATABASE_SCHEMA.md`)
- `lib/upload.ts` — file validation helpers

### 4.2 Create TypeScript Types
Create `types/invoice.ts`:
```typescript
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  taxable: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  amount: number;
  status: "pending" | "completed" | "invoiced";
}

export type InvoiceStatus = "DRAFT" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
export type TemplateType = "CLASSIC" | "MODERN" | "MINIMAL" | "MILESTONE" | "RETAINER";
export type BillingType = "HOURLY" | "FIXED" | "RETAINER" | "MILESTONE" | "LICENSE";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  templateType: TemplateType;
  billingType: BillingType;
  issueDate: string;
  dueDate: string;
  billToName: string;
  billToEmail: string;
  billToCompany?: string;
  lineItems: LineItem[];
  milestones?: Milestone[];
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
  primaryColor?: string;
  showLogo: boolean;
  notes?: string;
  footer?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
  projectName?: string;
  projectDescription?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 Create Invoice Zod Schema
Create `schemas/invoice.schema.ts`:
```typescript
import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  taxable: z.boolean().default(true),
});

export const milestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  dueDate: z.string(),
  amount: z.number().min(0),
  status: z.enum(["pending", "completed", "invoiced"]),
});

export const invoiceCreateSchema = z.object({
  clientId: z.string().optional(),
  templateType: z.enum(["CLASSIC", "MODERN", "MINIMAL", "MILESTONE", "RETAINER"]),
  billingType: z.enum(["HOURLY", "FIXED", "RETAINER", "MILESTONE", "LICENSE"]),
  issueDate: z.string(),
  dueDate: z.string(),
  servicePeriodStart: z.string().optional(),
  servicePeriodEnd: z.string().optional(),
  billToName: z.string().min(1, "Client name required"),
  billToEmail: z.string().email("Valid email required"),
  billToCompany: z.string().optional(),
  billToAddress: z.string().optional(),
  billToCity: z.string().optional(),
  billToCountry: z.string().optional(),
  billToTaxId: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
  milestones: z.array(milestoneSchema).optional(),
  currency: z.string().default("UGX"),
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.number().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  taxLabel: z.string().default("VAT"),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  notes: z.string().optional(),
  footer: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentInstructions: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  showLogo: z.boolean().default(true),
});
```

---

## Phase 5 — API Routes

Build all routes following specifications in `03_API_SPECIFICATION.md` in this order:

1. `app/api/invoices/route.ts` — GET list, POST create
2. `app/api/invoices/[id]/route.ts` — GET, PUT, DELETE
3. `app/api/clients/route.ts` — GET list, POST create
4. `app/api/clients/[id]/route.ts` — GET, PUT, DELETE
5. `app/api/settings/route.ts` — GET combined settings
6. `app/api/settings/profile/route.ts` — PUT profile
7. `app/api/settings/invoice/route.ts` — PUT invoice settings
8. `app/api/upload/logo/route.ts` — POST logo upload
9. `app/api/dashboard/stats/route.ts` — GET stats
10. `app/api/pdf/[id]/route.ts` — GET PDF (build last, after templates are done)

### ✅ Phase 5 Checkpoint
Use a REST client (Thunder Client, Insomnia, curl) to test all routes return expected shapes.

---

## Phase 6 — Dashboard Layout

### 6.1 Build Layout Components
1. `components/layout/Sidebar.tsx` — navigation links with lucide-react icons, active state, user menu at bottom
2. `components/layout/TopBar.tsx` — page title, new invoice button, notifications
3. `components/layout/MobileNav.tsx` — bottom tab bar for mobile

### 6.2 Build Dashboard Layout
Create `app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### 6.3 Build Dashboard Home
Create `app/(dashboard)/page.tsx` — fetches from `/api/dashboard/stats`, renders stats cards and recent invoices table.

---

## Phase 7 — Invoice Builder (Core Feature)

This is the largest and most important phase.

### 7.1 Build Zustand Store
Create `store/invoice-builder.store.ts` — full code in `04_FRONTEND_SPECIFICATION.md`.

### 7.2 Build InvoicePreview Component (HTML version)
Create `components/invoice/InvoicePreview.tsx` — HTML/CSS mirror of the CLASSIC template. Start with this before building PDF.

### 7.3 Build LineItemsTable Component
Create `components/invoice/LineItemsTable.tsx`:
- Add/remove rows
- Inline editing (description, qty, unit price)
- Unit selector dropdown
- Auto-calculates amount = qty × price
- Running total display
- Drag-to-reorder using @dnd-kit

### 7.4 Build TemplateSelector Component
5 cards with thumbnail images, radio-style selection, brief description.

### 7.5 Build ClientSection Component
Dropdown of existing clients (fetched from `/api/clients`). When selected, auto-populates BillTo fields. Also has "Create New Client" option that opens an inline mini-form.

### 7.6 Build Full InvoiceBuilder Page
Create `app/(dashboard)/invoices/new/page.tsx`. Assembles all components. Connects to store. Handles form submission to `/api/invoices`.

### 7.7 Build Invoice Edit Page
Create `app/(dashboard)/invoices/[id]/edit/page.tsx`. Load existing invoice, populate store, allow editing, PUT to API.

### ✅ Phase 7 Checkpoint
Create a complete invoice from start to finish. Verify it saves to the database correctly.

---

## Phase 8 — Invoice List & Detail

### 8.1 Invoice List Page
Create `app/(dashboard)/invoices/page.tsx` with FilterBar, InvoiceTable, Pagination.

### 8.2 Invoice Detail Page
Create `app/(dashboard)/invoices/[id]/page.tsx` with preview, payment recording, activity log.

### 8.3 Status Badge Component
Create `components/invoice/StatusBadge.tsx`:
```typescript
import { cn, getStatusColor } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(status))}>
      {status}
    </span>
  );
}
```

---

## Phase 9 — PDF Templates

### 9.1 Build CLASSIC PDF Template
Create `components/pdf/templates/ClassicTemplate.tsx` — full code in `05_INVOICE_TEMPLATES.md`.

### 9.2 Build Shared PDF Components
Create `components/pdf/shared/TotalsBlock.tsx`, `FooterBlock.tsx`, `PaymentBlock.tsx`. Extract repeated sections.

### 9.3 Build PDF Route
Create `app/api/pdf/[id]/route.ts` — code in `03_API_SPECIFICATION.md`.

### 9.4 Test PDF Download
Click "Download PDF" on a saved invoice. Verify the PDF opens correctly.

### 9.5 Build Remaining Templates
In order: MODERN → MINIMAL → MILESTONE → RETAINER

### 9.6 Build usePDFDownload Hook
```typescript
// hooks/usePDFDownload.ts
"use client";

export function usePDFDownload() {
  const downloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/pdf/${invoiceId}`);
      if (!response.ok) throw new Error("PDF generation failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download error:", error);
      throw error;
    }
  };
  return { downloadPDF };
}
```

---

## Phase 10 — Clients & Settings

### 10.1 Client Pages
Build client list and detail pages.

### 10.2 Settings Page
Build `app/(dashboard)/settings/page.tsx` — tabbed layout with all 4 tabs.

### 10.3 Logo Upload
Build `components/settings/LogoUpload.tsx` — drag-and-drop + click to upload, preview, remove.

### 10.4 Color Picker
Use a simple color input (`<input type="color">`) wrapped in a styled component. No external color picker library needed.

---

## Phase 11 — Overdue Detection

Add a cron-job-style mechanism to automatically mark sent invoices as overdue when past due date.

Since there's no external cron service, implement this as a middleware check:

```typescript
// lib/overdue-checker.ts
import { prisma } from "@/lib/prisma";

export async function markOverdueInvoices(userId: string) {
  await prisma.invoice.updateMany({
    where: {
      userId,
      status: "SENT",
      dueDate: { lt: new Date() },
    },
    data: { status: "OVERDUE" },
  });
}
```

Call this at the start of the invoices list page server component.

---

## Phase 12 — Polish & QA

### 12.1 Empty States
Every list page must have a designed empty state when there's no data:
- Icon (lucide-react)
- Headline: "No invoices yet"
- Subtext: "Create your first invoice to get started"
- Primary action button

### 12.2 Loading States
Use shadcn `Skeleton` components for all data-loading states.

### 12.3 Error Boundaries
Add error boundaries around the invoice builder and detail pages.

### 12.4 Toast Notifications
All create/update/delete actions must show a toast on success and failure.

### 12.5 Form Validation Display
All forms must show inline errors from Zod validation under each invalid field.

### 12.6 Mobile Responsiveness
Test at 375px (iPhone SE), 768px (iPad), 1280px (desktop). Fix layout breaks.

### 12.7 Production Build Test
```bash
npm run build
npm start
```
Fix any TypeScript errors or build failures.

---

## Common Pitfalls to Avoid

1. **Importing `@react-pdf/renderer` in client components** — will crash the build. All PDF code is server-only.
2. **Multiple Prisma instances** — always use the singleton from `lib/prisma.ts`.
3. **Missing `"use client"` directive** — add to any component that uses `useState`, `useEffect`, event handlers.
4. **Zustand store not resetting between navigations** — call `reset()` in the invoice builder's `useEffect` cleanup.
5. **Invoice totals out of sync** — always recalculate via `calculateInvoiceTotals()` before saving, never trust client-sent totals for financial data.
6. **Local file uploads breaking on deploy** — remind user that `/public/uploads` must be a persistent volume in production.
7. **Currency formatting** — never use JavaScript's built-in `Intl.NumberFormat` for UGX without testing; always use the custom `formatCurrency` utility.
