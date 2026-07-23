"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { StrategyForm } from "@/components/strategy-form/StrategyForm";
import { LoadingState } from "@/components/strategy-dashboard/LoadingState";
import { StrategyDashboard } from "@/components/strategy-dashboard/StrategyDashboard";
import type { GTMStrategy } from "@/lib/gtm/types";
import type { StrategyInputSchema } from "@/lib/gtm/validation";
import { DEMO_PRODUCTS } from "@/lib/gtm/demo-data";

type View = "form" | "loading" | "result" | "error";

function StrategyExperience() {
  const params = useSearchParams();
  const demoId = params.get("demo");
  const auto = params.get("auto") === "1";

  const demo = DEMO_PRODUCTS.find((d) => d.id === demoId);
  const [initial, setInitial] = useState<StrategyInputSchema | undefined>(
    demo?.input as StrategyInputSchema | undefined
  );
  const [view, setView] = useState<View>("form");
  const [strategy, setStrategy] = useState<GTMStrategy | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const autoFired = useRef(false);

  const runGeneration = useCallback(async (data: StrategyInputSchema) => {
    setView("loading");
    setErrorMsg("");
    // Small deliberate delay so the loading state is visible in the demo.
    const started = Date.now();
    try {
      const res = await fetch("/api/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = await res.json();
      if (!json.strategy) throw new Error("No strategy returned.");
      const elapsed = Date.now() - started;
      if (elapsed < 700) await new Promise((r) => setTimeout(r, 700 - elapsed));
      setStrategy(json.strategy as GTMStrategy);
      setView("result");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setView("error");
    }
  }, []);

  // Auto-generate when arriving from a landing-page sample link.
  useEffect(() => {
    if (auto && demo && !autoFired.current) {
      autoFired.current = true;
      setInitial(demo.input as StrategyInputSchema);
      runGeneration(demo.input as StrategyInputSchema);
    }
  }, [auto, demo, runGeneration]);

  const reset = () => {
    setStrategy(null);
    setView("form");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader cta={false} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {view === "form" && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                Build your GTM strategy
              </h1>
              <p className="mt-1 text-slate-600">
                Tell us about your product. We&apos;ll simulate a full go-to-market
                plan in seconds — no API keys needed.
              </p>
            </div>
            <div className="card card-pad">
              <StrategyForm initial={initial} submitting={false} onSubmit={runGeneration} />
            </div>
          </div>
        )}

        {view === "loading" && <LoadingState />}

        {view === "error" && (
          <div className="mx-auto max-w-lg">
            <div className="card card-pad text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                We couldn&apos;t generate that strategy
              </h2>
              <p className="mt-1 text-sm text-slate-600">{errorMsg}</p>
              <button onClick={reset} className="btn-primary mx-auto mt-5">
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
            </div>
          </div>
        )}

        {view === "result" && strategy && (
          <StrategyDashboard strategy={strategy} onReset={reset} />
        )}
      </main>
    </div>
  );
}

export default function StrategyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StrategyExperience />
    </Suspense>
  );
}
