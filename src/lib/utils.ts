import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("si-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function generateInvoiceNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${random}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function calculateProfit(revenue: number, expenses: number): number {
  return revenue - expenses;
}

export function getProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return Math.round(((revenue - cost) / revenue) * 100);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export const PAYMENT_METHODS = ["CASH", "CARD", "BANK_TRANSFER", "CHEQUE"];

export const EXPENSE_CATEGORIES = [
  "RENT",
  "UTILITIES",
  "SALARIES",
  "MARKETING",
  "SUPPLIES",
  "TRANSPORT",
  "MAINTENANCE",
  "OTHER",
];

export const LEAVE_TYPES = [
  "ANNUAL",
  "SICK",
  "CASUAL",
  "MATERNITY",
  "UNPAID",
];

export const DEPARTMENTS = [
  "Management",
  "Sales",
  "Inventory",
  "Finance",
  "Operations",
  "HR",
  "IT",
];