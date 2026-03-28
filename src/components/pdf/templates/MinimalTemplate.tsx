import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { PaymentBlock } from "@/components/pdf/shared/PaymentBlock";
import { toLineItems } from "@/components/pdf/shared/helpers";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { Watermark } from "@/components/pdf/shared/Watermark";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    padding: 44,
  },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#111827" },
  meta: { fontSize: 9, color: "#6b7280", marginTop: 3 },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginTop: 12,
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  section: { flex: 1 },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#9ca3af",
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailBold: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
  detail: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 6,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#9ca3af",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 7,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 1.4, textAlign: "right" },
  colAmount: { flex: 1.4, textAlign: "right" },
  notes: { marginTop: 16 },
  notesText: { fontSize: 9, color: "#6b7280", marginTop: 2 },
});

export function MinimalTemplate({
  invoice,
  profile,
}: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#111827";
  const senderName =
    profile?.businessName || profile?.senderName || "Your Business";
  const senderEmail = profile?.businessEmail || profile?.senderEmail;
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Invoice</Text>
      <Text style={styles.meta}>
        {invoice.invoiceNumber} · {formatDate(invoice.dueDate)}
      </Text>

      <View style={styles.headerDivider} />

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.label}>Bill To</Text>
          <Text style={styles.detailBold}>{invoice.billToName}</Text>
          <Text style={styles.detail}>{invoice.billToEmail}</Text>
          {invoice.billToCompany ? (
            <Text style={styles.detail}>{invoice.billToCompany}</Text>
          ) : null}
          {invoice.billToAddress ? (
            <Text style={styles.detail}>{invoice.billToAddress}</Text>
          ) : null}
          {invoice.billToCity ? (
            <Text style={styles.detail}>
              {invoice.billToCity}
              {invoice.billToCountry ? `, ${invoice.billToCountry}` : ""}
            </Text>
          ) : null}
        </View>
        <View style={[styles.section, { alignItems: "flex-end" }]}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.detailBold}>{senderName}</Text>
          {senderEmail ? (
            <Text style={[styles.detail, { textAlign: "right" }]}>
              {senderEmail}
            </Text>
          ) : null}
          {profile?.businessPhone ? (
            <Text style={[styles.detail, { textAlign: "right" }]}>
              {profile.businessPhone}
            </Text>
          ) : null}
          <Text style={[styles.detail, { marginTop: 8, textAlign: "right" }]}>
            Issued: {formatDate(invoice.issueDate)}
          </Text>
          <Text style={[styles.detail, { textAlign: "right" }]}>
            Due: {formatDate(invoice.dueDate)}
          </Text>
        </View>
      </View>

      {invoice.projectName || invoice.projectDescription ? (
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.label}>Project</Text>
          <Text style={styles.detailBold}>{invoice.projectName || "-"}</Text>
          {invoice.projectDescription ? (
            <Text style={styles.detail}>{invoice.projectDescription}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colDesc]}>
          Description
        </Text>
        <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
        <Text style={[styles.tableHeaderText, styles.colPrice]}>
          Unit Price
        </Text>
        <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
      </View>
      {lineItems.map((item, idx) => (
        <View key={`${item.id || "line"}-${idx}`} style={styles.tableRow}>
          <Text style={styles.colDesc}>{item.description}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          <Text style={styles.colPrice}>
            {formatCurrency(item.unitPrice, invoice.currency)}
          </Text>
          <Text style={[styles.colAmount, { fontFamily: "Helvetica-Bold" }]}>
            {formatCurrency(item.amount, invoice.currency)}
          </Text>
        </View>
      ))}

      <TotalsBlock
        color={color}
        currency={invoice.currency}
        discountAmount={Number(invoice.discountAmount || 0)}
        subtotal={Number(invoice.subtotal)}
        taxAmount={Number(invoice.taxAmount)}
        taxLabel={invoice.taxLabel}
        taxRate={Number(invoice.taxRate)}
        total={Number(invoice.total)}
      />

      <PaymentBlock
        bankAccount={profile?.bankAccount}
        bankName={profile?.bankName}
        color={color}
        mobileMoneyNumber={profile?.mobileMoneyNumber}
        mobileMoneyProvider={profile?.mobileMoneyProvider}
        paymentInstructions={
          invoice.paymentInstructions || profile?.paymentNotes
        }
        swiftCode={profile?.swiftCode}
      />

      {invoice.notes ? (
        <View style={styles.notes}>
          <Text style={[styles.label, { color }]}>Notes</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      ) : null}

      <FooterBlock footer={invoice.footer} />
      <Watermark />
    </Page>
  );
}
