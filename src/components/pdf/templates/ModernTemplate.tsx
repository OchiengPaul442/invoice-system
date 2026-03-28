import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { toLineItems } from "@/components/pdf/shared/helpers";
import { PaymentBlock } from "@/components/pdf/shared/PaymentBlock";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { Watermark } from "@/components/pdf/shared/Watermark";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#1f2937", padding: 0 },
  /* ── Dark Header Banner ─────────────────────── */
  headerBanner: { padding: 28, paddingBottom: 22 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end" },
  invoiceLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "rgba(255,255,255,0.7)",
  },
  invoiceNumber: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginTop: 4,
  },
  senderName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  senderDetail: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  headerMeta: { fontSize: 9, color: "rgba(255,255,255,0.9)", marginTop: 2 },
  /* ── Body ───────────────────────────────────── */
  body: { padding: 28 },
  detailsRow: { flexDirection: "row", marginBottom: 20 },
  detailBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    marginRight: 8,
  },
  detailBoxRight: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#9ca3af",
    marginBottom: 4,
  },
  detail: { fontSize: 10, color: "#111827", marginTop: 2 },
  detailBold: {
    fontSize: 10,
    color: "#111827",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
  },
  detailMuted: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  /* ── Table ──────────────────────────────────── */
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    paddingBottom: 6,
    marginTop: 4,
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
    paddingVertical: 8,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: "center" },
  colUnit: { flex: 0.8, textAlign: "center" },
  colAmount: { flex: 1.4, textAlign: "right" },
  /* ── Notes ──────────────────────────────────── */
  notes: { marginTop: 16 },
  notesText: { fontSize: 9, color: "#6b7280", marginTop: 2 },
});

export function ModernTemplate({
  invoice,
  profile,
}: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#0f766e";
  const accent = invoice.accentColor || "#111827";
  const senderName =
    profile?.businessName || profile?.senderName || "Your Business";
  const senderEmail = profile?.businessEmail || profile?.senderEmail;
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      {/* ── Dark Header ── */}
      <View style={[styles.headerBanner, { backgroundColor: accent }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={[styles.senderName, { marginTop: 10 }]}>
              {senderName}
            </Text>
            {profile?.businessAddress ? (
              <Text style={styles.senderDetail}>{profile.businessAddress}</Text>
            ) : null}
            {senderEmail ? (
              <Text style={styles.senderDetail}>{senderEmail}</Text>
            ) : null}
            {profile?.businessPhone ? (
              <Text style={styles.senderDetail}>{profile.businessPhone}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>
              Issued: {formatDate(invoice.issueDate)}
            </Text>
            <Text style={styles.headerMeta}>
              Due: {formatDate(invoice.dueDate)}
            </Text>
            {invoice.projectName ? (
              <Text
                style={[
                  styles.headerMeta,
                  { marginTop: 8, fontFamily: "Helvetica-Bold" },
                ]}
              >
                {invoice.projectName}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* ── Bill To / Project boxes ── */}
        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.detailBold}>{invoice.billToName}</Text>
            <Text style={styles.detailMuted}>{invoice.billToEmail}</Text>
            {invoice.billToCompany ? (
              <Text style={styles.detailMuted}>{invoice.billToCompany}</Text>
            ) : null}
            {invoice.billToAddress ? (
              <Text style={styles.detailMuted}>{invoice.billToAddress}</Text>
            ) : null}
            {invoice.billToCity ? (
              <Text style={styles.detailMuted}>
                {invoice.billToCity}
                {invoice.billToCountry ? `, ${invoice.billToCountry}` : ""}
              </Text>
            ) : null}
            {invoice.billToTaxId ? (
              <Text style={styles.detailMuted}>
                Tax ID: {invoice.billToTaxId}
              </Text>
            ) : null}
          </View>
          <View style={styles.detailBoxRight}>
            <Text style={styles.sectionLabel}>Project</Text>
            <Text style={styles.detailBold}>
              {invoice.projectName || "General Services"}
            </Text>
            {invoice.projectDescription ? (
              <Text style={styles.detailMuted}>
                {invoice.projectDescription}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── Table ── */}
        <View style={[styles.tableHeader, { borderBottomColor: color }]}>
          <Text style={[styles.tableHeaderText, styles.colDesc]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colUnit]}>Unit</Text>
          <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
        </View>
        {lineItems.map((item, idx) => (
          <View key={`${item.id || "line"}-${idx}`} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colUnit}>{item.unit}</Text>
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
            <Text style={[styles.sectionLabel, { color }]}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        <FooterBlock footer={invoice.footer} />
      </View>
      <Watermark />
    </Page>
  );
}
