import Link from "next/link";
import { Rocket } from "lucide-react";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Rocket className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold text-slate-900">
            GTM Strategy Simulator
          </span>
        </Link>
        {cta ? (
          <Link href="/strategy" className="btn-primary !px-4 !py-2 text-sm">
            Build My GTM Strategy
          </Link>
        ) : null}
      </div>
    </header>
  );
}
