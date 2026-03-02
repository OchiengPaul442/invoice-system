import { PDFLineItem, PDFMilestone } from "@/components/pdf/shared/types";

export function toLineItems(items: unknown): PDFLineItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => typeof item === "object" && item !== null)
    .map((item) => {
      const value = item as Record<string, unknown>;
      return {
        id: typeof value.id === "string" ? value.id : undefined,
        description: String(value.description ?? ""),
        quantity: Number(value.quantity ?? 0),
        unit: String(value.unit ?? ""),
        unitPrice: Number(value.unitPrice ?? 0),
        amount: Number(value.amount ?? 0),
      };
    });
}

export function toMilestones(items: unknown): PDFMilestone[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => typeof item === "object" && item !== null)
    .map((item) => {
      const value = item as Record<string, unknown>;
      const rawStatus = String(value.status ?? "pending");
      return {
        id: typeof value.id === "string" ? value.id : undefined,
        name: String(value.name ?? ""),
        description: String(value.description ?? ""),
        dueDate: String(value.dueDate ?? ""),
        amount: Number(value.amount ?? 0),
        status:
          rawStatus === "completed" || rawStatus === "invoiced" ? rawStatus : "pending",
      };
    });
}
