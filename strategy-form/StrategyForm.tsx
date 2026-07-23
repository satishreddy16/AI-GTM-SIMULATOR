"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Loader2, ChevronDown } from "lucide-react";
import {
  strategyInputSchema,
  type StrategyInputSchema,
  BUSINESS_MODELS,
  CATEGORIES,
} from "@/lib/gtm/validation";
import { DEMO_PRODUCTS, DEFAULT_INPUT } from "@/lib/gtm/demo-data";

export function StrategyForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: StrategyInputSchema;
  submitting: boolean;
  onSubmit: (data: StrategyInputSchema) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StrategyInputSchema>({
    resolver: zodResolver(strategyInputSchema),
    defaultValues: initial ?? (DEFAULT_INPUT as StrategyInputSchema),
    mode: "onBlur",
  });

  // Keep the form in sync if a demo is loaded from the parent.
  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sample loader */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="mb-2.5 text-sm font-medium text-brand-800">
          Load a sample product
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_PRODUCTS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => reset(d.input as StrategyInputSchema)}
              className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
            >
              {d.label}: {d.input.productName}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product name" error={errors.productName?.message} className="sm:col-span-2">
          <input className="input" placeholder="e.g. CashHorizon" {...register("productName")} />
        </Field>

        <Field
          label="Product description"
          error={errors.productDescription?.message}
          className="sm:col-span-2"
        >
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder="What does your product do, and for whom?"
            {...register("productDescription")}
          />
        </Field>

        <Field label="Product category" error={errors.category?.message}>
          <SelectWrap>
            <select className="input appearance-none pr-9" {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>

        <Field label="Business model" error={errors.businessModel?.message}>
          <SelectWrap>
            <select className="input appearance-none pr-9" {...register("businessModel")}>
              {BUSINESS_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>

        <Field label="Target customer" error={errors.targetCustomer?.message}>
          <input
            className="input"
            placeholder="e.g. Small-business owners"
            {...register("targetCustomer")}
          />
        </Field>

        <Field label="Target geography" error={errors.geography?.message}>
          <input className="input" placeholder="e.g. United States" {...register("geography")} />
        </Field>

        <Field label="Marketing budget (USD)" error={errors.budget?.message}>
          <input
            type="number"
            min={500}
            step={500}
            className="input"
            placeholder="15000"
            {...register("budget", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Timeline (months)" error={errors.timelineMonths?.message}>
          <input
            type="number"
            min={1}
            max={36}
            className="input"
            placeholder="9"
            {...register("timelineMonths", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Runs instantly in mock mode — no API keys required.
        </p>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" /> Generate GTM Strategy
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
