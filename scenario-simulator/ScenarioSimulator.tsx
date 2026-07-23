"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Sliders, ArrowUpRight, ArrowDownRight, Minus, Sparkles, RotateCcw } from "lucide-react";
import type { GTMStrategy, ScenarioInputs } from "@/lib/gtm/types";
import {
  NEUTRAL_SCENARIO,
  baselineFromStrategy,
  simulateScenario,
} from "@/lib/gtm/calculations";
import { formatCurrency, formatNumber, formatPct, pctChange } from "@/lib/utils";
import { Card, SectionHeading } from "@/components/ui/primitives";

// Slider definitions — each maps to one multiplier in ScenarioInputs.
const CONTROLS: {
  key: keyof ScenarioInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  // How to phrase the current multiplier.
  fmt: (v: number) => string;
}[] = [
  {
    key: "cacMultiplier",
    label: "Customer acquisition cost",
    min: 0.5,
    max: 2,
    step: 0.05,
    fmt: (v) => `${v.toFixed(2)}× CAC`,
  },
  {
    key: "conversionMultiplier",
    label: "Conversion rate",
    min: 0.5,
    max: 2,
    step: 0.05,
    fmt: (v) => `${v.toFixed(2)}× conversion`,
  },
  {
    key: "budgetMultiplier",
    label: "Marketing budget",
    min: 0.5,
    max: 3,
    step: 0.1,
    fmt: (v) => `${v.toFixed(1)}× budget`,
  },
  {
    key: "timelineMultiplier",
    label: "Launch timeline",
    min: 0.5,
    max: 2,
    step: 0.1,
    fmt: (v) => `${v.toFixed(1)}× timeline`,
  },
];

const PRESETS: { label: string; scenario: ScenarioInputs }[] = [
  { label: "Reset to baseline", scenario: { ...NEUTRAL_SCENARIO } },
  { label: "CAC +30%", scenario: { ...NEUTRAL_SCENARIO, cacMultiplier: 1.3 } },
  { label: "Conversion +25%", scenario: { ...NEUTRAL_SCENARIO, conversionMultiplier: 1.25 } },
  { label: "Double budget", scenario: { ...NEUTRAL_SCENARIO, budgetMultiplier: 2 } },
  { label: "Aggressive growth", scenario: { cacMultiplier: 0.85, conversionMultiplier: 1.3, budgetMultiplier: 1.5, timelineMultiplier: 1 } },
];

export function ScenarioSimulator({ strategy }: { strategy: GTMStrategy }) {
  const baseline = useMemo(() => baselineFromStrategy(strategy), [strategy]);
  const [inputs, setInputs] = useState<ScenarioInputs>({ ...NEUTRAL_SCENARIO });

  const base = useMemo(() => simulateScenario(baseline, NEUTRAL_SCENARIO), [baseline]);
  const sim = useMemo(() => simulateScenario(baseline, inputs), [baseline, inputs]);

  const isDirty = (Object.keys(inputs) as (keyof ScenarioInputs)[]).some(
    (k) => inputs[k] !== 1
  );

  const metrics = [
    { label: "Customers acquired", b: base.customers, v: sim.customers, fmt: formatNumber },
    { label: "Customer acq. cost", b: base.cac, v: sim.cac, fmt: (n: number) => formatCurrency(n), invert: true },
    { label: "Leads generated", b: base.leads, v: sim.leads, fmt: formatNumber },
    { label: "Conversion rate", b: base.conversionRate, v: sim.conversionRate, fmt: (n: number) => formatPct(n, 2) },
    { label: "Projected revenue", b: base.totalRevenue, v: sim.totalRevenue, fmt: (n: number) => formatCurrency(n, { compact: true }) },
    { label: "Monthly revenue", b: base.monthlyRevenue, v: sim.monthlyRevenue, fmt: (n: number) => formatCurrency(n, { compact: true }) },
    { label: "Return on mktg spend", b: base.romas, v: sim.romas, fmt: (n: number) => `${n.toFixed(2)}x` },
    { label: "Break-even (months)", b: base.breakEvenMonths ?? 0, v: sim.breakEvenMonths ?? 0, fmt: (n: number) => (n ? n.toFixed(1) : "—"), invert: true },
  ];

  const chartData = [
    { name: "Customers", Baseline: base.customers, Scenario: sim.customers },
    { name: "Revenue ($K)", Baseline: Math.round(base.totalRevenue / 1000), Scenario: Math.round(sim.totalRevenue / 1000) },
    { name: "ROMAS", Baseline: +base.romas.toFixed(1), Scenario: +sim.romas.toFixed(1) },
  ];

  return (
    <Card className="card-pad">
      <SectionHeading
        icon={<Sliders className="h-5 w-5" />}
        title="What-If Scenario Simulator"
        subtitle="Adjust the levers and watch the projections recalculate instantly."
        right={
          isDirty ? (
            <button
              onClick={() => setInputs({ ...NEUTRAL_SCENARIO })}
              className="btn-secondary text-sm"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          ) : null
        }
      />

      {/* Presets */}
      <div className="mb-5 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setInputs({ ...p.scenario })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-5">
          {CONTROLS.map((c) => {
            const val = inputs[c.key];
            return (
              <div key={c.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">{c.label}</label>
                  <span className="badge bg-brand-50 text-brand-700">{c.fmt(val)}</span>
                </div>
                <input
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={val}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [c.key]: parseFloat(e.target.value) }))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>{c.min}×</span>
                  <span>baseline 1.0×</span>
                  <span>{c.max}×</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison chart */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-2 text-sm font-medium text-slate-600">
            Baseline vs. Scenario
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Baseline" fill="#c7d2fe" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Scenario" fill="#4f46e5" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metric comparison grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m) => {
          const change = pctChange(m.b, m.v);
          return (
            <div key={m.label} className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-medium text-slate-400">{m.label}</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{m.fmt(m.v)}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <span>base {m.fmt(m.b)}</span>
                <ChangeIndicator change={change} invert={m.invert} />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI-style interpretation */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
        <p className="text-sm leading-relaxed text-slate-700">
          {interpret(inputs, base, sim)}
        </p>
      </div>
    </Card>
  );
}

function ChangeIndicator({ change, invert }: { change: number; invert?: boolean }) {
  if (Math.abs(change) < 0.05) {
    return (
      <span className="inline-flex items-center gap-0.5 text-slate-400">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  // "good" = green. For inverted metrics (CAC, break-even) a decrease is good.
  const positive = change > 0;
  const good = invert ? !positive : positive;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 ${good ? "text-emerald-600" : "text-rose-500"}`}>
      <Icon className="h-3 w-3" />
      {positive ? "+" : ""}
      {change.toFixed(0)}%
    </span>
  );
}

// Short, plain-language read on the current scenario.
function interpret(
  inputs: ScenarioInputs,
  base: ReturnType<typeof simulateScenario>,
  sim: ReturnType<typeof simulateScenario>
): string {
  const custChange = pctChange(base.customers, sim.customers);
  const revChange = pctChange(base.totalRevenue, sim.totalRevenue);
  const dirty = Object.values(inputs).some((v) => v !== 1);

  if (!dirty) {
    return "This is your baseline plan. Drag any slider or pick a preset to see how customers, revenue, ROMAS, and break-even respond.";
  }

  const levers: string[] = [];
  if (inputs.cacMultiplier !== 1)
    levers.push(`CAC ${inputs.cacMultiplier > 1 ? "up" : "down"} ${Math.abs((inputs.cacMultiplier - 1) * 100).toFixed(0)}%`);
  if (inputs.conversionMultiplier !== 1)
    levers.push(`conversion ${inputs.conversionMultiplier > 1 ? "up" : "down"} ${Math.abs((inputs.conversionMultiplier - 1) * 100).toFixed(0)}%`);
  if (inputs.budgetMultiplier !== 1)
    levers.push(`budget ${inputs.budgetMultiplier > 1 ? "up" : "down"} ${Math.abs((inputs.budgetMultiplier - 1) * 100).toFixed(0)}%`);
  if (inputs.timelineMultiplier !== 1)
    levers.push(`timeline ${inputs.timelineMultiplier > 1 ? "longer" : "shorter"}`);

  const direction = custChange >= 0 ? "grows" : "shrinks";
  const romasNote =
    sim.romas >= 3
      ? "That keeps return on marketing spend healthy."
      : sim.romas >= 1
      ? "Return on marketing spend stays positive but tighter — watch efficiency."
      : "Return on marketing spend drops below 1×, meaning you'd spend more than you earn back in this window.";

  return (
    `With ${levers.join(", ")}, your customer base ${direction} ${Math.abs(custChange).toFixed(0)}% ` +
    `(${formatNumber(sim.customers)} customers) and projected revenue moves ${revChange >= 0 ? "up" : "down"} ` +
    `${Math.abs(revChange).toFixed(0)}% to ${formatCurrency(sim.totalRevenue, { compact: true })}. ` +
    `Break-even lands around ${sim.breakEvenMonths ? sim.breakEvenMonths.toFixed(1) + " months" : "—"}. ${romasNote}`
  );
}
