// Lightweight, static visual preview of the dashboard for the hero section.
// Pure CSS/SVG so the landing page stays fast (no chart library needed here).

const bars = [64, 88, 52, 96, 74, 60];

export function DashboardPreview() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 text-xs font-medium text-slate-400">
          gtm-strategy / dashboard
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {[
          { k: "Target Customers", v: "312" },
          { k: "Blended CAC", v: "$32" },
          { k: "LTV : CAC", v: "5.6x" },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {s.k}
            </div>
            <div className="mt-1 text-xl font-bold text-slate-900">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 px-4 pb-4 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 p-3 sm:col-span-3">
          <div className="mb-2 text-xs font-medium text-slate-500">
            Channel performance
          </div>
          <div className="flex h-24 items-end gap-2">
            {bars.map((b, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-brand-500"
                style={{ height: `${b}%`, opacity: 0.55 + i * 0.07 }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
          <div className="mb-2 text-xs font-medium text-slate-500">Budget mix</div>
          <div className="space-y-2">
            {[
              { l: "Content & SEO", w: 25 },
              { l: "Paid Social", w: 34 },
              { l: "Outbound", w: 25 },
              { l: "PLG", w: 16 },
            ].map((r) => (
              <div key={r.l}>
                <div className="mb-0.5 flex justify-between text-[10px] text-slate-500">
                  <span>{r.l}</span>
                  <span>{r.w}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-400"
                    style={{ width: `${r.w}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
