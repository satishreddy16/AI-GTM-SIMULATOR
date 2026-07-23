import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("card print-block", className)}>{children}</div>;
}

export function SectionHeading({
  icon,
  title,
  subtitle,
  right,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        ) : null}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right}
    </div>
  );
}

const severityStyles: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700",
};

export function Badge({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "slate" | "Low" | "Medium" | "High" | "emerald";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-700",
    ...severityStyles,
  };
  return <span className={cn("badge", tones[tone] ?? tones.brand)}>{children}</span>;
}

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full bg-brand-500", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
        className
      )}
    >
      <strong className="font-semibold">Simulation, not a guarantee.</strong> These
      projections are directional estimates generated from your inputs and stated
      assumptions — treat them as a planning aid, not a forecast of actual results.
    </p>
  );
}
