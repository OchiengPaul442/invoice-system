import { LineItem } from "@/types/invoice";

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  balanceDue: number;
}

export function calculateInvoiceTotals(
  lineItems: LineItem[],
  taxRate: number,
  discountType?: "percent" | "fixed" | null,
  discountValue?: number,
): InvoiceTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  let discountAmount = 0;
  if (discountType === "percent" && discountValue) {
    discountAmount = subtotal * (discountValue / 100);
  } else if (discountType === "fixed" && discountValue) {
    discountAmount = discountValue;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;
  const balanceDue = total;

  return { subtotal, discountAmount, taxAmount, total, balanceDue };
}
