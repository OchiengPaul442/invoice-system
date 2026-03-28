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
    color: "#0f172a",
    padding: 40,
  },
  banner: { borderRadius: 6, paddingVertical: 14, paddingHorizontal: 16 },
  bannerLabel: {
    color: "#ffffff",
    fontFamily: "Helvetica",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontSize: 8,
    opacity: 0.85,
  },
  bannerTitle: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    marginTop: 4,
  },
  bannerPeriod: { color: "#ffffff", fontSize: 9, marginTop: 4, opacity: 0.9 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 16,
  },
  section: { flex: 1 },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailBold: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  detail: { fontSize: 9, color: "#64748b", marginTop: 2 },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: { fontSize: 9, color: "#64748b" },
  summaryValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 6,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#94a3b8",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 7,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 1.4, textAlign: "right" },
  colAmount: { flex: 1.4, textAlign: "right" },
});

export function RetainerTemplate({
  invoice,
  profile,
}: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#0f766e";
  const senderName =
    profile?.businessName || profile?.senderName || "Your Business";
  const senderEmail = profile?.businessEmail || profile?.senderEmail;
  const lineItems = toLineItems(invoice.lineItems);

  const periodStart = invoice.servicePeriodStart
    ? formatDate(invoice.servicePeriodStart)
    : formatDate(invoice.issueDate);
  const periodEnd = invoice.servicePeriodEnd
    ? formatDate(invoice.servicePeriodEnd)
    : formatDate(invoice.dueDate);

  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.banner, { backgroundColor: color }]}>
        <Text style={styles.bannerLabel}>Monthly Retainer</Text>
        <Text style={styles.bannerTitle}>{invoice.invoiceNumber}</Text>
        <Text style={styles.bannerPeriod}>
          {periodStart} — {periodEnd}
        </Text>
      </View>

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
        </View>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Retainer Period</Text>
          <Text style={styles.summaryValue}>
            {periodStart} — {periodEnd}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Issued</Text>
          <Text style={styles.summaryValue}>
            {formatDate(invoice.issueDate)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Due</Text>
          <Text style={styles.summaryValue}>{formatDate(invoice.dueDate)}</Text>
        </View>
      </View>

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

      <FooterBlock footer={invoice.footer} />
      <Watermark />
    </Page>
  );
}
