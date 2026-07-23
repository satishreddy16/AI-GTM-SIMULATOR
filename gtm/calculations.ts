// ---------------------------------------------------------------------------
// GTM calculations — the single source of truth for all financial math.
// Every number in the dashboard and the scenario simulator flows through here.
// Formulas are intentionally simple and internally consistent so they are easy
// to explain live. They are estimates, NOT guarantees.
// ---------------------------------------------------------------------------

import type {
  BusinessModel,
  GTMStrategy,
  ProductCategory,
  ScenarioInputs,
  ScenarioResult,
  StrategyInput,
} from "./types";

// Baseline blended CAC (cost to acquire one customer) by business model, in USD.
// These are rough industry-informed anchors used to keep the sim realistic.
export const BASE_CAC: Record<BusinessModel, number> = {
  "B2B SaaS": 320,
  "D2C": 45,
  "Marketplace": 60,
  "B2B Services": 500,
  "Freemium": 90,
};

// Average revenue per customer over the launch period (first-year value), USD.
// Explicitly defined so all revenue projections are transparent.
export const BASE_CUSTOMER_VALUE: Record<BusinessModel, number> = {
  "B2B SaaS": 1800,
  "D2C": 120,
  "Marketplace": 240,
  "B2B Services": 6000,
  "Freemium": 300,
};

// Category nudges the CAC up or down slightly (competitive / regulated markets
// cost more to break into).
const CATEGORY_CAC_FACTOR: Record<ProductCategory, number> = {
  FinTech: 1.15,
  "E-commerce": 0.9,
  "HR Technology": 1.1,
  "Developer Tools": 0.85,
  Healthcare: 1.25,
  Marketing: 1.0,
  Productivity: 0.95,
  Other: 1.0,
};

// Assumed step-through rates for the acquisition funnel.
// impressions -> visitors -> leads -> customers.
export const FUNNEL_RATES = {
  impressionToVisitor: 0.02, // 2% CTR
  visitorToLead: 0.12, // 12% of visitors become leads
  leadToCustomer: 0.15, // 15% of leads convert
};

export interface Baseline {
  budget: number;
  cac: number;
  customerValue: number;
  customers: number;
  leads: number;
  visitors: number;
  impressions: number;
  conversionRate: number; // visitor -> customer, percentage
  timelineMonths: number;
}

// Effective CAC for a given input, blending model + category.
export function effectiveCac(input: StrategyInput): number {
  const base = BASE_CAC[input.businessModel] ?? 150;
  return Math.round(base * (CATEGORY_CAC_FACTOR[input.category] ?? 1));
}

// Compute the baseline plan directly from the founder's inputs.
export function computeBaseline(input: StrategyInput): Baseline {
  const cac = effectiveCac(input);
  const customerValue = BASE_CUSTOMER_VALUE[input.businessModel] ?? 300;

  const customers = Math.max(1, Math.round(input.budget / cac));
  const leads = Math.round(customers / FUNNEL_RATES.leadToCustomer);
  const visitors = Math.round(leads / FUNNEL_RATES.visitorToLead);
  const impressions = Math.round(visitors / FUNNEL_RATES.impressionToVisitor);
  const conversionRate = visitors > 0 ? (customers / visitors) * 100 : 0;

  return {
    budget: input.budget,
    cac,
    customerValue,
    customers,
    leads,
    visitors,
    impressions,
    conversionRate,
    timelineMonths: input.timelineMonths,
  };
}

// ---------------------------------------------------------------------------
// Scenario simulation. Applies the four what-if multipliers to a baseline and
// returns a fully consistent projection.
// ---------------------------------------------------------------------------
export function simulateScenario(
  baseline: Baseline,
  s: ScenarioInputs
): ScenarioResult {
  const budget = baseline.budget * s.budgetMultiplier;
  // CAC moves directly with the CAC multiplier and inversely with conversion:
  // a higher conversion rate means each dollar buys more customers.
  const cac = (baseline.cac * s.cacMultiplier) / s.conversionMultiplier;

  const customers = cac > 0 ? Math.round(budget / cac) : 0;
  const leads = Math.round(customers / FUNNEL_RATES.leadToCustomer);
  const visitors = Math.round(leads / FUNNEL_RATES.visitorToLead);
  const conversionRate = visitors > 0 ? (customers / visitors) * 100 : 0;

  const totalRevenue = customers * baseline.customerValue;
  const timelineMonths = Math.max(1, Math.round(baseline.timelineMonths * s.timelineMultiplier));
  const monthlyRevenue = totalRevenue / timelineMonths;

  // Return on marketing spend = revenue generated per dollar spent.
  const romas = budget > 0 ? totalRevenue / budget : 0;

  // Break-even: months of steady monthly revenue needed to recover the spend.
  const breakEvenMonths = monthlyRevenue > 0 ? budget / monthlyRevenue : null;

  return {
    budget,
    cac,
    leads,
    customers,
    conversionRate,
    monthlyRevenue,
    totalRevenue,
    romas,
    breakEvenMonths,
  };
}

// Convenience: the "1.0 across the board" scenario, i.e. the baseline itself.
export const NEUTRAL_SCENARIO: ScenarioInputs = {
  cacMultiplier: 1,
  conversionMultiplier: 1,
  budgetMultiplier: 1,
  timelineMultiplier: 1,
};

// Derive a Baseline object straight from a generated strategy so the simulator
// stays perfectly in sync with what the dashboard shows.
export function baselineFromStrategy(strategy: GTMStrategy): Baseline {
  const f = strategy.funnel;
  const cac = f.customers > 0 ? strategy.input.budget / f.customers : effectiveCac(strategy.input);
  return {
    budget: strategy.input.budget,
    cac,
    customerValue: strategy.averageCustomerValue,
    customers: f.customers,
    leads: f.leads,
    visitors: f.visitors,
    impressions: f.impressions,
    conversionRate: f.conversionRate,
    timelineMonths: strategy.input.timelineMonths,
  };
}
