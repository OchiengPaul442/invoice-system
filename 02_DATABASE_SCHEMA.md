# 02 — Database Schema

## Overview

All data is stored in PostgreSQL accessed via Prisma ORM. The schema is designed for a multi-user self-hosted system (one account per developer, with potential for team expansion later).

---

## Full Prisma Schema

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USER & AUTH ────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  name          String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  profile       UserProfile?
  invoices      Invoice[]
  clients       Client[]
  invoiceSettings InvoiceSettings?

  @@map("users")
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Business identity
  businessName    String?
  businessAddress String?
  businessCity    String?
  businessState   String?
  businessCountry String   @default("Uganda")
  businessZip     String?
  businessPhone   String?
  businessEmail   String?
  businessWebsite String?
  taxId           String?  // VAT/TIN/EIN etc
  currency        String   @default("UGX")

  // Branding
  logoPath        String?  // relative path: /uploads/{userId}/logo.png
  primaryColor    String   @default("#2563EB")  // hex color
  accentColor     String   @default("#0F172A")  // hex color

  // Banking
  bankName        String?
  bankAccount     String?
  bankBranch      String?
  swiftCode       String?
  paymentNotes    String?  // "Pay within 30 days via Mobile Money"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("user_profiles")
}

model InvoiceSettings {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  defaultTemplate     TemplateType @default(CLASSIC)
  defaultPaymentTerms Int          @default(30)   // days
  defaultTaxRate      Decimal      @default(0) @db.Decimal(5, 2)
  defaultTaxLabel     String       @default("VAT")
  defaultCurrency     String       @default("UGX")
  invoicePrefix       String       @default("INV")
  currentSequence     Int          @default(0)    // increments per invoice
  currentYear         Int          @default(2025)

  // Footer text shown on all invoices
  defaultFooter       String?

  // Auto-send copy to yourself
  sendCopyToSelf      Boolean  @default(false)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@map("invoice_settings")
}

// ─── CLIENTS ────────────────────────────────────────────────────

model Client {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Identity
  name            String
  email           String
  company         String?
  phone           String?
  website         String?

  // Address
  address         String?
  city            String?
  state           String?
  country         String?
  zipCode         String?

  // Billing preferences
  defaultCurrency String?
  taxId           String?  // Client's tax number (for B2B invoices)
  notes           String?  // Internal notes about this client

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  invoices        Invoice[]

  @@map("clients")
}

// ─── INVOICES ───────────────────────────────────────────────────

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

enum TemplateType {
  CLASSIC      // Traditional professional layout
  MODERN       // Clean two-column modern
  MINIMAL      // Ultra-minimal, just the facts
  MILESTONE    // Project with milestone breakdown
  RETAINER     // Monthly retainer with period
}

enum BillingType {
  HOURLY
  FIXED
  RETAINER
  MILESTONE
  LICENSE     // Software license
}

model Invoice {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  clientId        String?
  client          Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)

  // Invoice identity
  invoiceNumber   String        // e.g. INV-2025-0042
  status          InvoiceStatus @default(DRAFT)
  templateType    TemplateType  @default(CLASSIC)
  billingType     BillingType   @default(FIXED)

  // Dates
  issueDate       DateTime      @default(now())
  dueDate         DateTime
  servicePeriodStart DateTime?  // For retainer invoices
  servicePeriodEnd   DateTime?  // For retainer invoices

  // Client info snapshot (in case client is deleted later)
  billToName      String
  billToEmail     String
  billToCompany   String?
  billToAddress   String?
  billToCity      String?
  billToCountry   String?
  billToTaxId     String?

  // Line items stored as JSON
  lineItems       Json          // LineItem[]
  milestones      Json?         // Milestone[] — for MILESTONE type only

  // Financials
  currency        String        @default("UGX")
  subtotal        Decimal       @db.Decimal(15, 2)
  discountType    String?       // "percent" | "fixed"
  discountValue   Decimal?      @db.Decimal(15, 2)
  discountAmount  Decimal?      @db.Decimal(15, 2)  // computed
  taxLabel        String        @default("VAT")
  taxRate         Decimal       @default(0) @db.Decimal(5, 2)
  taxAmount       Decimal       @db.Decimal(15, 2)
  total           Decimal       @db.Decimal(15, 2)
  amountPaid      Decimal       @default(0) @db.Decimal(15, 2)
  balanceDue      Decimal       @db.Decimal(15, 2)

  // Customization overrides (user can change per-invoice)
  primaryColor    String?
  accentColor     String?
  showLogo        Boolean       @default(true)
  showSignature   Boolean       @default(false)

  // Content
  projectName     String?
  projectDescription String?
  notes           String?       // Shown on invoice (e.g. "Bank transfer preferred")
  footer          String?       // Bottom of invoice (e.g. "Thank you for your business")
  paymentTerms    String?       // e.g. "Net 30" or custom text
  paymentInstructions String?

  // Metadata
  viewedAt        DateTime?
  paidAt          DateTime?
  sentAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  payments        Payment[]
  activityLog     InvoiceActivity[]

  @@unique([userId, invoiceNumber])
  @@index([userId, status])
  @@index([userId, clientId])
  @@index([userId, createdAt])
  @@map("invoices")
}

model Payment {
  id            String   @id @default(cuid())
  invoiceId     String
  invoice       Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  amount        Decimal  @db.Decimal(15, 2)
  method        String   // "bank_transfer" | "mobile_money" | "cash" | "crypto" | "other"
  reference     String?  // Transaction reference number
  notes         String?
  paidAt        DateTime @default(now())
  createdAt     DateTime @default(now())

  @@map("payments")
}

model InvoiceActivity {
  id          String   @id @default(cuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  action      String   // "created" | "updated" | "sent" | "viewed" | "paid" | "cancelled"
  note        String?
  createdAt   DateTime @default(now())

  @@index([invoiceId])
  @@map("invoice_activities")
}
```

---

## JSON Field Schemas

These JSON fields must conform to these TypeScript interfaces. Validate before storing.

### `lineItems` (all invoice types)

```typescript
// types/invoice.ts

export interface LineItem {
  id: string;           // nanoid()
  description: string;  // "React frontend development"
  quantity: number;     // 1, 5, 40 (hours)
  unit: string;         // "hr", "day", "item", "month", "license"
  unitPrice: number;    // Price per unit
  amount: number;       // quantity * unitPrice (computed)
  taxable: boolean;     // Include in tax calculation
}
```

### `milestones` (MILESTONE invoice type only)

```typescript
export interface Milestone {
  id: string;
  name: string;         // "Phase 1 — Discovery & Planning"
  description: string;
  dueDate: string;      // ISO date string
  amount: number;
  status: "pending" | "completed" | "invoiced";
}
```

---

## Currency Support

The `currency` field stores ISO 4217 codes. Common values for target markets:

```typescript
export const SUPPORTED_CURRENCIES = [
  { code: "UGX", symbol: "UGX", name: "Ugandan Shilling" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "USD", symbol: "$",   name: "US Dollar" },
  { code: "EUR", symbol: "€",   name: "Euro" },
  { code: "GBP", symbol: "£",   name: "British Pound" },
  { code: "ZAR", symbol: "R",   name: "South African Rand" },
  { code: "NGN", symbol: "₦",   name: "Nigerian Naira" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
];
```

---

## Migrations

After schema is defined, run:

```bash
# Create and apply migration
npx prisma migrate dev --name init

# After any schema change
npx prisma migrate dev --name <description>

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

---

## Database Indexes Explained

| Index | Purpose |
|-------|---------|
| `invoices(userId, status)` | Dashboard filtering by status per user |
| `invoices(userId, clientId)` | Client invoice history |
| `invoices(userId, createdAt)` | Chronological listing |
| `invoices(userId, invoiceNumber)` | Unique constraint + lookup |
| `invoice_activities(invoiceId)` | Activity log fetch per invoice |

---

## Prisma Client Singleton

**File: `lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

This prevents multiple Prisma client instances in Next.js development hot-reload.

---

## Invoice Number Generation Logic

**File: `lib/invoice-number.ts`**

```typescript
import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Use a transaction to safely increment sequence
  const result = await prisma.$transaction(async (tx) => {
    const settings = await tx.invoiceSettings.upsert({
      where: { userId },
      update: {
        currentSequence: {
          increment: currentYear === (await tx.invoiceSettings.findUnique({
            where: { userId },
            select: { currentYear: true }
          }))?.currentYear ? 1 : 1
        },
        currentYear: currentYear,
      },
      create: {
        userId,
        currentSequence: 1,
        currentYear: currentYear,
      },
    });

    // Reset sequence if year changed
    if (settings.currentYear !== currentYear) {
      const reset = await tx.invoiceSettings.update({
        where: { userId },
        data: { currentSequence: 1, currentYear },
      });
      return reset;
    }
    return settings;
  });

  const prefix = result.invoicePrefix || "INV";
  const seq = String(result.currentSequence).padStart(4, "0");
  return `${prefix}-${currentYear}-${seq}`;
}
```
