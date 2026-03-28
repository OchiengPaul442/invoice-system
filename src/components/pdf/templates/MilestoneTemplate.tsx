import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { PaymentBlock } from "@/components/pdf/shared/PaymentBlock";
import { toLineItems, toMilestones } from "@/components/pdf/shared/helpers";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { Watermark } from "@/components/pdf/shared/Watermark";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const CARD_COLORS = [
  "#eff6ff",
  "#fffbeb",
  "#ecfdf5",
  "#f0f9ff",
  "#fef3c7",
  "#d1fae5",
];

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0f172a",
    padding: 38,
  },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: "#64748b", marginTop: 2 },
  headerDivider: { borderBottomWidth: 2, marginTop: 10, marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  milestoneCard: {
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  milestoneName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  milestoneMeta: { fontSize: 8, color: "#64748b", marginTop: 2 },
  milestoneAmount: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  itemHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginTop: 16,
    paddingBottom: 6,
  },
  itemHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#94a3b8",
  },
  itemRow: {
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

function milestoneStatusLabel(
  status: "pending" | "completed" | "invoiced",
): string {
  if (status === "completed") return "Completed";
  if (status === "invoiced") return "Invoiced";
  return "Pending";
}

export function MilestoneTemplate({
  invoice,
  profile,
}: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#0f766e";
  const senderName =
    profile?.businessName || profile?.senderName || "Your Business";
  const senderEmail = profile?.businessEmail || profile?.senderEmail;
  const milestones = toMilestones(invoice.milestones || []);
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={[styles.title, { color }]}>Milestone Invoice</Text>
      <Text style={styles.meta}>
        {invoice.invoiceNumber} · Due {formatDate(invoice.dueDate)}
      </Text>
      <View style={[styles.headerDivider, { borderBottomColor: color }]} />

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
          <Text style={[styles.detail, { marginTop: 6, textAlign: "right" }]}>
            Issued: {formatDate(invoice.issueDate)}
          </Text>
        </View>
      </View>

      {milestones.length > 0 ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { color, marginBottom: 6 }]}>
            Milestones
          </Text>
          {milestones.map((milestone, idx) => (
            <View
              key={`${milestone.id || "mile"}-${idx}`}
              style={[
                styles.milestoneCard,
                { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] },
              ]}
            >
              <View style={styles.milestoneRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestoneName}>{milestone.name}</Text>
                  <Text style={styles.milestoneMeta}>
                    {formatDate(milestone.dueDate)} ·{" "}
                    {milestoneStatusLabel(milestone.status)}
                  </Text>
                </View>
                <Text style={styles.milestoneAmount}>
                  {formatCurrency(milestone.amount, invoice.currency)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {lineItems.length > 0 ? (
        <View>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemHeaderText, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.itemHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.itemHeaderText, styles.colPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.itemHeaderText, styles.colAmount]}>
              Amount
            </Text>
          </View>
          {lineItems.map((item, idx) => (
            <View key={`${item.id || "item"}-${idx}`} style={styles.itemRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.unitPrice, invoice.currency)}
              </Text>
              <Text
                style={[styles.colAmount, { fontFamily: "Helvetica-Bold" }]}
              >
                {formatCurrency(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

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
