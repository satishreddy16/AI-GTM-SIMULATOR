"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  FileDown,
  RotateCcw,
  Target,
  Users,
  Megaphone,
  PieChart as PieIcon,
  Filter,
  Map as MapIcon,
  ListChecks,
  FlaskConical,
  ShieldAlert,
  Quote,
  Info,
} from "lucide-react";
import type { GTMStrategy } from "@/lib/gtm/types";
import { formatCurrency, formatNumber, formatPct } from "@/lib/utils";
import { Card, SectionHeading, Badge, ProgressBar, Disclaimer } from "@/components/ui/primitives";
import { ScenarioSimulator } from "@/components/scenario-simulator/ScenarioSimulator";

const CHART_COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#3730a3"];
// Static classes so Tailwind's JIT can see them (no runtime string building).
const FUNNEL_BAR_COLORS = ["bg-brand-700", "bg-brand-600", "bg-brand-500", "bg-brand-400"];

export function StrategyDashboard({
  strategy,
  onReset,
}: {
  strategy: GTMStrategy;
  onReset: () => void;
}) {
  const s = strategy;

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{s.input.productName}</h1>
            <Badge tone="brand">{s.input.category}</Badge>
            <Badge tone="slate">{s.provider === "live" ? "Live AI" : "Simulated"}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {s.input.businessModel} · {formatCurrency(s.input.budget)} budget ·{" "}
            {s.input.timelineMonths} months · {s.input.geography}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="btn-secondary text-sm">
            <RotateCcw className="h-4 w-4" /> New strategy
          </button>
          <button onClick={() => window.print()} className="btn-primary text-sm">
            <FileDown className="h-4 w-4" /> Export / Save as PDF
          </button>
        </div>
      </div>

      <Disclaimer className="no-print" />

      {/* Executive summary + positioning */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-pad lg:col-span-2">
          <SectionHeading
            icon={<Target className="h-5 w-5" />}
            title="Executive Summary"
          />
          <p className="text-[15px] leading-relaxed text-slate-700">{s.executiveSummary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <MapIcon className="h-3.5 w-3.5" /> Primary Market
              </div>
              <div className="mt-1 font-semibold text-slate-900">{s.primaryMarket}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Value Proposition
              </div>
              <div className="mt-1 text-sm font-medium text-slate-800">
                {s.marketPositioning.valueProposition}
              </div>
            </div>
          </div>
        </Card>

        <Card className="card-pad">
          <SectionHeading title="Differentiators" />
          <ul className="space-y-2.5">
            {s.marketPositioning.differentiators.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {d}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {s.kpis.map((k) => (
          <Card key={k.label} className="card-pad">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {k.label}
            </div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900">{k.value}</div>
            <div className="mt-0.5 text-xs text-slate-500">{k.hint}</div>
          </Card>
        ))}
      </div>

      {/* Personas */}
      <Card className="card-pad">
        <SectionHeading
          icon={<Users className="h-5 w-5" />}
          title="Buyer Personas"
          subtitle="Who you are selling to, and what moves them."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {s.personas.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{p.name}</div>
                <Badge tone="brand">{p.role.split("/")[0].trim()}</Badge>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">{p.demographics}</div>

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-sm italic text-slate-600">
                <Quote className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-400" />
                {p.quote}
              </div>

              <PersonaList title="Goals" items={p.goals} />
              <PersonaList title="Pain points" items={p.painPoints} />
              <div className="mt-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reach them on
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.preferredChannels.map((c) => (
                    <Badge key={c} tone="slate">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Channels + budget */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-pad">
          <SectionHeading
            icon={<Megaphone className="h-5 w-5" />}
            title="Recommended Channel Mix"
            subtitle="Budget share and expected CAC by channel."
          />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={s.channels.map((c) => ({ name: shortName(c.name), pct: c.allocationPct }))}
                margin={{ top: 5, right: 10, left: -18, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} cursor={{ fill: "#eef2ff" }} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {s.channels.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 font-medium">Channel</th>
                  <th className="py-2 text-right font-medium">Budget</th>
                  <th className="py-2 text-right font-medium">CAC</th>
                  <th className="py-2 text-right font-medium">Effort</th>
                </tr>
              </thead>
              <tbody>
                {s.channels.map((c) => (
                  <tr key={c.name} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-2 font-medium text-slate-800">{c.name}</td>
                    <td className="py-2 text-right text-slate-700">
                      {formatCurrency(c.budget)}{" "}
                      <span className="text-slate-400">({c.allocationPct}%)</span>
                    </td>
                    <td className="py-2 text-right text-slate-700">{formatCurrency(c.expectedCac)}</td>
                    <td className="py-2 text-right">
                      <Badge tone={effortTone(c.effort)}>{c.effort}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="card-pad">
          <SectionHeading
            icon={<PieIcon className="h-5 w-5" />}
            title="Budget Allocation"
            subtitle={`Totals ${formatCurrency(s.input.budget)} across the launch.`}
          />
          <div className="grid items-center gap-4 sm:grid-cols-2">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={s.budgetAllocation}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {s.budgetAllocation.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {s.budgetAllocation.map((b, i) => (
                <div key={b.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      {b.category}
                    </span>
                    <span className="font-medium text-slate-900">{formatCurrency(b.amount)}</span>
                  </div>
                  <ProgressBar value={b.pct} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="card-pad">
        <SectionHeading
          icon={<Filter className="h-5 w-5" />}
          title="Funnel Forecast"
          subtitle={`Visitor→customer conversion ~${formatPct(s.funnel.conversionRate, 2)}.`}
        />
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Impressions", value: s.funnel.impressions },
            { label: "Visitors", value: s.funnel.visitors },
            { label: "Leads", value: s.funnel.leads },
            { label: "Customers", value: s.funnel.customers },
          ].map((stage, i, arr) => {
            const max = arr[0].value || 1;
            return (
              <div key={stage.label} className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {stage.label}
                </div>
                <div className="mt-1 text-xl font-bold text-slate-900">
                  {formatNumber(stage.value)}
                </div>
                <ProgressBar
                  className="mt-3"
                  value={(stage.value / max) * 100}
                  barClassName={FUNNEL_BAR_COLORS[i]}
                />
                {i > 0 ? (
                  <div className="mt-1.5 text-xs text-slate-500">
                    {formatPct((stage.value / arr[i - 1].value) * 100, 1)} of previous
                  </div>
                ) : (
                  <div className="mt-1.5 text-xs text-slate-500">top of funnel</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Scenario simulator */}
      <ScenarioSimulator strategy={s} />

      {/* Roadmap */}
      <Card className="card-pad">
        <SectionHeading
          icon={<ListChecks className="h-5 w-5" />}
          title="90-Day Execution Roadmap"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {s.roadmap.map((phase) => (
            <div key={phase.phase} className="rounded-xl border border-slate-200 p-4">
              <Badge tone="brand">{phase.phase}</Badge>
              <div className="mt-2 font-semibold text-slate-900">{phase.title}</div>
              <div className="mt-0.5 text-sm text-slate-500">{phase.focus}</div>
              <ul className="mt-3 space-y-2">
                {phase.milestones.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Risks + experiments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-pad">
          <SectionHeading
            icon={<ShieldAlert className="h-5 w-5" />}
            title="Key Risks"
          />
          <div className="space-y-3">
            {s.risks.map((r) => (
              <div key={r.title} className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{r.title}</span>
                  <Badge tone={r.severity}>{r.severity}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{r.mitigation}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="card-pad">
          <SectionHeading
            icon={<FlaskConical className="h-5 w-5" />}
            title="Recommended Experiments"
          />
          <div className="space-y-3">
            {s.experiments.map((e) => (
              <div key={e.name} className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{e.name}</span>
                  <Badge tone={effortTone(e.effort)}>{e.effort} effort</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{e.hypothesis}</p>
                <p className="mt-1 text-xs text-slate-400">Measure: {e.metric}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Assumptions */}
      <Card className="card-pad">
        <SectionHeading icon={<Info className="h-5 w-5" />} title="Key Assumptions" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {s.assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-slate-300" />
              {a}
            </li>
          ))}
        </ul>
      </Card>

      <p className="pb-8 text-center text-xs text-slate-400">
        Generated {new Date(s.generatedAt).toLocaleString()} · Simulation for planning
        purposes only.
      </p>
    </div>
  );
}

function PersonaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-slate-400" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function shortName(name: string): string {
  return name.length > 16 ? name.slice(0, 15) + "…" : name;
}

function effortTone(effort: "Low" | "Medium" | "High"): "emerald" | "Medium" | "High" {
  return effort === "Low" ? "emerald" : effort;
}
