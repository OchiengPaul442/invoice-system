import React from "react";
import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { FooterBlock } from "@/components/pdf/shared/FooterBlock";
import { toLineItems } from "@/components/pdf/shared/helpers";
import { PaymentBlock } from "@/components/pdf/shared/PaymentBlock";
import { TotalsBlock } from "@/components/pdf/shared/TotalsBlock";
import { PDFTemplateProps } from "@/components/pdf/shared/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#1f2937", padding: 30 },
  wrapper: { flexDirection: "row", minHeight: "100%" },
  sidebar: { width: "32%", backgroundColor: "#111827", padding: 16 },
  content: { width: "68%", padding: 16 },
  whiteText: { color: "#fff" },
  mutedSidebar: { color: "#cbd5e1", marginTop: 3, fontSize: 9 },
  sectionTitle: { fontSize: 9, textTransform: "uppercase", letterSpacing: 1, marginTop: 14 },
  invoiceTitle: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 7 },
  desc: { flex: 3 },
  small: { flex: 1, textAlign: "center" },
  price: { flex: 1.5, textAlign: "right" },
});

export function ModernTemplate({ invoice, profile }: PDFTemplateProps): JSX.Element {
  const color = invoice.primaryColor || "#0f766e";
  const lineItems = toLineItems(invoice.lineItems);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.wrapper}>
        <View style={[styles.sidebar, { backgroundColor: invoice.accentColor || "#111827" }]}>
          <Text style={[styles.whiteText, { fontSize: 16, fontFamily: "Helvetica-Bold" }]}>
            {profile?.businessName || "Your Business"}
          </Text>
          {profile?.businessAddress ? <Text style={styles.mutedSidebar}>{profile.businessAddress}</Text> : null}
          {profile?.businessEmail ? <Text style={styles.mutedSidebar}>{profile.businessEmail}</Text> : null}
          {profile?.businessPhone ? <Text style={styles.mutedSidebar}>{profile.businessPhone}</Text> : null}

          <Text style={[styles.sectionTitle, styles.whiteText]}>Bill To</Text>
          <Text style={[styles.whiteText, { marginTop: 3 }]}>{invoice.billToName}</Text>
          <Text style={styles.mutedSidebar}>{invoice.billToEmail}</Text>
          {invoice.billToCompany ? <Text style={styles.mutedSidebar}>{invoice.billToCompany}</Text> : null}

          <PaymentBlock
            bankAccount={profile?.bankAccount}
            bankName={profile?.bankName}
            color="#93c5fd"
            paymentInstructions={invoice.paymentInstructions}
            swiftCode={profile?.swiftCode}
          />
        </View>

        <View style={styles.content}>
          <Text style={[styles.invoiceTitle, { color }]}>INVOICE</Text>
          <Text style={{ marginTop: 4 }}>{invoice.invoiceNumber}</Text>
          <Text style={{ marginTop: 2, fontSize: 9, color: "#64748b" }}>
            Issued {formatDate(invoice.issueDate)} - Due {formatDate(invoice.dueDate)}
          </Text>
          {invoice.projectName ? <Text style={{ marginTop: 8 }}>{invoice.projectName}</Text> : null}

          <View style={{ marginTop: 16 }}>
            <View style={styles.tableHeader}>
              <Text style={styles.desc}>Description</Text>
              <Text style={styles.small}>Qty</Text>
              <Text style={styles.small}>Unit</Text>
              <Text style={styles.price}>Amount</Text>
            </View>
            {lineItems.map((item, idx) => (
              <View key={`${item.id || "line"}-${idx}`} style={styles.tableRow}>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.small}>{item.quantity}</Text>
                <Text style={styles.small}>{item.unit}</Text>
                <Text style={styles.price}>{formatCurrency(item.amount, invoice.currency)}</Text>
              </View>
            ))}
          </View>

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
        </View>
      </View>
    </Page>
  );
}
