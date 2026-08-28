type RunwayProgressBarProps = {
  pctOfCeiling: number | null;
};

function fillTone(pct: number): string {
  if (pct >= 95) return "eo-progress-fill--danger";
  if (pct >= 80) return "eo-progress-fill--warn";
  return "eo-progress-fill--ok";
}

export function RunwayProgressBar({ pctOfCeiling }: RunwayProgressBarProps) {
  if (pctOfCeiling === null) {
    return (
      <p className="text-sm text-[var(--eo-muted)]" role="status">
        La barra de progreso aparece cuando declarás un tope.
      </p>
    );
  }

  const fill = Math.min(Math.max(pctOfCeiling, 0), 100);
  const overCeiling = pctOfCeiling > 100;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="eo-meta">Progreso vs tope</p>
        <p className="text-xs tabular-nums text-[var(--eo-muted)]">
          {pctOfCeiling.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%
          {overCeiling ? " (sobre tope)" : null}
        </p>
      </div>

      <div
        className="eo-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fill)}
        aria-label="Porcentaje del tope de categoría"
      >
        <div
          className={`eo-progress-fill ${fillTone(pctOfCeiling)}`}
          style={{ width: `${fill}%` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[rgba(12,18,34,0.28)]"
          style={{ left: "80%" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[rgba(12,18,34,0.4)]"
          style={{ left: "95%" }}
          aria-hidden
        />
      </div>

      <div className="relative h-4 text-[10px] text-[var(--eo-muted)]">
        <span className="absolute left-0">0%</span>
        <span className="absolute -translate-x-1/2" style={{ left: "80%" }}>
          80%
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: "95%" }}>
          95%
        </span>
        <span className="absolute right-0">100%</span>
      </div>
    </div>
  );
}
