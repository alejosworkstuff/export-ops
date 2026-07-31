import type { MonthlyArsPoint } from "@/lib/monthly-rollup";
import { arsFmt } from "./ingresos/ui";

type MonthlyChartProps = {
  points: MonthlyArsPoint[];
};

export function MonthlyChart({ points }: MonthlyChartProps) {
  const max = Math.max(...points.map((p) => p.amountArs), 0);
  const hasAny = max > 0;

  return (
    <section
      className="eo-panel space-y-5"
      aria-labelledby="monthly-chart-heading"
    >
      <div>
        <h2 id="monthly-chart-heading" className="eo-panel-title">
          Ingresos por mes
        </h2>
        <p className="eo-panel-desc">
          Últimos 12 meses (ARS @ BNA). Barras CSS — sin librería de charts.
        </p>
      </div>

      {!hasAny ? (
        <p className="text-sm text-[var(--eo-muted)]" role="status">
          Todavía no hay ingresos en la ventana de 12 meses.
        </p>
      ) : (
        <div className="space-y-3">
          <div
            className="flex h-44 items-end gap-1.5 sm:gap-2"
            role="img"
            aria-label="Barras de ingresos mensuales en ARS"
          >
            {points.map((p, i) => {
              const pct = max > 0 ? (p.amountArs / max) * 100 : 0;
              const height = p.amountArs > 0 ? Math.max(pct, 4) : 0;
              return (
                <div
                  key={p.monthKey}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className="eo-chart-bar"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 40}ms`,
                    }}
                    title={`${p.label}: ${arsFmt.format(p.amountArs)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            {points.map((p) => (
              <div
                key={`${p.monthKey}-label`}
                className="min-w-0 flex-1 text-center"
              >
                <span className="block truncate text-[10px] capitalize leading-tight text-[var(--eo-muted)] sm:text-xs">
                  {p.label.replace(".", "")}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--eo-muted)]">
            Máximo del período:{" "}
            <span className="eo-stat text-sm">
              {arsFmt.format(max)}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
