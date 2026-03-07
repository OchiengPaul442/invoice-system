import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { toLineItems } from "@/components/pdf/shared/helpers";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#0f172a", padding: 40 },
  banner: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderRadius: 6 },
  bannerLabel: { color: "#fff", fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase", fontSize: 9 },
  bannerValue: { color: "#fff", fontSize: 9 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 14 },
  meta: { fontSize: 9, color: "#64748b", marginTop: 2 },
  summary: { marginTop: 12, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginTop: 16, paddingBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 7 },
  desc: { flex: 3 },
  qty: { flex: 1, textAlign: "right" },
  price: { flex: 1.5, textAlign: "right" },
});

export function RetainerTemplate({ invoice }: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#0f766e";
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
        <Text style={styles.bannerValue}>
          {periodStart} - {periodEnd}
        </Text>
      </View>

      <Text style={styles.title}>Retainer Invoice</Text>
      <Text style={styles.meta}>{invoice.invoiceNumber}</Text>
      <Text style={styles.meta}>
        Bill To: {invoice.billToName} ({invoice.billToEmail})
      </Text>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Retainer Period</Text>
          <Text>
            {periodStart} - {periodEnd}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Issued</Text>
          <Text>{formatDate(invoice.issueDate)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Due</Text>
          <Text>{formatDate(invoice.dueDate)}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.desc}>Description</Text>
        <Text style={styles.qty}>Qty</Text>
        <Text style={styles.price}>Unit</Text>
        <Text style={styles.price}>Amount</Text>
      </View>
      {lineItems.map((item, idx) => (
        <View key={`${item.id || "line"}-${idx}`} style={styles.row}>
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
    </Page>
  );
}
