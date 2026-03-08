import React from "react";
import { StyleSheet, Text } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  watermark: {
    position: "absolute",
    right: 24,
    bottom: 18,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    color: "#94a3b8",
    opacity: 0.35,
  },
});

export function Watermark(): JSX.Element {
  return (
    <Text fixed style={styles.watermark}>
      LedgerBloom
    </Text>
  );
}
