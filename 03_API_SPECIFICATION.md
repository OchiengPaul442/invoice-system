# 03 — API Specification

## Conventions

- All API routes are under `/api/`
- All responses return JSON (except the PDF route which streams binary)
- All protected routes require a valid NextAuth session
- All request bodies are validated with Zod before processing
- Error responses follow a consistent format:

```typescript
// Success
{ success: true, data: <payload> }

// Error
{ success: false, error: string, details?: ZodError[] }
```

---

## Authentication Routes

### `POST /api/auth/[...nextauth]`
Handled entirely by NextAuth.js. Supports:
- `POST /api/auth/signin` — credential login
- `POST /api/auth/signout` — logout
- `GET /api/auth/session` — current session
- `GET /api/auth/csrf` — CSRF token

### `POST /api/register`
Create a new user account.

**Request Body:**
```typescript
{
  name: string;           // min 2 chars
  email: string;          // valid email
  password: string;       // min 8 chars
  confirmPassword: string;// must match password
}
```

**Response `201`:**
```typescript
{
  success: true,
  data: {
    id: string;
    email: string;
    name: string;
  }
}
```

**Errors:** `400` validation failure, `409` email already registered

**Implementation: `app/api/register/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/settings.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation failed", details: parsed.error.errors }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true },
    });

    // Create default profile and settings
    await prisma.userProfile.create({ data: { userId: user.id } });
    await prisma.invoiceSettings.create({ data: { userId: user.id } });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
```

---

## Invoice Routes

### `GET /api/invoices`
List all invoices for the authenticated user.

**Query Parameters:**
```
status?    = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
clientId?  = string
search?    = string (searches invoiceNumber, billToName, projectName)
page?      = number (default: 1)
limit?     = number (default: 20, max: 100)
sortBy?    = "createdAt" | "dueDate" | "total" | "invoiceNumber"
sortOrder? = "asc" | "desc" (default: "desc")
```

**Response `200`:**
```typescript
{
  success: true,
  data: {
    invoices: Invoice[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
    }
  }
}
```

### `POST /api/invoices`
Create a new invoice.

**Request Body:** (see Invoice Create Schema in `schemas/invoice.schema.ts`)
```typescript
{
  clientId?: string;
  templateType: "CLASSIC" | "MODERN" | "MINIMAL" | "MILESTONE" | "RETAINER";
  billingType: "HOURLY" | "FIXED" | "RETAINER" | "MILESTONE" | "LICENSE";
  issueDate: string;       // ISO date
  dueDate: string;         // ISO date
  servicePeriodStart?: string;
  servicePeriodEnd?: string;
  billToName: string;
  billToEmail: string;
  billToCompany?: string;
  billToAddress?: string;
  billToCity?: string;
  billToCountry?: string;
  billToTaxId?: string;
  lineItems: LineItem[];
  milestones?: Milestone[];
  currency: string;
  discountType?: "percent" | "fixed";
  discountValue?: number;
  taxRate: number;
  taxLabel: string;
  projectName?: string;
  projectDescription?: string;
  notes?: string;
  footer?: string;
  paymentTerms?: string;
  paymentInstructions?: string;
  primaryColor?: string;
  accentColor?: string;
  showLogo?: boolean;
}
```

**Response `201`:**
```typescript
{
  success: true,
  data: { id: string, invoiceNumber: string }
}
```

**Implementation: `app/api/invoices/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceCreateSchema } from "@/schemas/invoice.schema";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { calculateInvoiceTotals } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const status = searchParams.get("status") as any;
  const clientId = searchParams.get("clientId");
  const search = searchParams.get("search");

  const where: any = { userId: session.user.id };
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { billToName: { contains: search, mode: "insensitive" } },
      { projectName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true, company: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { invoices, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = invoiceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation failed", details: parsed.error.errors }, { status: 400 });
    }

    const data = parsed.data;
    const invoiceNumber = await generateInvoiceNumber(session.user.id);
    const totals = calculateInvoiceTotals(data.lineItems, data.taxRate, data.discountType, data.discountValue);

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        invoiceNumber,
        ...data,
        ...totals,
        status: "DRAFT",
      },
    });

    await prisma.invoiceActivity.create({
      data: { invoiceId: invoice.id, action: "created" },
    });

    return NextResponse.json({ success: true, data: { id: invoice.id, invoiceNumber } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
  }
}
```

---

### `GET /api/invoices/[id]`
Get a single invoice with all details.

**Response `200`:**
```typescript
{
  success: true,
  data: Invoice & { client: Client | null, payments: Payment[], activityLog: InvoiceActivity[] }
}
```

### `PUT /api/invoices/[id]`
Update an invoice. Only DRAFT and SENT invoices can be edited.

**Request Body:** Partial invoice fields (same shape as POST, all optional)

**Response `200`:**
```typescript
{ success: true, data: { id: string } }
```

**Business Rules:**
- PAID and CANCELLED invoices cannot be edited — return `403`
- If status changes to SENT, set `sentAt = now()`
- If status changes to PAID, set `paidAt = now()` and `amountPaid = total`
- Always recalculate totals when lineItems change

### `DELETE /api/invoices/[id]`
Delete a DRAFT invoice. Cannot delete PAID invoices.

**Response `200`:**
```typescript
{ success: true, data: { deleted: true } }
```

---

## PDF Generation Route

### `GET /api/pdf/[id]`
Generate and stream a PDF for the given invoice.

**Response:** Binary PDF stream with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2025-0042.pdf"
```

**Implementation: `app/api/pdf/[id]/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "@/components/pdf/PDFDocument";
import React from "react";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { client: true },
    });

    if (!invoice) return new NextResponse("Not Found", { status: 404 });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const pdfBuffer = await renderToBuffer(
      React.createElement(PDFDocument, { invoice, profile })
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
```

---

## Client Routes

### `GET /api/clients`
List all clients for the authenticated user.

**Query Parameters:**
```
search? = string
isActive? = "true" | "false"
```

### `POST /api/clients`
Create a new client.

**Request Body:**
```typescript
{
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  defaultCurrency?: string;
  taxId?: string;
  notes?: string;
}
```

### `GET /api/clients/[id]`
Get client with their invoice history.

### `PUT /api/clients/[id]`
Update client details.

### `DELETE /api/clients/[id]`
Soft delete (set `isActive = false`). Client's existing invoices are preserved.

---

## Settings Routes

### `GET /api/settings`
Returns the user's profile and invoice settings combined.

**Response `200`:**
```typescript
{
  success: true,
  data: {
    user: { id, name, email },
    profile: UserProfile,
    invoiceSettings: InvoiceSettings,
  }
}
```

### `PUT /api/settings/profile`
Update business profile.

**Request Body:** Partial `UserProfile` fields

### `PUT /api/settings/invoice`
Update invoice defaults.

**Request Body:** Partial `InvoiceSettings` fields

---

## File Upload Route

### `POST /api/upload/logo`
Upload a business logo.

**Request:** `multipart/form-data` with field `logo`

**Constraints:**
- Max size: 5MB
- Accepted types: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
- File saved to: `public/uploads/{userId}/logo.{ext}`
- Old logo deleted when new one uploaded

**Response `200`:**
```typescript
{
  success: true,
  data: { logoPath: string }  // e.g. "/uploads/clxyz123/logo.png"
}
```

**Implementation: `app/api/upload/logo/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File;

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, error: "File too large (max 5MB)" }, { status: 400 });

    const ext = file.type.split("/")[1].replace("svg+xml", "svg");
    const dir = path.join(process.cwd(), "public", "uploads", session.user.id);
    await mkdir(dir, { recursive: true });

    // Delete existing logo
    const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
    if (profile?.logoPath) {
      try { await unlink(path.join(process.cwd(), "public", profile.logoPath)); } catch {}
    }

    const filename = `logo.${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(dir, filename), Buffer.from(bytes));

    const logoPath = `/uploads/${session.user.id}/${filename}`;
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { logoPath },
    });

    return NextResponse.json({ success: true, data: { logoPath } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
```

---

## Dashboard Stats Route

### `GET /api/dashboard/stats`
Returns summary statistics for the dashboard.

**Response `200`:**
```typescript
{
  success: true,
  data: {
    totalInvoices: number,
    totalRevenue: number,       // sum of all PAID invoices
    outstanding: number,        // sum of SENT + OVERDUE invoices
    overdueCount: number,
    draftCount: number,
    recentInvoices: Invoice[],  // last 5
    monthlyRevenue: {           // last 6 months
      month: string,
      revenue: number
    }[]
  }
}
```
