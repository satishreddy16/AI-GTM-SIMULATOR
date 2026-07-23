// ---------------------------------------------------------------------------
// Provider abstraction for GTM strategy generation.
//
// The app supports two modes, chosen by the GTM_PROVIDER env var:
//   - "mock" (DEFAULT): fully offline, deterministic, no keys required.
//   - "live": calls an external model provider (Simular AI or any
//     OpenAI-compatible endpoint). This is the ONE isolated integration point.
//
// The demo NEVER depends on the live provider: if anything is missing or the
// call fails, we transparently fall back to mock so the flow always works.
// ---------------------------------------------------------------------------

import { generateMockStrategy } from "./mock-generator";
import { gtmStrategySchema } from "./validation";
import type { GTMStrategy, StrategyInput } from "./types";

export type Provider = "mock" | "live";

export function activeProvider(): Provider {
  return process.env.GTM_PROVIDER === "live" ? "live" : "mock";
}

export async function generateStrategy(input: StrategyInput): Promise<GTMStrategy> {
  if (activeProvider() === "live") {
    try {
      const live = await generateLiveStrategy(input);
      if (live) return live;
    } catch (err) {
      // Never let a live failure break the demo — log and fall through to mock.
      console.error("[gtm] live provider failed, falling back to mock:", err);
    }
  }
  return generateMockStrategy(input);
}

// ---------------------------------------------------------------------------
// LIVE PROVIDER INTEGRATION POINT
// ---------------------------------------------------------------------------
// This is the single place to wire in Simular AI or another model. Configure
// via env vars (see .env.example). The response is validated with Zod against
// the exact same schema the mock uses, so the UI never has to branch.
//
// To enable: set GTM_PROVIDER=live and provide GTM_AI_BASE_URL / GTM_AI_API_KEY
// / GTM_AI_MODEL, then complete the request/response mapping below.
// ---------------------------------------------------------------------------
async function generateLiveStrategy(input: StrategyInput): Promise<GTMStrategy | null> {
  const baseUrl = process.env.GTM_AI_BASE_URL;
  const apiKey = process.env.GTM_AI_API_KEY;
  const model = process.env.GTM_AI_MODEL;

  if (!baseUrl || !apiKey || !model) {
    console.warn("[gtm] live provider selected but credentials are missing — using mock.");
    return null;
  }

  const prompt = buildPrompt(input);

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a GTM strategist. Respond with ONLY valid JSON matching the requested schema. No prose.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`Live provider HTTP ${res.status}`);

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Live provider returned no content");

  const parsed = JSON.parse(content);
  // Seed required server-side fields the model may omit, then validate strictly.
  const candidate = {
    id: `gtm_live_${Date.now().toString(36)}`,
    generatedAt: new Date().toISOString(),
    provider: "live" as const,
    input,
    ...parsed,
  };

  const result = gtmStrategySchema.safeParse(candidate);
  if (!result.success) {
    console.error("[gtm] live response failed validation:", result.error.flatten());
    return null; // fall back to mock rather than render bad data
  }
  return result.data as GTMStrategy;
}

function buildPrompt(input: StrategyInput): string {
  return [
    "Generate a go-to-market strategy as JSON with these keys:",
    "executiveSummary (string), primaryMarket (string),",
    "marketPositioning {category, valueProposition, differentiators[]},",
    "personas[] {name, role, demographics, goals[], painPoints[], preferredChannels[], quote},",
    "channels[] {name, allocationPct, budget, expectedCac, rationale, effort},",
    "budgetAllocation[] {category, amount, pct}, funnel {impressions, visitors, leads, customers, conversionRate},",
    "averageCustomerValue (number), kpis[] {label, value, hint}, roadmap[] {phase, title, focus, milestones[]},",
    "experiments[] {name, hypothesis, metric, effort}, risks[] {title, severity, mitigation}, assumptions[].",
    "Constraints: channel allocationPct values sum to 100; channel budgets sum to the total budget; funnel stages decrease.",
    "",
    `INPUT: ${JSON.stringify(input)}`,
  ].join("\n");
}
