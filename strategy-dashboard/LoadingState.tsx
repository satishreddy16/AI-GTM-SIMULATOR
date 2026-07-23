import { Loader2 } from "lucide-react";

// Skeleton shown while the strategy is generating.
export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="card card-pad flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        <div>
          <div className="font-semibold text-slate-900">
            Simulating your go-to-market strategy…
          </div>
          <div className="text-sm text-slate-500">
            Modeling personas, channels, funnel, and budget allocation.
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card card-pad">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer mt-3 h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card card-pad">
            <div className="shimmer h-4 w-40 rounded" />
            <div className="shimmer mt-4 h-40 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
