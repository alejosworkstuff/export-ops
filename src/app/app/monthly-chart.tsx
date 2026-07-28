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
      className="space-y-4 border-t border-zinc-200 pt-6"
      aria-labelledby="monthly-chart-heading"
    >
      <div>
        <h2
          id="monthly-chart-heading"
          className="text-lg font-medium text-zinc-900"
        >
          Ingresos por mes
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Últimos 12 meses (ARS @ BNA). Sin librería de charts — barras CSS.
        </p>
      </div>

      {!hasAny ? (
        <p className="text-sm text-zinc-600" role="status">
          Todavía no hay ingresos en la ventana de 12 meses.
        </p>
      ) : (
        <div className="space-y-2">
          <div
            className="flex h-40 items-end gap-1.5 sm:gap-2"
            role="img"
            aria-label="Barras de ingresos mensuales en ARS"
          >
            {points.map((p) => {
              const pct = max > 0 ? (p.amountArs / max) * 100 : 0;
              const height = p.amountArs > 0 ? Math.max(pct, 4) : 0;
              return (
                <div
                  key={p.monthKey}
                  className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className="w-full rounded-t-sm bg-zinc-800"
                    style={{ height: `${height}%` }}
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
                <span className="block truncate text-[10px] capitalize leading-tight text-zinc-500 sm:text-xs">
                  {p.label.replace(".", "")}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Máximo del período:{" "}
            <span className="font-medium text-zinc-700">
              {arsFmt.format(max)}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
