import React from "react";
import { Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
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
    color: "#1e293b",
    padding: 44,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: { width: 90, height: 44, objectFit: "contain" },
  senderName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 6,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  senderDetail: { fontSize: 9, color: "#64748b", marginTop: 2 },
  invoiceLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  invoiceMeta: { fontSize: 9, color: "#64748b", marginTop: 2 },
  divider: { borderBottomWidth: 2, marginBottom: 16 },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailsCol: { flex: 1 },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  detail: { fontSize: 10, color: "#0f172a", marginTop: 2 },
  detailBold: {
    fontSize: 10,
    color: "#0f172a",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
  },
  detailMuted: { fontSize: 9, color: "#64748b", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowAlt: { backgroundColor: "#fafafa" },
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: "center" },
  colUnit: { flex: 0.8, textAlign: "center" },
  colPrice: { flex: 1.4, textAlign: "right" },
  colAmount: { flex: 1.4, textAlign: "right" },
  notes: { marginTop: 16 },
  notesText: { fontSize: 9, color: "#475569", marginTop: 2 },
});

export function ClassicTemplate({
  invoice,
  profile,
}: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || profile?.primaryColor || "#0f766e";
  const senderName =
    profile?.businessName || profile?.senderName || "Your Business";
  const senderEmail = profile?.businessEmail || profile?.senderEmail;
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={{ maxWidth: "55%" }}>
          {invoice.showLogo && profile?.logoPath ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              style={styles.logo}
              src={`${process.env.NEXT_PUBLIC_APP_URL}${profile.logoPath}`}
            />
          ) : null}
          <Text style={styles.senderName}>{senderName}</Text>
          {profile?.businessAddress ? (
            <Text style={styles.senderDetail}>{profile.businessAddress}</Text>
          ) : null}
          {profile?.businessCity ? (
            <Text style={styles.senderDetail}>
              {profile.businessCity}
              {profile.businessCountry ? `, ${profile.businessCountry}` : ""}
            </Text>
          ) : null}
          {senderEmail ? (
            <Text style={styles.senderDetail}>{senderEmail}</Text>
          ) : null}
          {profile?.businessPhone ? (
            <Text style={styles.senderDetail}>{profile.businessPhone}</Text>
          ) : null}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.invoiceLabel, { color }]}>
            Invoice {invoice.invoiceNumber}
          </Text>
          <Text style={styles.invoiceMeta}>
            Due {formatDate(invoice.dueDate)}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { borderBottomColor: color }]} />

      <View style={styles.detailsRow}>
        <View style={styles.detailsCol}>
          <Text style={[styles.sectionLabel, { color }]}>Bill To</Text>
          <Text style={styles.detailBold}>{invoice.billToName}</Text>
          {invoice.billToCompany ? (
            <Text style={styles.detail}>{invoice.billToCompany}</Text>
          ) : null}
          <Text style={styles.detailMuted}>{invoice.billToEmail}</Text>
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
        <View style={[styles.detailsCol, { alignItems: "flex-end" }]}>
          <Text style={[styles.sectionLabel, { color }]}>Project</Text>
          <Text style={[styles.detailBold, { textAlign: "right" }]}>
            {invoice.projectName || "General Services"}
          </Text>
          {invoice.projectDescription ? (
            <Text
              style={[
                styles.detailMuted,
                { textAlign: "right", maxWidth: 200 },
              ]}
            >
              {invoice.projectDescription}
            </Text>
          ) : null}
          <Text
            style={[styles.detailMuted, { marginTop: 8, textAlign: "right" }]}
          >
            Issued: {formatDate(invoice.issueDate)}
          </Text>
          <Text style={[styles.detailMuted, { textAlign: "right" }]}>
            Due: {formatDate(invoice.dueDate)}
          </Text>
        </View>
      </View>

      <View style={[styles.tableHeader, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.tableHeaderText, styles.colDesc, { color }]}>
          Description
        </Text>
        <Text style={[styles.tableHeaderText, styles.colQty, { color }]}>
          Qty
        </Text>
        <Text style={[styles.tableHeaderText, styles.colUnit, { color }]}>
          Unit
        </Text>
        <Text style={[styles.tableHeaderText, styles.colPrice, { color }]}>
          Unit Price
        </Text>
        <Text style={[styles.tableHeaderText, styles.colAmount, { color }]}>
          Amount
        </Text>
      </View>

      {lineItems.map((item, index) => (
        <View
          key={`${item.id || "line"}-${index}`}
          style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={styles.colDesc}>{item.description}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          <Text style={styles.colUnit}>{item.unit}</Text>
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
          <Text style={[styles.sectionLabel, { color }]}>Notes</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      ) : null}

      <FooterBlock footer={invoice.footer} />
      <Watermark />
    </Page>
  );
}
