import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";

const styles = StyleSheet.create({
  wrapper: { marginTop: 12, alignItems: "flex-end" },
  row: { flexDirection: "row", marginTop: 4 },
  label: { width: 110, fontSize: 9, color: "#64748b", textAlign: "right", marginRight: 10 },
  value: { width: 110, fontSize: 10, color: "#0f172a", textAlign: "right" },
  totalRow: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: "row",
  },
  totalLabel: { color: "#fff", fontSize: 10, fontFamily: "Helvetica-Bold", marginRight: 12 },
  totalValue: { color: "#fff", fontSize: 10, fontFamily: "Helvetica-Bold" },
});

export function TotalsBlock({
  subtotal,
  discountAmount,
  taxLabel,
  taxRate,
  taxAmount,
  total,
  currency,
  color,
}: {
  subtotal: number;
  discountAmount: number;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  color: string;
}): JSX.Element {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatCurrency(subtotal, currency)}</Text>
      </View>
      {discountAmount > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>
          <Text style={styles.value}>-{formatCurrency(discountAmount, currency)}</Text>
        </View>
      )}
      {taxRate > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>
            {taxLabel} ({taxRate}%)
          </Text>
          <Text style={styles.value}>{formatCurrency(taxAmount, currency)}</Text>
        </View>
      )}
      <View style={[styles.totalRow, { backgroundColor: color }]}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>{formatCurrency(total, currency)}</Text>
      </View>
    </View>
  );
}
