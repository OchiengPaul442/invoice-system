import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { toLineItems } from "@/components/pdf/shared/helpers";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { Watermark } from "@/components/pdf/shared/Watermark";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#111827", padding: 44 },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  section: { flex: 1 },
  label: { fontSize: 8, textTransform: "uppercase", color: "#9ca3af", letterSpacing: 1, marginBottom: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingBottom: 5, marginTop: 18 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 7 },
  desc: { flex: 3 },
  qty: { flex: 1, textAlign: "right" },
  price: { flex: 1.5, textAlign: "right" },
});

export function MinimalTemplate({ invoice, profile }: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#111827";
  const senderName = profile?.businessName || profile?.senderName || "Your Business";
  const senderEmail = profile?.businessEmail || profile?.senderEmail;
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Invoice</Text>
      <Text style={styles.meta}>{invoice.invoiceNumber}</Text>
      <Text style={styles.meta}>
        {formatDate(invoice.issueDate)} - {formatDate(invoice.dueDate)}
      </Text>

      <View style={styles.row}>
        <View style={styles.section}>
          <Text style={styles.label}>Bill To</Text>
          <Text>{invoice.billToName}</Text>
          <Text style={styles.meta}>{invoice.billToEmail}</Text>
          {invoice.billToCompany ? <Text style={styles.meta}>{invoice.billToCompany}</Text> : null}
        </View>
        <View style={[styles.section, { alignItems: "flex-end" }]}>
          <Text style={styles.label}>From</Text>
          <Text>{senderName}</Text>
          {senderEmail ? <Text style={[styles.meta, { textAlign: "right" }]}>{senderEmail}</Text> : null}
        </View>
      </View>

      {invoice.projectName || invoice.projectDescription ? (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.label}>Project</Text>
          <Text>{invoice.projectName || "-"}</Text>
          {invoice.projectDescription ? <Text style={styles.meta}>{invoice.projectDescription}</Text> : null}
        </View>
      ) : null}

      <View style={styles.tableHeader}>
        <Text style={styles.desc}>Description</Text>
        <Text style={styles.qty}>Qty</Text>
        <Text style={styles.price}>Unit Price</Text>
        <Text style={styles.price}>Amount</Text>
      </View>
      {lineItems.map((item, idx) => (
        <View key={`${item.id || "line"}-${idx}`} style={styles.tableRow}>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Text style={styles.price}>{formatCurrency(item.unitPrice, invoice.currency)}</Text>
          <Text style={styles.price}>{formatCurrency(item.amount, invoice.currency)}</Text>
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

      <FooterBlock footer={invoice.footer} />
      <Watermark />
    </Page>
  );
}
