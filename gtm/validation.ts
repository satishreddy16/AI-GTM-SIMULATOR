import { z } from "zod";

// Client + server validation for the strategy form.
// Keep messages helpful and human — they render inline under each field.

export const BUSINESS_MODELS = [
  "B2B SaaS",
  "D2C",
  "Marketplace",
  "B2B Services",
  "Freemium",
] as const;

export const CATEGORIES = [
  "FinTech",
  "E-commerce",
  "HR Technology",
  "Developer Tools",
  "Healthcare",
  "Marketing",
  "Productivity",
  "Other",
] as const;

export const strategyInputSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, "Give your product a name (at least 2 characters).")
    .max(80, "Keep the product name under 80 characters."),
  productDescription: z
    .string()
    .trim()
    .min(20, "Describe what your product does in a sentence or two (20+ characters).")
    .max(600, "Keep the description under 600 characters."),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Select a product category." }),
  }),
  targetCustomer: z
    .string()
    .trim()
    .min(3, "Who is this for? Describe your target customer.")
    .max(160, "Keep the target customer under 160 characters."),
  geography: z
    .string()
    .trim()
    .min(2, "Enter a target geography (e.g. United States).")
    .max(80, "Keep the geography under 80 characters."),
  businessModel: z.enum(BUSINESS_MODELS, {
    errorMap: () => ({ message: "Select a business model." }),
  }),
  budget: z
    .number({ invalid_type_error: "Enter your marketing budget in dollars." })
    .min(500, "Budget should be at least $500 for a meaningful plan.")
    .max(100_000_000, "That budget looks too large — double-check the value."),
  timelineMonths: z
    .number({ invalid_type_error: "Enter a timeline in months." })
    .int("Use whole months.")
    .min(1, "Timeline must be at least 1 month.")
    .max(36, "Keep the launch timeline to 36 months or less."),
});

export type StrategyInputSchema = z.infer<typeof strategyInputSchema>;

// Used to validate live-AI responses before rendering. Kept permissive on
// nested arrays but strict on the fields the UI depends on.
export const gtmStrategySchema = z.object({
  id: z.string(),
  generatedAt: z.string(),
  provider: z.enum(["mock", "live"]),
  input: strategyInputSchema,
  executiveSummary: z.string().min(1),
  primaryMarket: z.string().min(1),
  marketPositioning: z.object({
    category: z.string(),
    valueProposition: z.string(),
    differentiators: z.array(z.string()),
  }),
  personas: z.array(z.object({
    name: z.string(),
    role: z.string(),
    demographics: z.string(),
    goals: z.array(z.string()),
    painPoints: z.array(z.string()),
    preferredChannels: z.array(z.string()),
    quote: z.string(),
  })).min(1),
  channels: z.array(z.object({
    name: z.string(),
    allocationPct: z.number(),
    budget: z.number(),
    expectedCac: z.number(),
    rationale: z.string(),
    effort: z.enum(["Low", "Medium", "High"]),
  })).min(1),
  budgetAllocation: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    pct: z.number(),
  })).min(1),
  funnel: z.object({
    impressions: z.number(),
    visitors: z.number(),
    leads: z.number(),
    customers: z.number(),
    conversionRate: z.number(),
  }),
  averageCustomerValue: z.number(),
  kpis: z.array(z.object({ label: z.string(), value: z.string(), hint: z.string() })),
  roadmap: z.array(z.object({
    phase: z.string(),
    title: z.string(),
    focus: z.string(),
    milestones: z.array(z.string()),
  })),
  experiments: z.array(z.object({
    name: z.string(),
    hypothesis: z.string(),
    metric: z.string(),
    effort: z.enum(["Low", "Medium", "High"]),
  })),
  risks: z.array(z.object({
    title: z.string(),
    severity: z.enum(["Low", "Medium", "High"]),
    mitigation: z.string(),
  })),
  assumptions: z.array(z.string()),
});
