import React from "react";
import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { PaymentBlock } from "@/components/pdf/shared/PaymentBlock";
import { toLineItems } from "@/components/pdf/shared/helpers";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#1e293b", padding: 44 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { width: 90, height: 44, objectFit: "contain" },
  businessName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a", marginTop: 6 },
  businessDetail: { fontSize: 9, color: "#64748b", marginTop: 2 },
  invoiceTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  invoiceMeta: { marginTop: 3, fontSize: 9, color: "#64748b" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  left: { flex: 1, marginRight: 12 },
  right: { flex: 1, marginLeft: 12, alignItems: "flex-end" },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  detail: { fontSize: 10, color: "#0f172a", marginTop: 2 },
  detailMuted: { fontSize: 9, color: "#64748b", marginTop: 2 },
  tableHeader: { flexDirection: "row", borderRadius: 2, paddingHorizontal: 6, paddingVertical: 8 },
  tableHeaderCell: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", paddingHorizontal: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right" },
  notes: { marginTop: 16 },
  notesText: { fontSize: 9, color: "#475569", marginTop: 2 },
});

export function ClassicTemplate({ invoice, profile }: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || profile?.primaryColor || "#2563eb";
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          {invoice.showLogo && profile?.logoPath ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.logo} src={`${process.env.NEXT_PUBLIC_APP_URL}${profile.logoPath}`} />
          ) : null}
          <Text style={styles.businessName}>{profile?.businessName || "Your Business"}</Text>
          {profile?.businessAddress ? <Text style={styles.businessDetail}>{profile.businessAddress}</Text> : null}
          {profile?.businessCity ? (
            <Text style={styles.businessDetail}>
              {profile.businessCity}
              {profile.businessCountry ? `, ${profile.businessCountry}` : ""}
            </Text>
          ) : null}
          {profile?.businessEmail ? <Text style={styles.businessDetail}>{profile.businessEmail}</Text> : null}
          {profile?.businessPhone ? <Text style={styles.businessDetail}>{profile.businessPhone}</Text> : null}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.invoiceTitle, { color }]}>INVOICE</Text>
          <Text style={styles.detail}>{invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceMeta}>Issued: {formatDate(invoice.issueDate)}</Text>
          <Text style={styles.invoiceMeta}>Due: {formatDate(invoice.dueDate)}</Text>
          <Text style={styles.invoiceMeta}>Status: {invoice.status}</Text>
        </View>
      </View>

      <View style={[styles.divider, { borderBottomColor: color }]} />

      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.sectionLabel, { color }]}>Bill To</Text>
          <Text style={[styles.detail, { fontFamily: "Helvetica-Bold" }]}>{invoice.billToName}</Text>
          {invoice.billToCompany ? <Text style={styles.detail}>{invoice.billToCompany}</Text> : null}
          <Text style={styles.detailMuted}>{invoice.billToEmail}</Text>
          {invoice.billToAddress ? <Text style={styles.detailMuted}>{invoice.billToAddress}</Text> : null}
          {invoice.billToCity ? (
            <Text style={styles.detailMuted}>
              {invoice.billToCity}
              {invoice.billToCountry ? `, ${invoice.billToCountry}` : ""}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text style={[styles.sectionLabel, { color }]}>Project</Text>
          <Text style={[styles.detail, { fontFamily: "Helvetica-Bold", textAlign: "right" }]}>
            {invoice.projectName || "Project"}
          </Text>
          {invoice.projectDescription ? (
            <Text style={[styles.detailMuted, { textAlign: "right", maxWidth: 200 }]}>
              {invoice.projectDescription}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.tableHeader, { backgroundColor: `${color}15` }]}>
        <Text style={[styles.tableHeaderCell, styles.colDescription, { color }]}>Description</Text>
        <Text style={[styles.tableHeaderCell, styles.colQty, { color }]}>Qty</Text>
        <Text style={[styles.tableHeaderCell, styles.colUnit, { color }]}>Unit</Text>
        <Text style={[styles.tableHeaderCell, styles.colPrice, { color }]}>Unit Price</Text>
        <Text style={[styles.tableHeaderCell, styles.colAmount, { color }]}>Amount</Text>
      </View>

      {lineItems.map((item, index) => (
        <View key={`${item.id || "line"}-${index}`} style={styles.tableRow}>
          <Text style={[styles.colDescription]}>{item.description}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          <Text style={styles.colUnit}>{item.unit}</Text>
          <Text style={styles.colPrice}>{formatCurrency(item.unitPrice, invoice.currency)}</Text>
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
        paymentInstructions={invoice.paymentInstructions || profile?.paymentNotes}
        swiftCode={profile?.swiftCode}
      />

      {invoice.notes ? (
        <View style={styles.notes}>
          <Text style={[styles.sectionLabel, { color }]}>Notes</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      ) : null}

      <FooterBlock footer={invoice.footer} />
    </Page>
  );
}
