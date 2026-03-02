# 05 — Invoice Templates

## Overview

DevInvoice ships with **5 distinct PDF templates**, each designed for a specific developer billing scenario. All templates are built using `@react-pdf/renderer` and render identically across all PDF viewers.

**Critical rule:** All `@react-pdf/renderer` components use inline styles (not Tailwind). Keep all PDF template components in `/components/pdf/templates/`.

---

## Template Switcher (PDFDocument.tsx)

**File: `components/pdf/PDFDocument.tsx`**

```typescript
import React from "react";
import { Document } from "@react-pdf/renderer";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { MilestoneTemplate } from "./templates/MilestoneTemplate";
import { RetainerTemplate } from "./templates/RetainerTemplate";

interface PDFDocumentProps {
  invoice: any;
  profile: any;
}

export function PDFDocument({ invoice, profile }: PDFDocumentProps) {
  const templateMap: Record<string, React.ComponentType<any>> = {
    CLASSIC: ClassicTemplate,
    MODERN: ModernTemplate,
    MINIMAL: MinimalTemplate,
    MILESTONE: MilestoneTemplate,
    RETAINER: RetainerTemplate,
  };

  const Template = templateMap[invoice.templateType] || ClassicTemplate;

  return (
    <Document>
      <Template invoice={invoice} profile={profile} />
    </Document>
  );
}
```

---

## Template 1: CLASSIC

**Use case:** General developer freelance work, consulting, general IT services

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [LOGO]           INVOICE                 INV-2025-001│
│ Business Name                            Issue: Jan 1 │
│ Address                                  Due:   Jan 30│
│ Email | Phone                                        │
├─────────────────────────────────────────────────────┤
│ BILL TO                      PROJECT                 │
│ Client Name                  Project Name            │
│ Client Company               Description             │
│ Client Email                                         │
│ Client Address                                       │
├─────────────────────────────────────────────────────┤
│ DESCRIPTION          QTY    UNIT     PRICE    AMOUNT │
│ Line item 1          10     hr       150,000  1.5M   │
│ Line item 2          1      item     500,000  500K   │
├─────────────────────────────────────────────────────┤
│                            SUBTOTAL:   2,000,000     │
│                            DISCOUNT:   -200,000      │
│                            VAT (18%):   324,000      │
│                            TOTAL:      2,124,000     │
├─────────────────────────────────────────────────────┤
│ PAYMENT DETAILS              NOTES                   │
│ Bank: xxxxxx                 Notes text here         │
│ Account: xxxxxx                                      │
├─────────────────────────────────────────────────────┤
│ Footer text — Thank you for your business            │
└─────────────────────────────────────────────────────┘
```

**File: `components/pdf/templates/ClassicTemplate.tsx`**
```typescript
import React from "react";
import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#1e293b", padding: 48 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  logo: { width: 80, height: 40, objectFit: "contain" },
  businessBlock: { marginTop: 8 },
  businessName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  businessDetail: { fontSize: 9, color: "#64748b", marginTop: 2 },
  invoiceBlock: { alignItems: "flex-end" },
  invoiceTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#2563eb", letterSpacing: 2 },
  invoiceNumber: { fontSize: 12, color: "#0f172a", marginTop: 4 },
  invoiceMeta: { fontSize: 9, color: "#64748b", marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginVertical: 16 },
  billRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#2563eb", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  billDetail: { fontSize: 10, color: "#0f172a", marginTop: 2 },
  billDetailMuted: { fontSize: 9, color: "#64748b", marginTop: 1 },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f1f5f9", padding: "8 6", borderRadius: 2 },
  tableHeaderCell: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#475569", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", padding: "10 6", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableCell: { fontSize: 10, color: "#0f172a" },
  tableCellMuted: { fontSize: 9, color: "#64748b" },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right" },
  totalsSection: { alignItems: "flex-end", marginTop: 16 },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4 },
  totalsLabel: { fontSize: 9, color: "#64748b", width: 100, textAlign: "right", marginRight: 12 },
  totalsValue: { fontSize: 10, color: "#0f172a", width: 100, textAlign: "right" },
  totalBig: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, backgroundColor: "#2563eb", padding: "8 10", borderRadius: 4 },
  totalBigLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#ffffff", marginRight: 12 },
  totalBigValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  footer: { marginTop: 32, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 12 },
  footerText: { fontSize: 9, color: "#94a3b8", textAlign: "center" },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  paymentBlock: { flex: 1 },
  notesBlock: { flex: 1, marginLeft: 20 },
  paymentDetail: { fontSize: 9, color: "#475569", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
});

export function ClassicTemplate({ invoice, profile }: any) {
  const color = invoice.primaryColor || profile?.primaryColor || "#2563eb";

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {invoice.showLogo && profile?.logoPath && (
            <Image style={styles.logo} src={`${process.env.NEXT_PUBLIC_APP_URL}${profile.logoPath}`} />
          )}
          <View style={styles.businessBlock}>
            <Text style={styles.businessName}>{profile?.businessName || invoice.billFromName || "Your Business"}</Text>
            {profile?.businessAddress && <Text style={styles.businessDetail}>{profile.businessAddress}</Text>}
            {profile?.businessCity && <Text style={styles.businessDetail}>{profile.businessCity}, {profile.businessCountry}</Text>}
            {profile?.businessEmail && <Text style={styles.businessDetail}>{profile.businessEmail}</Text>}
            {profile?.businessPhone && <Text style={styles.businessDetail}>{profile.businessPhone}</Text>}
            {profile?.taxId && <Text style={styles.businessDetail}>Tax ID: {profile.taxId}</Text>}
          </View>
        </View>
        <View style={styles.invoiceBlock}>
          <Text style={[styles.invoiceTitle, { color }]}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceMeta}>Issued: {formatDate(invoice.issueDate)}</Text>
          <Text style={styles.invoiceMeta}>Due: {formatDate(invoice.dueDate)}</Text>
          <Text style={[styles.invoiceMeta, { marginTop: 6, color: "#0f172a", fontFamily: "Helvetica-Bold" }]}>
            Status: {invoice.status}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { borderBottomColor: color }]} />

      {/* Bill To + Project */}
      <View style={styles.billRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionLabel, { color }]}>Bill To</Text>
          <Text style={[styles.billDetail, { fontFamily: "Helvetica-Bold" }]}>{invoice.billToName}</Text>
          {invoice.billToCompany && <Text style={styles.billDetail}>{invoice.billToCompany}</Text>}
          <Text style={styles.billDetailMuted}>{invoice.billToEmail}</Text>
          {invoice.billToAddress && <Text style={styles.billDetailMuted}>{invoice.billToAddress}</Text>}
          {invoice.billToCity && <Text style={styles.billDetailMuted}>{invoice.billToCity}, {invoice.billToCountry}</Text>}
          {invoice.billToTaxId && <Text style={styles.billDetailMuted}>Tax ID: {invoice.billToTaxId}</Text>}
        </View>
        {invoice.projectName && (
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.sectionLabel, { color }]}>Project</Text>
            <Text style={[styles.billDetail, { fontFamily: "Helvetica-Bold", textAlign: "right" }]}>{invoice.projectName}</Text>
            {invoice.projectDescription && (
              <Text style={[styles.billDetailMuted, { textAlign: "right", maxWidth: 180 }]}>{invoice.projectDescription}</Text>
            )}
          </View>
        )}
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={[styles.tableHeader, { backgroundColor: color + "18" }]}>
          <Text style={[styles.tableHeaderCell, styles.colDescription, { color }]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty, { color }]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnit, { color }]}>Unit</Text>
          <Text style={[styles.tableHeaderCell, styles.colPrice, { color }]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmount, { color }]}>Amount</Text>
        </View>
        {(invoice.lineItems as any[]).map((item, i) => (
          <View key={item.id || i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }]}>
            <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
            <Text style={[styles.tableCell, styles.colQty, { textAlign: "center" }]}>{item.quantity}</Text>
            <Text style={[styles.tableCellMuted, styles.colUnit, { textAlign: "center" }]}>{item.unit}</Text>
            <Text style={[styles.tableCell, styles.colPrice, { textAlign: "right" }]}>
              {formatCurrency(item.unitPrice, invoice.currency)}
            </Text>
            <Text style={[styles.tableCell, styles.colAmount, { textAlign: "right", fontFamily: "Helvetica-Bold" }]}>
              {formatCurrency(item.amount, invoice.currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal, invoice.currency)}</Text>
        </View>
        {invoice.discountAmount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text style={[styles.totalsValue, { color: "#16a34a" }]}>-{formatCurrency(invoice.discountAmount, invoice.currency)}</Text>
          </View>
        )}
        {invoice.taxRate > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{invoice.taxLabel} ({invoice.taxRate}%)</Text>
            <Text style={styles.totalsValue}>{formatCurrency(invoice.taxAmount, invoice.currency)}</Text>
          </View>
        )}
        <View style={[styles.totalBig, { backgroundColor: color }]}>
          <Text style={styles.totalBigLabel}>TOTAL DUE</Text>
          <Text style={styles.totalBigValue}>{formatCurrency(invoice.total, invoice.currency)}</Text>
        </View>
      </View>

      {/* Payment & Notes */}
      <View style={styles.paymentRow}>
        {(profile?.bankName || profile?.paymentNotes || invoice.paymentInstructions) && (
          <View style={styles.paymentBlock}>
            <Text style={[styles.sectionLabel, { color }]}>Payment Details</Text>
            {profile?.bankName && <Text style={styles.paymentDetail}>Bank: {profile.bankName}</Text>}
            {profile?.bankAccount && <Text style={styles.paymentDetail}>Account: {profile.bankAccount}</Text>}
            {profile?.swiftCode && <Text style={styles.paymentDetail}>SWIFT: {profile.swiftCode}</Text>}
            {invoice.paymentInstructions && <Text style={styles.paymentDetail}>{invoice.paymentInstructions}</Text>}
          </View>
        )}
        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={[styles.sectionLabel, { color }]}>Notes</Text>
            <Text style={styles.paymentDetail}>{invoice.notes}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      {invoice.footer && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{invoice.footer}</Text>
        </View>
      )}
    </Page>
  );
}
```

---

## Template 2: MODERN

**Use case:** UI/UX design, web development, brand work — visually impressive clients

**Layout:** Two-column header with accent sidebar, clean white body, colored left border on line items.

Key visual differences from CLASSIC:
- Left column (30%): Business info, bill to, payment details — colored background
- Right column (70%): Invoice meta, line items, totals — white background
- No horizontal dividers — space creates separation

---

## Template 3: MINIMAL

**Use case:** Experienced developers who want clean, no-frills, fast-to-read invoices

**Layout:** Single column, maximum whitespace, minimal borders
- No colored sections
- Clean typography only
- Works best for simple hourly or fixed invoices
- Black and white (accent color only on total line)

---

## Template 4: MILESTONE

**Use case:** Project-based development with defined phases (Discovery, Design, Development, QA, Launch)

**Special fields:** Renders the `milestones` JSON array as a status table **above** the standard line items.

**Milestone Table:**
```
MILESTONE              DUE DATE      STATUS        AMOUNT
Phase 1 — Discovery    Jan 15        ✓ Completed   $500
Phase 2 — Design       Jan 30        ✓ Completed   $1,500
Phase 3 — Development  Feb 28        ○ Pending     $3,000
Phase 4 — QA           Mar 10        ○ Pending     $800
─────────────────────────────────────────────────────────
PROJECT TOTAL                                       $5,800
```

**Status icons:**
- `completed` → green checkmark ✓
- `invoiced` → blue circle ●
- `pending` → gray circle ○

---

## Template 5: RETAINER

**Use case:** Monthly retainer clients — recurring engagements, maintenance contracts

**Special fields:** Shows service period prominently (e.g. "January 2025 — Ongoing Retainer")

**Layout additions:**
- Service period banner at top (prominent colored bar)
- Retainer summary box: Monthly rate, hours included, hours used, overage
- Standard line items below for any overage or add-ons

**Example banner:**
```
┌──────────────────────────────────────────────────────┐
│  MONTHLY RETAINER  │  January 1 — January 31, 2025   │
└──────────────────────────────────────────────────────┘
```

---

## HTML Preview (InvoicePreview Component)

The live preview in the builder is **HTML/CSS**, not PDF. It mirrors the PDF layout visually but uses Tailwind/CSS.

**File: `components/invoice/InvoicePreview.tsx`**

```typescript
"use client";

import { useInvoiceBuilderStore } from "@/store/invoice-builder.store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function InvoicePreview() {
  const store = useInvoiceBuilderStore();
  const color = store.primaryColor;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden text-sm font-sans"
      style={{ width: "595px", minHeight: "842px", padding: "48px" }}>
      {/* This mirrors the PDF template structure in HTML/CSS */}
      {/* Switch rendering based on store.templateType */}
      {/* ... */}
    </div>
  );
}
```

**Implementation note for AI agent:** Build one complete HTML preview component for the CLASSIC template first. Then build the PDF version. The other 4 templates follow the same pattern.

---

## Template Thumbnails

Generate static thumbnail images (600x800px PNG) for each template to display on the Templates gallery page and TemplateSelector in the builder. Store them in `public/template-previews/`:
```
public/template-previews/
├── classic.png
├── modern.png
├── minimal.png
├── milestone.png
└── retainer.png
```

These are **static design assets** the AI agent should create using the canvas design approach — colored rectangles and lines representing the layout, not real invoice data. Simple, recognizable layout thumbnails.

---

## Billing Types → Template Mapping (Suggestions)

The builder suggests the best template based on the billing type selected:

| Billing Type | Suggested Templates |
|-------------|-------------------|
| HOURLY | CLASSIC, MINIMAL |
| FIXED | CLASSIC, MODERN |
| RETAINER | RETAINER |
| MILESTONE | MILESTONE |
| LICENSE | CLASSIC, MINIMAL |

This is a suggestion only — user can always override.

---

## Unit Options by Billing Type

```typescript
export const UNIT_OPTIONS: Record<string, string[]> = {
  HOURLY: ["hr", "day", "week"],
  FIXED: ["item", "project", "deliverable", "feature"],
  RETAINER: ["month", "quarter"],
  MILESTONE: ["milestone", "phase", "deliverable"],
  LICENSE: ["license", "seat", "instance", "year", "month"],
};
```

---

## PDF Generation Notes for AI Agent

1. `@react-pdf/renderer` must be server-side only. Never import in client components.
2. All styles must be `StyleSheet.create({})` objects — no Tailwind.
3. Fonts: `Helvetica` and `Helvetica-Bold` are built-in. No Google Fonts needed in PDF.
4. Images in PDF: Use absolute URLs `${process.env.NEXT_PUBLIC_APP_URL}/uploads/...` not relative paths.
5. Max image size for logo in PDF: width 100px, height 50px — scale with `objectFit: "contain"`.
6. Keep each template under 400 lines. Extract shared sub-components (TotalsBlock, FooterBlock) to `components/pdf/shared/`.
7. Test PDF generation with: `node -e "require('./lib/pdf-test.js')"` — create a quick test script.
