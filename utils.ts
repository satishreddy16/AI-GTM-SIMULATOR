// Small formatting + class helpers shared across the app.

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number, opts?: { compact?: boolean }): string {
  if (!isFinite(value)) return "—";
  if (opts?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPct(value: number, digits = 1): string {
  if (!isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

// Percentage change between baseline and updated value (e.g. +12.5).
export function pctChange(baseline: number, updated: number): number {
  if (baseline === 0) return 0;
  return ((updated - baseline) / baseline) * 100;
}
