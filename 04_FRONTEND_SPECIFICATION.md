# 04 — Frontend Specification

## Design System

### Colors (Tailwind config)
```typescript
// tailwind.config.ts
colors: {
  brand: {
    50:  "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",
    600: "#2563EB",   // primary
    700: "#1D4ED8",
    900: "#1E3A8A",
  },
  surface: {
    DEFAULT: "#FFFFFF",
    muted:   "#F8FAFC",
    border:  "#E2E8F0",
  },
  ink: {
    DEFAULT: "#0F172A",
    muted:   "#64748B",
    subtle:  "#94A3B8",
  },
  status: {
    draft:   "#94A3B8",
    sent:    "#3B82F6",
    paid:    "#22C55E",
    overdue: "#EF4444",
    partial: "#F59E0B",
    cancelled: "#6B7280",
  }
}
```

### Typography
- Font: `Inter` (Google Fonts — free)
- Import in `app/layout.tsx` using `next/font/google`
- Base size: 14px
- Line height: 1.6

### Spacing Scale
Stick to Tailwind's default 4px base scale. Do not add custom spacing.

---

## Auth Config

**File: `lib/auth.ts`**
```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token) session.user.id = token.id as string;
      return session;
    },
  },
};
```

---

## Middleware

**File: `middleware.ts`** (root level)
```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/(dashboard)/:path*",
    "/api/invoices/:path*",
    "/api/clients/:path*",
    "/api/settings/:path*",
    "/api/pdf/:path*",
    "/api/upload/:path*",
    "/api/dashboard/:path*",
  ],
};
```

---

## Pages

### `/login` — Login Page

**Layout:** Centered card on gradient background
**Components used:** Card, Input, Button, Form (react-hook-form)

**Behavior:**
- Email + password fields
- "Remember me" checkbox (extended session)
- Link to `/register`
- On success → redirect to `/` (dashboard)
- Show inline field errors from Zod validation
- Show server errors as toast notification

---

### `/register` — Register Page

**Layout:** Same as login
**Fields:** Name, Email, Password, Confirm Password
**On success:** Auto-login and redirect to `/settings` (prompt to fill profile first)

---

### `/` — Dashboard

**Layout:** Sidebar left, topbar, main content area

**Components:**
```
DashboardLayout
├── Sidebar
│   ├── Logo/App name
│   ├── NavItems (Dashboard, Invoices, Clients, Templates, Settings)
│   └── UserMenu (name, avatar initials, logout)
├── TopBar
│   ├── Page title
│   ├── "New Invoice" primary button (top-right)
│   └── Notification area (overdue count badge)
└── MainContent
    ├── StatsGrid (4 cards: Total Revenue, Outstanding, Overdue, Draft)
    ├── RecentInvoicesTable (last 5, with status badge, amount, due date)
    └── QuickActions (New Invoice, Add Client, Download Report)
```

**Stats Cards:**
Each card shows: label, value (formatted currency), trend indicator (up/down vs last month)

---

### `/invoices` — Invoice List

**Components:**
```
InvoiceListPage
├── FilterBar
│   ├── SearchInput (debounced, 300ms)
│   ├── StatusFilter (All, Draft, Sent, Paid, Overdue tabs)
│   ├── ClientFilter (dropdown)
│   └── DateRangePicker (optional)
├── InvoiceTable
│   ├── Columns: #, Client, Project, Amount, Status, Due Date, Actions
│   ├── RowActions: View, Edit, Download PDF, Mark Paid, Delete
│   └── EmptyState (when no results)
└── Pagination
```

**Status badge colors:** Match `status` design tokens above.

---

### `/invoices/new` — Invoice Builder

This is the most complex page. Two-panel layout on desktop, stacked on mobile.

**Layout:**
```
InvoiceBuilderPage (full-height, no scroll on outer)
├── LeftPanel (scrollable, ~55% width)
│   ├── BuilderHeader (step indicator or flat form)
│   ├── TemplateSelector (5 cards with preview thumbnails)
│   ├── ClientSection
│   │   ├── ClientDropdown (select existing or "New Client")
│   │   └── BillToForm (auto-fills from selected client)
│   ├── InvoiceMeta
│   │   ├── Invoice # (auto-generated, editable)
│   │   ├── Issue Date, Due Date
│   │   ├── Billing Type selector
│   │   └── Project Name / Description
│   ├── LineItemsSection
│   │   ├── LineItemRow[] (description, qty, unit, price, amount)
│   │   ├── AddLineItemButton
│   │   └── ConditionalMilestoneSection (if MILESTONE type)
│   ├── TotalsSection
│   │   ├── Subtotal
│   │   ├── Discount (toggle: percent or fixed)
│   │   ├── Tax (rate + label)
│   │   └── Total (large, prominent)
│   ├── PaymentSection
│   │   ├── Payment Terms
│   │   └── Payment Instructions textarea
│   ├── NotesSection
│   │   ├── Notes (shown on invoice)
│   │   └── Footer text
│   └── CustomizationSection
│       ├── Color pickers (primary, accent)
│       ├── Logo toggle
│       └── Currency selector
└── RightPanel (sticky, ~45% width, desktop only)
    ├── PreviewToolbar (Zoom in/out, Mobile/Desktop toggle)
    ├── InvoicePreview (live HTML preview matching PDF output)
    └── ActionButtons
        ├── "Save Draft" (secondary)
        ├── "Save & Download PDF" (primary)
        └── "Mark as Sent" (ghost)
```

**Mobile:** Right panel collapses, preview accessible via "Preview" button that opens a bottom sheet.

---

### `/invoices/[id]` — Invoice Detail / View

**Components:**
```
InvoiceDetailPage
├── DetailHeader
│   ├── Invoice number + status badge
│   ├── Actions: Edit, Download PDF, Mark Paid, Send, Delete
│   └── Back to Invoices link
├── InvoicePreviewEmbed (same HTML preview, read-only)
├── PaymentHistorySection
│   ├── PaymentRecord[] (amount, method, date, reference)
│   └── "Record Payment" button (if not fully paid)
├── ActivityLogSection
│   └── ActivityItem[] (created, sent, viewed, paid with timestamps)
└── RecordPaymentModal
    ├── Amount
    ├── Payment method dropdown
    ├── Reference number
    └── Notes
```

---

### `/clients` — Client List

Simple CRUD list with:
- Search bar
- Client cards (name, company, email, invoice count, total billed)
- "New Client" button → slide-over drawer with ClientForm
- Click client → navigate to `/clients/[id]`

---

### `/clients/[id]` — Client Detail

- Client info (editable inline)
- Invoice history for this client (filtered invoice table)
- Total billed amount
- "New Invoice for Client" quick action (pre-fills bill-to data)

---

### `/settings` — Settings

Tabbed layout:

**Tab 1: Business Profile**
- Business name, address, country, phone, email, website
- Tax ID / VAT number
- Currency preference
- Logo upload (drag-and-drop + click to upload)
- Logo preview

**Tab 2: Invoice Defaults**
- Default template selection (visual cards)
- Default payment terms (Net 15, Net 30, Net 60, Due on Receipt, Custom)
- Default tax rate + label
- Invoice prefix (INV, DV, DEV, custom)
- Default footer text

**Tab 3: Payment Details**
- Bank name, account number, branch, SWIFT code
- Mobile money details
- Payment instructions template

**Tab 4: Account**
- Name, email update
- Password change (old + new + confirm)
- Danger zone: Delete account

---

### `/templates` — Template Gallery

Visual grid of all 5 templates with:
- Full-page thumbnail preview
- Template name + description of ideal use case
- "Use Template" button (sets as default)
- "Preview" button (opens full-size preview modal with sample data)

---

## State Management — Invoice Builder

**File: `store/invoice-builder.store.ts`**

```typescript
import { create } from "zustand";
import { LineItem, Milestone } from "@/types/invoice";
import { nanoid } from "nanoid";

interface InvoiceBuilderState {
  // Invoice fields
  templateType: string;
  billingType: string;
  clientId: string | null;
  billTo: BillToData;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  servicePeriodStart: string | null;
  servicePeriodEnd: string | null;
  projectName: string;
  projectDescription: string;
  lineItems: LineItem[];
  milestones: Milestone[];
  currency: string;
  discountType: "percent" | "fixed" | null;
  discountValue: number;
  taxRate: number;
  taxLabel: string;
  notes: string;
  footer: string;
  paymentTerms: string;
  paymentInstructions: string;
  primaryColor: string;
  accentColor: string;
  showLogo: boolean;

  // Computed
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;

  // Actions
  setField: <K extends keyof InvoiceBuilderState>(key: K, value: InvoiceBuilderState[K]) => void;
  addLineItem: () => void;
  updateLineItem: (id: string, field: keyof LineItem, value: any) => void;
  removeLineItem: (id: string) => void;
  reorderLineItems: (from: number, to: number) => void;
  addMilestone: () => void;
  updateMilestone: (id: string, field: keyof Milestone, value: any) => void;
  removeMilestone: (id: string) => void;
  recalculate: () => void;
  reset: () => void;
  loadInvoice: (invoice: any) => void;
}

const defaultLineItem = (): LineItem => ({
  id: nanoid(),
  description: "",
  quantity: 1,
  unit: "item",
  unitPrice: 0,
  amount: 0,
  taxable: true,
});

export const useInvoiceBuilderStore = create<InvoiceBuilderState>((set, get) => ({
  templateType: "CLASSIC",
  billingType: "FIXED",
  clientId: null,
  billTo: { name: "", email: "", company: "", address: "", city: "", country: "" },
  invoiceNumber: "",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  servicePeriodStart: null,
  servicePeriodEnd: null,
  projectName: "",
  projectDescription: "",
  lineItems: [defaultLineItem()],
  milestones: [],
  currency: "UGX",
  discountType: null,
  discountValue: 0,
  taxRate: 0,
  taxLabel: "VAT",
  notes: "",
  footer: "Thank you for your business.",
  paymentTerms: "Net 30",
  paymentInstructions: "",
  primaryColor: "#2563EB",
  accentColor: "#0F172A",
  showLogo: true,
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  total: 0,

  setField: (key, value) => {
    set({ [key]: value } as any);
    get().recalculate();
  },

  addLineItem: () =>
    set((s) => ({ lineItems: [...s.lineItems, defaultLineItem()] })),

  updateLineItem: (id, field, value) => {
    set((s) => ({
      lineItems: s.lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      }),
    }));
    get().recalculate();
  },

  removeLineItem: (id) =>
    set((s) => ({ lineItems: s.lineItems.filter((i) => i.id !== id) })),

  reorderLineItems: (from, to) =>
    set((s) => {
      const items = [...s.lineItems];
      items.splice(to, 0, items.splice(from, 1)[0]);
      return { lineItems: items };
    }),

  addMilestone: () =>
    set((s) => ({
      milestones: [...s.milestones, {
        id: nanoid(), name: "", description: "",
        dueDate: "", amount: 0, status: "pending"
      }],
    })),

  updateMilestone: (id, field, value) =>
    set((s) => ({
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    })),

  removeMilestone: (id) =>
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),

  recalculate: () => {
    const s = get();
    const subtotal = s.lineItems.reduce((sum, item) => sum + item.amount, 0);
    let discountAmount = 0;
    if (s.discountType === "percent") discountAmount = subtotal * (s.discountValue / 100);
    else if (s.discountType === "fixed") discountAmount = s.discountValue;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (s.taxRate / 100);
    const total = taxableAmount + taxAmount;
    set({ subtotal, discountAmount, taxAmount, total });
  },

  reset: () => set({
    lineItems: [defaultLineItem()],
    milestones: [],
    projectName: "",
    notes: "",
    subtotal: 0, discountAmount: 0, taxAmount: 0, total: 0,
  }),

  loadInvoice: (invoice) => set({ ...invoice }),
}));
```

---

## Key Utility Functions

**File: `lib/utils.ts`**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "UGX"): string {
  const symbols: Record<string, string> = {
    UGX: "UGX ", USD: "$", EUR: "€", GBP: "£",
    KES: "KSh ", ZAR: "R ", NGN: "₦", GHS: "GH₵ ",
  };
  const symbol = symbols[currency] || currency + " ";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date, fmt: string = "MMM d, yyyy"): string {
  return format(new Date(date), fmt);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    SENT: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}
```

**File: `lib/calculations.ts`**
```typescript
export function calculateInvoiceTotals(
  lineItems: any[],
  taxRate: number,
  discountType?: string | null,
  discountValue?: number
) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  let discountAmount = 0;
  if (discountType === "percent" && discountValue) discountAmount = subtotal * (discountValue / 100);
  else if (discountType === "fixed" && discountValue) discountAmount = discountValue;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;
  const balanceDue = total;
  return { subtotal, discountAmount, taxAmount, total, balanceDue };
}
```
