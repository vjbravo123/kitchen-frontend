import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null, currency = "₹"): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return `${currency}0.00`;
  }
  const val = Number(amount);
  return `${currency}${val.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number | string | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "0";
  }
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
  });
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const UNIT_OPTIONS = [
  { label: "Kilograms (kg)", value: "kg", type: "WEIGHT" },
  { label: "Grams (g)", value: "g", type: "WEIGHT" },
  { label: "Litres (ltr)", value: "ltr", type: "VOLUME" },
  { label: "Millilitres (ml)", value: "ml", type: "VOLUME" },
  { label: "Pieces (piece)", value: "piece", type: "COUNT" },
  { label: "Dozen (12 pcs)", value: "dozen", type: "COUNT" },
];
