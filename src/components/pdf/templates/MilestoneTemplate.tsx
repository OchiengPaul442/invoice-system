import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { toLineItems, toMilestones } from "@/components/pdf/shared/helpers";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#0f172a", padding: 38 },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  meta: { fontSize: 9, color: "#64748b", marginTop: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#eff6ff", padding: 6, marginTop: 14 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 7, paddingHorizontal: 6 },
  colMilestone: { flex: 3 },
  colDue: { flex: 1.2 },
  colStatus: { flex: 1.2 },
  colAmount: { flex: 1.4, textAlign: "right" },
  itemHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginTop: 14, paddingBottom: 6 },
  itemRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 7 },
  desc: { flex: 3 },
  qty: { flex: 1, textAlign: "right" },
  price: { flex: 1.6, textAlign: "right" },
});

function milestoneStatus(status: "pending" | "completed" | "invoiced"): string {
  if (status === "completed") return "COMPLETED";
  if (status === "invoiced") return "INVOICED";
  return "PENDING";
}

export function MilestoneTemplate({ invoice }: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#2563eb";
  const milestones = toMilestones(invoice.milestones || []);
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={[styles.title, { color }]}>Milestone Invoice</Text>
      <Text style={styles.meta}>{invoice.invoiceNumber}</Text>
      <Text style={styles.meta}>
        Issued {formatDate(invoice.issueDate)} • Due {formatDate(invoice.dueDate)}
      </Text>
      <Text style={[styles.meta, { marginTop: 8 }]}>
        Bill To: {invoice.billToName} ({invoice.billToEmail})
      </Text>

      {milestones.length ? (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colMilestone}>Milestone</Text>
            <Text style={styles.colDue}>Due Date</Text>
            <Text style={styles.colStatus}>Status</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          {milestones.map((milestone, idx) => (
            <View key={`${milestone.id || "mile"}-${idx}`} style={styles.tableRow}>
              <Text style={styles.colMilestone}>{milestone.name}</Text>
              <Text style={styles.colDue}>{formatDate(milestone.dueDate)}</Text>
              <Text style={styles.colStatus}>{milestoneStatus(milestone.status)}</Text>
              <Text style={styles.colAmount}>
                {formatCurrency(milestone.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.itemHeader}>
        <Text style={styles.desc}>Line Item</Text>
        <Text style={styles.qty}>Qty</Text>
        <Text style={styles.price}>Amount</Text>
      </View>
      {lineItems.map((item, idx) => (
        <View key={`${item.id || "item"}-${idx}`} style={styles.itemRow}>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.qty}>{item.quantity}</Text>
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
