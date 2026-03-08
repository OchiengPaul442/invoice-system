import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  label: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  detail: { fontSize: 9, color: "#475569", marginTop: 2 },
});

export function PaymentBlock({
  color,
  bankName,
  bankAccount,
  swiftCode,
  mobileMoneyProvider,
  mobileMoneyNumber,
  paymentInstructions,
}: {
  color: string;
  bankName?: string | null;
  bankAccount?: string | null;
  swiftCode?: string | null;
  mobileMoneyProvider?: string | null;
  mobileMoneyNumber?: string | null;
  paymentInstructions?: string | null;
}): JSX.Element | null {
  if (!bankName && !bankAccount && !swiftCode && !mobileMoneyProvider && !mobileMoneyNumber && !paymentInstructions) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color }]}>Payment Details</Text>
      {bankName ? <Text style={styles.detail}>Bank: {bankName}</Text> : null}
      {bankAccount ? <Text style={styles.detail}>Account: {bankAccount}</Text> : null}
      {swiftCode ? <Text style={styles.detail}>SWIFT: {swiftCode}</Text> : null}
      {mobileMoneyProvider ? <Text style={styles.detail}>Mobile money: {mobileMoneyProvider}</Text> : null}
      {mobileMoneyNumber ? <Text style={styles.detail}>Mobile number: {mobileMoneyNumber}</Text> : null}
      {paymentInstructions ? <Text style={styles.detail}>{paymentInstructions}</Text> : null}
    </View>
  );
}
