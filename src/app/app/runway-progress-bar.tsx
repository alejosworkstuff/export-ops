type RunwayProgressBarProps = {
  /** % of category ceiling; null when tope unset. */
  pctOfCeiling: number | null;
};

function fillClass(pct: number): string {
  if (pct >= 95) return "bg-red-600";
  if (pct >= 80) return "bg-amber-500";
  return "bg-zinc-800";
}

/**
 * Visual runway bar with 80% / 95% zone markers.
 * No AlertEvent yet — Day 7 owns real alerts.
 */
export function RunwayProgressBar({ pctOfCeiling }: RunwayProgressBarProps) {
  if (pctOfCeiling === null) {
    return (
      <p className="text-sm text-zinc-600" role="status">
        La barra de progreso aparece cuando declarás un tope.
      </p>
    );
  }

  const fill = Math.min(Math.max(pctOfCeiling, 0), 100);
  const overCeiling = pctOfCeiling > 100;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Progreso vs tope
        </p>
        <p className="text-xs tabular-nums text-zinc-600">
          {pctOfCeiling.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%
          {overCeiling ? " (sobre tope)" : null}
        </p>
      </div>

      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
        aria-label="Porcentaje del tope de categoría"
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] ${fillClass(pctOfCeiling)}`}
          style={{ width: `${fill}%` }}
        />
        {/* Zone markers at 80% and 95% of the track */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-zinc-400/80"
          style={{ left: "80%" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-zinc-500"
          style={{ left: "95%" }}
          aria-hidden
        />
      </div>

      <div className="relative h-4 text-[10px] text-zinc-500">
        <span className="absolute left-0">0%</span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: "80%" }}
        >
          80%
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: "95%" }}
        >
          95%
        </span>
        <span className="absolute right-0">100%</span>
      </div>
    </div>
  );
}
