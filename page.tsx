import Link from "next/link";
import {
  ArrowRight,
  Target,
  Sliders,
  FileDown,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { DEMO_PRODUCTS } from "@/lib/gtm/demo-data";

const FEATURES = [
  {
    icon: Target,
    title: "AI-style GTM strategy",
    body: "Get personas, channels, budget splits, funnel forecasts, KPIs, risks, and a 90-day roadmap — generated from your inputs.",
  },
  {
    icon: Sliders,
    title: "What-if simulator",
    body: "Move CAC, conversion, budget, and timeline sliders and watch customers, revenue, ROMAS, and break-even update instantly.",
  },
  {
    icon: FileDown,
    title: "Export-ready report",
    body: "Turn the whole plan into a clean, print-optimized PDF for your deck, your co-founder, or your next investor update.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader cta={false} />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="badge bg-brand-50 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Go-to-market, simulated
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Simulate your startup&apos;s go-to-market strategy before spending
              your first marketing dollar.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Founders waste months and thousands of dollars guessing at channels,
              budgets, and personas. Enter your idea and get a structured,
              testable GTM plan — plus a live simulator to pressure-test it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/strategy" className="btn-primary">
                Build My GTM Strategy <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-slate-500">
                No signup. No API keys. Works instantly.
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-500" /> Buyer personas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-brand-500" /> Funnel forecasts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-4 w-4 text-brand-500" /> Channel mix
              </span>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-pad">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo product selector */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="card card-pad">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Try it with a sample startup
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Load a ready-made profile and generate a full strategy in one click.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {DEMO_PRODUCTS.map((d) => (
              <Link
                key={d.id}
                href={`/strategy?demo=${d.id}&auto=1`}
                className="group flex flex-col rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-cardHover"
              >
                <span className="badge bg-slate-100 text-slate-600">{d.label}</span>
                <span className="mt-3 font-semibold text-slate-900">
                  {d.input.productName}
                </span>
                <span className="mt-1 text-sm text-slate-600">{d.tagline}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                  Generate strategy
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="no-print border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-slate-500">
          GTM Strategy Simulator — a planning simulation. Projections are
          estimates, not guarantees.
        </div>
      </footer>
    </div>
  );
}
