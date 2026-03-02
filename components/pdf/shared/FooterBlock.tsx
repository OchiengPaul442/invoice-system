import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    marginTop: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  text: { fontSize: 9, color: "#94a3b8", textAlign: "center" },
});

export function FooterBlock({ footer }: { footer?: string | null }): JSX.Element | null {
  if (!footer) {
    return null;
  }

  return (
    <View style={styles.footer}>
      <Text style={styles.text}>{footer}</Text>
    </View>
  );
}
