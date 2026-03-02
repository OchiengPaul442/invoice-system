"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvoiceBuilderStore } from "@/store/invoice-builder.store";
import { formatCurrency } from "@/lib/utils";

export const UNIT_OPTIONS: Record<string, string[]> = {
  HOURLY: ["hr", "day", "week"],
  FIXED: ["item", "project", "deliverable", "feature"],
  RETAINER: ["month", "quarter"],
  MILESTONE: ["milestone", "phase", "deliverable"],
  LICENSE: ["license", "seat", "instance", "year", "month"],
};

export function LineItemsTable(): JSX.Element {
  const lineItems = useInvoiceBuilderStore((state) => state.lineItems);
  const billingType = useInvoiceBuilderStore((state) => state.billingType);
  const currency = useInvoiceBuilderStore((state) => state.currency);
  const addLineItem = useInvoiceBuilderStore((state) => state.addLineItem);
  const removeLineItem = useInvoiceBuilderStore((state) => state.removeLineItem);
  const reorderLineItems = useInvoiceBuilderStore((state) => state.reorderLineItems);
  const updateLineItem = useInvoiceBuilderStore((state) => state.updateLineItem);
  const subtotal = useInvoiceBuilderStore((state) => state.subtotal);

  const units = UNIT_OPTIONS[billingType] ?? UNIT_OPTIONS.FIXED;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-surface-border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-2 py-2 text-left">Move</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">Qty</th>
              <th className="px-2 py-2 text-left">Unit</th>
              <th className="px-2 py-2 text-left">Price</th>
              <th className="px-2 py-2 text-right">Amount</th>
              <th className="px-2 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={item.id} className="border-t border-surface-border">
                <td className="px-2 py-2 align-top">
                  <div className="flex gap-1">
                    <button
                      className="rounded border border-surface-border p-1 text-ink-muted hover:bg-slate-50"
                      onClick={() => reorderLineItems(index, Math.max(index - 1, 0))}
                      type="button"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded border border-surface-border px-2 py-1 text-xs text-ink-muted hover:bg-slate-50"
                      onClick={() =>
                        reorderLineItems(index, Math.min(index + 1, lineItems.length - 1))
                      }
                      type="button"
                    >
                      v
                    </button>
                  </div>
                </td>
                <td className="px-2 py-2 align-top">
                  <Input
                    value={item.description}
                    onChange={(event) =>
                      updateLineItem(item.id, "description", event.target.value)
                    }
                    placeholder="Line item description"
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <Input
                    min={0}
                    step="any"
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      updateLineItem(item.id, "quantity", Number(event.target.value || 0))
                    }
                  />
                </td>
                <td className="px-2 py-2 align-top">
                  <Select
                    value={item.unit}
                    onValueChange={(value) => updateLineItem(item.id, "unit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-2 align-top">
                  <Input
                    min={0}
                    step="any"
                    type="number"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateLineItem(item.id, "unitPrice", Number(event.target.value || 0))
                    }
                  />
                </td>
                <td className="px-2 py-2 text-right align-top font-medium">
                  {formatCurrency(item.amount, currency)}
                </td>
                <td className="px-2 py-2 text-right align-top">
                  <Button
                    disabled={lineItems.length <= 1}
                    onClick={() => removeLineItem(item.id)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={addLineItem} type="button" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Line Item
        </Button>
        <p className="text-sm font-semibold text-ink">
          Subtotal: {formatCurrency(subtotal, currency)}
        </p>
      </div>
    </div>
  );
}
