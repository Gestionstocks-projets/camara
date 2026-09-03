import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, type FormatOptions } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fcfaFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

export function formatFCFA(amount: number): string {
  return `${fcfaFormatter.format(amount)} F`;
}

export function formatDate(
  date: Date | string,
  pattern = "d MMM yyyy",
  options?: FormatOptions,
): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, pattern, { locale: fr, ...options });
}
