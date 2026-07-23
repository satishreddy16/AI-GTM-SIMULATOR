// Core data contract for the GTM Strategy Simulator.
// This schema is IDENTICAL for mock and live-AI modes so the UI never has to branch.

export type BusinessModel =
  | "B2B SaaS"
  | "D2C"
  | "Marketplace"
  | "B2B Services"
  | "Freemium";

export type ProductCategory =
  | "FinTech"
  | "E-commerce"
  | "HR Technology"
  | "Developer Tools"
  | "Healthcare"
  | "Marketing"
  | "Productivity"
  | "Other";

export interface StrategyInput {
  productName: string;
  productDescription: string;
  category: ProductCategory;
  targetCustomer: string;
  geography: string;
  businessModel: BusinessModel;
  budget: number; // total launch-period marketing spend, USD
  timelineMonths: number;
}

export interface Persona {
  name: string;
  role: string;
  demographics: string;
  goals: string[];
  painPoints: string[];
  preferredChannels: string[];
  quote: string;
}

export interface ChannelRecommendation {
  name: string;
  allocationPct: number; // percentage of budget, all channels sum to 100
  budget: number; // dollars, all channels sum to input.budget
  expectedCac: number; // estimated cost to acquire one customer via this channel
  rationale: string;
  effort: "Low" | "Medium" | "High";
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  pct: number;
}

export interface Funnel {
  impressions: number;
  visitors: number;
  leads: number;
  customers: number;
  conversionRate: number; // visitors -> customers, as a percentage
}

export interface KPI {
  label: string;
  value: string;
  hint: string;
}

export interface RoadmapPhase {
  phase: string; // e.g. "Days 1-30"
  title: string;
  focus: string;
  milestones: string[];
}

export interface Experiment {
  name: string;
  hypothesis: string;
  metric: string;
  effort: "Low" | "Medium" | "High";
}

export interface Risk {
  title: string;
  severity: "Low" | "Medium" | "High";
  mitigation: string;
}

export interface MarketPositioning {
  category: string;
  valueProposition: string;
  differentiators: string[];
}

export interface GTMStrategy {
  id: string;
  generatedAt: string;
  provider: "mock" | "live";
  input: StrategyInput;
  executiveSummary: string;
  primaryMarket: string;
  marketPositioning: MarketPositioning;
  personas: Persona[];
  channels: ChannelRecommendation[];
  budgetAllocation: BudgetAllocation[];
  funnel: Funnel;
  averageCustomerValue: number; // used for all revenue math, stated explicitly
  kpis: KPI[];
  roadmap: RoadmapPhase[];
  experiments: Experiment[];
  risks: Risk[];
  assumptions: string[];
}

// ---- Scenario simulator ----

export interface ScenarioInputs {
  cacMultiplier: number; // 1.0 = baseline
  conversionMultiplier: number; // 1.0 = baseline
  budgetMultiplier: number; // 1.0 = baseline
  timelineMultiplier: number; // 1.0 = baseline
}

export interface ScenarioResult {
  budget: number;
  cac: number;
  leads: number;
  customers: number;
  conversionRate: number; // percentage
  monthlyRevenue: number;
  totalRevenue: number;
  romas: number; // return on marketing spend (revenue / spend)
  breakEvenMonths: number | null;
}
