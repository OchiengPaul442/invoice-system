import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "UGX"): string {
  const symbols: Record<string, string> = {
    UGX: "UGX ",
    USD: "$",
    EUR: "EUR ",
    GBP: "GBP ",
    KES: "KSh ",
    ZAR: "R ",
    NGN: "NGN ",
    GHS: "GHs ",
    TZS: "TSh ",
  };

  const symbol = symbols[currency] ?? `${currency} `;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(
  date: string | Date,
  fmt = "MMM d, yyyy",
): string {
  return format(new Date(date), fmt);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    SENT: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    VIEWED: "bg-indigo-100 text-indigo-700",
  };

  return map[status] ?? "bg-gray-100 text-gray-600";
}

export const SUPPORTED_CURRENCIES = [
  { code: "UGX", symbol: "UGX", name: "Ugandan Shilling" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "EUR", name: "Euro" },
  { code: "GBP", symbol: "GBP", name: "British Pound" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "NGN", symbol: "NGN", name: "Nigerian Naira" },
  { code: "GHS", symbol: "GHs", name: "Ghanaian Cedi" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
] as const;
