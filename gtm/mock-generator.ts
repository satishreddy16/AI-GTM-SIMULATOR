// ---------------------------------------------------------------------------
// Deterministic MOCK generator.
// Produces a full, realistic GTMStrategy from the founder's inputs WITHOUT any
// API keys. Given the same input it always returns the same output, but
// different inputs (budget, model, category, geography, timeline) meaningfully
// change the result — it is NOT static boilerplate.
// ---------------------------------------------------------------------------

import {
  BASE_CUSTOMER_VALUE,
  computeBaseline,
  effectiveCac,
} from "./calculations";
import type {
  BudgetAllocation,
  ChannelRecommendation,
  Experiment,
  GTMStrategy,
  KPI,
  Persona,
  Risk,
  RoadmapPhase,
  StrategyInput,
} from "./types";
import { formatCurrency, formatNumber, formatPct } from "../utils";

// Channel playbooks per business model. Weights are relative and get normalized
// to exactly 100% so allocations always total correctly.
const CHANNEL_PLAYBOOK: Record<
  string,
  { name: string; weight: number; cacFactor: number; effort: "Low" | "Medium" | "High"; rationale: string }[]
> = {
  "B2B SaaS": [
    { name: "Content & SEO", weight: 25, cacFactor: 0.7, effort: "Medium", rationale: "Compounding inbound demand from buyers researching solutions." },
    { name: "LinkedIn Ads", weight: 20, cacFactor: 1.3, effort: "Low", rationale: "Precise targeting of job titles and company size for ABM." },
    { name: "Outbound Sales", weight: 25, cacFactor: 1.1, effort: "High", rationale: "Direct pipeline generation for higher-ACV accounts." },
    { name: "Product-led / Free Trial", weight: 18, cacFactor: 0.6, effort: "Medium", rationale: "Let the product sell itself and lower blended CAC." },
    { name: "Webinars & Events", weight: 12, cacFactor: 1.0, effort: "Medium", rationale: "Build authority and warm mid-funnel leads." },
  ],
  "D2C": [
    { name: "Paid Social (Meta/TikTok)", weight: 34, cacFactor: 1.1, effort: "Low", rationale: "Visual products convert well with creative-led social ads." },
    { name: "Influencer & UGC", weight: 24, cacFactor: 0.9, effort: "Medium", rationale: "Authentic social proof drives trial for new brands." },
    { name: "Content & SEO", weight: 14, cacFactor: 0.6, effort: "Medium", rationale: "Capture high-intent search for the category over time." },
    { name: "Email & SMS Retention", weight: 16, cacFactor: 0.4, effort: "Low", rationale: "Repeat purchase economics that lower blended CAC." },
    { name: "Marketplaces (Amazon)", weight: 12, cacFactor: 1.2, effort: "Medium", rationale: "Reach ready-to-buy shoppers where they already are." },
  ],
  "Marketplace": [
    { name: "Paid Search", weight: 26, cacFactor: 1.1, effort: "Low", rationale: "Capture existing demand on both sides of the market." },
    { name: "Content & SEO", weight: 22, cacFactor: 0.6, effort: "Medium", rationale: "Programmatic pages scale supply/demand discovery." },
    { name: "Referrals", weight: 20, cacFactor: 0.5, effort: "Medium", rationale: "Two-sided referral loops compound liquidity cheaply." },
    { name: "Paid Social", weight: 18, cacFactor: 1.2, effort: "Low", rationale: "Seed the harder side of the marketplace." },
    { name: "Partnerships", weight: 14, cacFactor: 0.9, effort: "High", rationale: "Aggregate supply through channel partners." },
  ],
  "B2B Services": [
    { name: "Outbound Sales", weight: 30, cacFactor: 1.1, effort: "High", rationale: "Relationship-led selling fits high-consideration services." },
    { name: "Referrals & Partnerships", weight: 24, cacFactor: 0.6, effort: "Medium", rationale: "Word-of-mouth is the top channel for services." },
    { name: "Content & Thought Leadership", weight: 20, cacFactor: 0.7, effort: "Medium", rationale: "Demonstrate expertise to earn inbound inquiries." },
    { name: "LinkedIn Ads", weight: 16, cacFactor: 1.3, effort: "Low", rationale: "Target decision-makers by role and industry." },
    { name: "Events & Community", weight: 10, cacFactor: 1.0, effort: "Medium", rationale: "Build trust through in-person and niche communities." },
  ],
  "Freemium": [
    { name: "Product-led Growth", weight: 30, cacFactor: 0.4, effort: "Medium", rationale: "Free tier drives viral, low-cost top-of-funnel." },
    { name: "Content & SEO", weight: 24, cacFactor: 0.6, effort: "Medium", rationale: "Capture problem-aware users searching for tools." },
    { name: "Community & Social", weight: 20, cacFactor: 0.7, effort: "Medium", rationale: "Engaged community fuels advocacy and retention." },
    { name: "Paid Social", weight: 16, cacFactor: 1.2, effort: "Low", rationale: "Accelerate signups with targeted campaigns." },
    { name: "Integrations & Partnerships", weight: 10, cacFactor: 0.9, effort: "High", rationale: "Distribution through platforms your users already use." },
  ],
};

function normalizeChannels(
  input: StrategyInput,
  baselineCac: number
): ChannelRecommendation[] {
  const playbook = CHANNEL_PLAYBOOK[input.businessModel] ?? CHANNEL_PLAYBOOK["B2B SaaS"];
  const totalWeight = playbook.reduce((s, c) => s + c.weight, 0);

  // Convert weights to integer percentages that sum to exactly 100.
  const raw = playbook.map((c) => (c.weight / totalWeight) * 100);
  const pcts = largestRemainderRound(raw, 100);

  // Allocate dollars so they sum to exactly the submitted budget.
  const dollars = allocateExact(pcts.map((p) => p / 100), input.budget);

  return playbook.map((c, i) => ({
    name: c.name,
    allocationPct: pcts[i],
    budget: dollars[i],
    expectedCac: Math.round(baselineCac * c.cacFactor),
    rationale: c.rationale,
    effort: c.effort,
  }));
}

// Distribute `total` across weights so the parts sum EXACTLY to total.
function allocateExact(fractions: number[], total: number): number[] {
  const rawAmounts = fractions.map((f) => f * total);
  const rounded = rawAmounts.map((a) => Math.round(a));
  const diff = total - rounded.reduce((s, v) => s + v, 0);
  // Push the rounding remainder onto the largest bucket.
  if (diff !== 0 && rounded.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < rounded.length; i++) if (rounded[i] > rounded[maxIdx]) maxIdx = i;
    rounded[maxIdx] += diff;
  }
  return rounded;
}

// Largest-remainder method: round an array of values so they sum to `target`.
function largestRemainderRound(values: number[], target: number): number[] {
  const floors = values.map((v) => Math.floor(v));
  let remainder = target - floors.reduce((s, v) => s + v, 0);
  const order = values
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++) {
    result[order[k].i] += 1;
    remainder--;
  }
  return result;
}

function buildPersonas(input: StrategyInput): Persona[] {
  const isB2B = input.businessModel.startsWith("B2B") || input.businessModel === "Freemium";
  const geo = input.geography;

  if (isB2B) {
    return [
      {
        name: "Decision-Maker Dana",
        role: "Economic buyer / Department head",
        demographics: `35–50, ${geo}, mid-market to enterprise`,
        goals: ["Hit team targets", "De-risk vendor decisions", "Show clear ROI to leadership"],
        painPoints: ["Too many tools", "Hard to justify new spend", "Slow time-to-value"],
        preferredChannels: ["LinkedIn", "Peer referrals", "Analyst content"],
        quote: `"Show me measurable ROI in one quarter and I'll champion it internally."`,
      },
      {
        name: "Champion Chris",
        role: "Team lead / Power user",
        demographics: `28–42, ${geo}, hands-on operator`,
        goals: ["Save time daily", "Look good to their boss", "Reduce manual busywork"],
        painPoints: ["Manual workflows", "Context switching", "Fear of change management"],
        preferredChannels: ["Product trials", "Communities", "Webinars"],
        quote: `"If it plugs into my stack and just works, I'll roll it out to my team."`,
      },
      {
        name: "Skeptic Sam",
        role: "Finance / Procurement",
        demographics: `40–55, ${geo}, budget gatekeeper`,
        goals: ["Control spend", "Ensure compliance", "Avoid shelfware"],
        painPoints: ["Unclear pricing", "Security/compliance risk", "Overlapping tools"],
        preferredChannels: ["Case studies", "Security docs", "Direct sales"],
        quote: `"Prove the numbers and the security review, then we can talk."`,
      },
    ];
  }

  return [
    {
      name: "Early-Adopter Ella",
      role: "Trend-forward primary buyer",
      demographics: `24–38, ${geo}, urban, digitally native`,
      goals: ["Discover products that match her values", "Feel confident in her purchase", "Share great finds"],
      painPoints: ["Greenwashing skepticism", "Too many lookalike brands", "Wants proof, not hype"],
      preferredChannels: ["Instagram", "TikTok", "Creator reviews"],
      quote: `"I'll pay more for a brand that's genuinely better and backs it up."`,
    },
    {
      name: "Value-Seeker Val",
      role: "Considered repeat buyer",
      demographics: `30–48, ${geo}, suburban household`,
      goals: ["Get quality for the price", "Simplify repurchasing", "Trust the brand long-term"],
      painPoints: ["Price sensitivity", "Subscription fatigue", "Inconsistent quality"],
      preferredChannels: ["Email", "Search", "Marketplaces"],
      quote: `"If it works and the reorder is easy, I'll stick with it for years."`,
    },
    {
      name: "Gifter Gabe",
      role: "Occasional high-intent buyer",
      demographics: `26–45, ${geo}, buys for others`,
      goals: ["Find a memorable gift", "Fast, reliable delivery", "Nice unboxing"],
      painPoints: ["Decision paralysis", "Shipping uncertainty", "Generic options"],
      preferredChannels: ["Paid social", "Influencers", "Gift guides"],
      quote: `"Make it feel special and get it there on time — that's all I need."`,
    },
  ];
}

function buildRoadmap(input: StrategyInput): RoadmapPhase[] {
  return [
    {
      phase: "Days 1–30",
      title: "Foundations & Positioning",
      focus: "Nail the message and instrument everything.",
      milestones: [
        "Finalize ICP, positioning, and core value proposition",
        "Stand up analytics, attribution, and conversion tracking",
        `Launch a focused landing experience for ${input.productName || "the product"}`,
        "Ship 3 cornerstone content pieces / creative concepts",
      ],
    },
    {
      phase: "Days 31–60",
      title: "Channel Validation",
      focus: "Find one or two channels that repeatably convert.",
      milestones: [
        "Run paid + organic tests across top recommended channels",
        "Book first design-partner / early-customer conversations",
        "Establish baseline CAC and conversion benchmarks",
        "Double down on the best-performing channel",
      ],
    },
    {
      phase: "Days 61–90",
      title: "Scale What Works",
      focus: "Turn signal into a repeatable acquisition engine.",
      milestones: [
        "Shift budget toward proven channels; cut underperformers",
        "Launch referral / retention loop to lower blended CAC",
        "Formalize the sales/onboarding motion",
        "Set targets for the next quarter based on real data",
      ],
    },
  ];
}

function buildExperiments(input: StrategyInput): Experiment[] {
  return [
    {
      name: "Value-prop message test",
      hypothesis: `Leading with outcomes (not features) lifts landing conversion for ${input.targetCustomer}.`,
      metric: "Landing page visitor→lead rate",
      effort: "Low",
    },
    {
      name: "Top-channel budget test",
      hypothesis: "One channel will deliver a materially lower CAC than the blended average.",
      metric: "CAC by channel",
      effort: "Medium",
    },
    {
      name: "Pricing / offer test",
      hypothesis: "A starter offer reduces friction and increases activation.",
      metric: "Trial/checkout start rate",
      effort: "Medium",
    },
    {
      name: "Referral loop pilot",
      hypothesis: "Incentivized referrals reduce blended CAC by 15%+.",
      metric: "Referral share of new customers",
      effort: "Low",
    },
  ];
}

function buildRisks(input: StrategyInput): Risk[] {
  const tightBudget = input.budget < 12000;
  const shortTimeline = input.timelineMonths <= 6;
  return [
    {
      title: "CAC runs higher than modeled",
      severity: tightBudget ? "High" : "Medium",
      mitigation: "Start with low-CAC channels, cap paid spend, and require a CAC:LTV signal before scaling.",
    },
    {
      title: "Message–market fit not yet proven",
      severity: "Medium",
      mitigation: "Run message tests in week 1 and interview 10 target customers before scaling spend.",
    },
    {
      title: shortTimeline ? "Timeline too short to find signal" : "Channel saturation over time",
      severity: shortTimeline ? "High" : "Medium",
      mitigation: shortTimeline
        ? "Concentrate budget on 1–2 fast-feedback channels; avoid slow-compounding bets early."
        : "Diversify channels gradually and refresh creative to fight fatigue.",
    },
    {
      title: "Over-reliance on a single channel",
      severity: "Medium",
      mitigation: "Keep a second channel in test at all times so you are never one algorithm change from zero.",
    },
  ];
}

function buildKpis(
  input: StrategyInput,
  customers: number,
  cac: number,
  customerValue: number
): KPI[] {
  const totalRevenue = customers * customerValue;
  const ltvCac = cac > 0 ? customerValue / cac : 0;
  const perMonth = Math.round(customers / Math.max(1, input.timelineMonths));
  return [
    { label: "Target Customers", value: formatNumber(customers), hint: `over ${input.timelineMonths} months` },
    { label: "Blended CAC", value: formatCurrency(cac), hint: "marketing spend ÷ customers" },
    { label: "Avg. Customer Value", value: formatCurrency(customerValue), hint: "first-year, assumed" },
    { label: "LTV : CAC", value: `${ltvCac.toFixed(1)}x`, hint: ltvCac >= 3 ? "healthy (≥3x)" : "watch closely" },
    { label: "Projected Revenue", value: formatCurrency(totalRevenue, { compact: true }), hint: "launch period" },
    { label: "New Customers / mo", value: formatNumber(perMonth), hint: "steady-state pace" },
  ];
}

function buildBudgetAllocation(input: StrategyInput): BudgetAllocation[] {
  // Split of the total budget across working spend vs. enablement.
  const weights: { category: string; w: number }[] = [
    { category: "Paid Acquisition", w: 0.45 },
    { category: "Content & Creative", w: 0.2 },
    { category: "Tools & Analytics", w: 0.1 },
    { category: "Events & Partnerships", w: 0.12 },
    { category: "Experiments & Reserve", w: 0.13 },
  ];
  const amounts = allocateExact(weights.map((x) => x.w), input.budget);
  return weights.map((x, i) => ({
    category: x.category,
    amount: amounts[i],
    pct: Math.round((amounts[i] / input.budget) * 100),
  }));
}

export function generateMockStrategy(input: StrategyInput): GTMStrategy {
  const baseline = computeBaseline(input);
  const cac = effectiveCac(input);
  const customerValue = BASE_CUSTOMER_VALUE[input.businessModel] ?? 300;
  const channels = normalizeChannels(input, cac);

  const differentiatorPool = [
    `Purpose-built for ${input.targetCustomer.toLowerCase()}`,
    "Fast time-to-value with minimal setup",
    `Tailored for the ${input.category} space`,
    "Transparent, outcome-based positioning",
  ];

  const summary =
    `${input.productName || "This product"} is a ${input.businessModel} play in ${input.category} ` +
    `targeting ${input.targetCustomer} across ${input.geography}. With a ${formatCurrency(input.budget)} launch budget over ` +
    `${input.timelineMonths} months, the recommended motion prioritizes ${channels[0].name.toLowerCase()} and ` +
    `${channels[1].name.toLowerCase()}, aiming for roughly ${formatNumber(baseline.customers)} customers at a blended CAC of ` +
    `${formatCurrency(cac)}. The plan front-loads message validation, then concentrates spend on the lowest-CAC channel that shows signal. ` +
    `All figures below are simulated estimates based on stated assumptions, not guarantees.`;

  return {
    id: `gtm_${Date.now().toString(36)}`,
    generatedAt: new Date().toISOString(),
    provider: "mock",
    input,
    executiveSummary: summary,
    primaryMarket: `${input.geography} — ${input.targetCustomer}`,
    marketPositioning: {
      category: input.category,
      valueProposition: `The fastest way for ${input.targetCustomer} to ${
        input.category === "FinTech"
          ? "stay ahead of their cash"
          : input.category === "E-commerce"
          ? "buy products they can trust"
          : "get results without the busywork"
      }.`,
      differentiators: differentiatorPool,
    },
    personas: buildPersonas(input),
    channels,
    budgetAllocation: buildBudgetAllocation(input),
    funnel: {
      impressions: baseline.impressions,
      visitors: baseline.visitors,
      leads: baseline.leads,
      customers: baseline.customers,
      conversionRate: baseline.conversionRate,
    },
    averageCustomerValue: customerValue,
    kpis: buildKpis(input, baseline.customers, cac, customerValue),
    roadmap: buildRoadmap(input),
    experiments: buildExperiments(input),
    risks: buildRisks(input),
    assumptions: [
      `Budget of ${formatCurrency(input.budget)} represents total launch-period marketing spend.`,
      `Blended CAC is modeled at ${formatCurrency(cac)} based on business model and category.`,
      `Average customer value is assumed at ${formatCurrency(customerValue)} for the launch period.`,
      `Funnel step rates: ${formatPct(FUNNEL_RATES_DISPLAY.impressionToVisitor)} CTR, ${formatPct(
        FUNNEL_RATES_DISPLAY.visitorToLead
      )} visitor→lead, ${formatPct(FUNNEL_RATES_DISPLAY.leadToCustomer)} lead→customer.`,
      "Channel allocations total 100% and dollar allocations total the submitted budget.",
      "Projections are directional estimates for planning, not guaranteed outcomes.",
    ],
  };
}

// Display-friendly copies of the funnel rates (as percentages) for assumptions text.
const FUNNEL_RATES_DISPLAY = {
  impressionToVisitor: 2,
  visitorToLead: 12,
  leadToCustomer: 15,
};
