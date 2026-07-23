# GTM Strategy Simulator

**Simulate your startup's go-to-market strategy before spending your first
marketing dollar.**

A founder enters their product idea, category, customer, geography, budget,
timeline, and business model. The app instantly generates a structured GTM
strategy — executive summary, buyer personas, recommended channel mix, budget
allocation, funnel forecast, KPIs, a 90-day roadmap, risks, and experiments —
and a live **what-if simulator** to pressure-test the plan. Export the whole
thing to PDF from the browser.

Works fully offline in **mock mode** with **no API keys**.

---

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Requires Node 18.17+ (Node 20/22 recommended).

---

## Demo script (2 minutes)

1. Open the landing page. Note the value prop and the dashboard preview.
2. Under **"Try it with a sample startup"**, click **FinTech** → the app
   auto-fills and generates a full strategy.
3. Walk the dashboard: executive summary → KPI cards → personas → channel mix &
   budget → funnel forecast.
4. In **What-If Scenario Simulator**, drag **Conversion rate** up and **Budget**
   up (or click the *Aggressive growth* preset). Watch customers, revenue,
   ROMAS, and break-even recalculate instantly, with a plain-language read-out.
5. Click **Export / Save as PDF** → the browser print dialog opens a clean
   report (navigation and controls hidden).
6. Click **New strategy** and enter a custom product to show it isn't canned.

Try all three samples — **FinTech ($10k/6mo)**, **E-commerce ($25k/12mo)**,
**HR-Tech ($50k/18mo)** — each produces a meaningfully different plan.

---

## How it works

- **Form → API → Dashboard.** The form (`react-hook-form` + Zod) posts to
  `POST /api/generate-strategy`, which validates and returns a `GTMStrategy`.
- **Deterministic mock generator** (`lib/gtm/mock-generator.ts`) builds a
  realistic, input-driven plan: channel playbooks per business model, CAC
  anchored by model + category, a funnel derived from step-through rates, and
  budget/channel splits that **always total exactly the submitted budget** and
  **100%**.
- **All financial math lives in `lib/gtm/calculations.ts`** — the same module
  powers both the dashboard and the scenario simulator, so they never drift.
- **Scenario simulator** applies four multipliers (CAC, conversion, budget,
  timeline) to a baseline and recomputes customers, leads, conversion, revenue,
  ROMAS, and break-even, with a baseline-vs-scenario chart.

### Key assumptions (stated in-app)
Budget = total launch-period marketing spend · CAC = spend ÷ customers ·
revenue uses an explicit average customer value · channel allocations total
100% · funnel stages decrease. **All projections are simulated estimates, not
guarantees** — a disclaimer is shown in the app.

---

## Mock vs. live AI

Mock mode is the default and needs no configuration. To wire a real model,
copy `.env.example` to `.env.local` and set:

```
GTM_PROVIDER=live
GTM_AI_BASE_URL=<OpenAI-compatible base url, e.g. Simular AI>
GTM_AI_API_KEY=<key>
GTM_AI_MODEL=<model id>
```

The live integration is isolated in `lib/gtm/generator.ts`
(`generateLiveStrategy`). Live responses are validated against the same Zod
schema as mock output, and **any failure automatically falls back to mock** —
the demo never depends on an external API.

---

## Tech stack
Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS, Zod,
React Hook Form, Recharts, lucide-react.

## Scripts
| command | purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | production build + serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js lint |

## Known limitations
- Projections are heuristic estimates for planning, not financial forecasts.
- Strategy lives in client state (no persistence); refreshing the dashboard
  returns to the form. This keeps the demo dependency-free.
- PDF export uses the browser print dialog with print-optimized CSS (reliable
  and library-free). "Save as PDF" as the print destination gives the best result.
- Offline builds skip Google Fonts optimization; Inter loads at runtime with a
  system-font fallback.
