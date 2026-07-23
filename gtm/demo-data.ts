import type { StrategyInput } from "./types";

export interface DemoProduct {
  id: string;
  label: string;
  tagline: string;
  input: StrategyInput;
}

// One-click sample startups used on the landing page and inside the form.
export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "fintech",
    label: "FinTech",
    tagline: "Cash-flow forecasting for small businesses",
    input: {
      productName: "CashHorizon",
      productDescription:
        "A cash-flow forecasting platform that helps small businesses predict runway, model scenarios, and avoid cash crunches with automated bank-feed syncing.",
      category: "FinTech",
      targetCustomer: "Small-business owners and finance managers",
      geography: "United States",
      businessModel: "B2B SaaS",
      budget: 10000,
      timelineMonths: 6,
    },
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    tagline: "Sustainable D2C skincare brand",
    input: {
      productName: "Verdant Skin",
      productDescription:
        "A sustainable direct-to-consumer skincare brand with refillable packaging and clinically-backed clean formulations for everyday routines.",
      category: "E-commerce",
      targetCustomer: "Environmentally conscious consumers",
      geography: "United States & Canada",
      businessModel: "D2C",
      budget: 25000,
      timelineMonths: 12,
    },
  },
  {
    id: "hrtech",
    label: "HR Technology",
    tagline: "AI employee onboarding assistant",
    input: {
      productName: "Onboardly",
      productDescription:
        "An AI onboarding assistant that automates new-hire paperwork, schedules training, and answers employee questions so HR teams can scale onboarding without adding headcount.",
      category: "HR Technology",
      targetCustomer: "HR leaders at mid-market companies",
      geography: "North America & UK",
      businessModel: "B2B SaaS",
      budget: 50000,
      timelineMonths: 18,
    },
  },
];

export const DEFAULT_INPUT: StrategyInput = {
  productName: "",
  productDescription: "",
  category: "FinTech",
  targetCustomer: "",
  geography: "United States",
  businessModel: "B2B SaaS",
  budget: 15000,
  timelineMonths: 9,
};
