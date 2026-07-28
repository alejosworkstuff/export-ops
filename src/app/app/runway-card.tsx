import type { MonoCategory } from "@/generated/prisma/enums";
import type { RunwaySnapshot } from "@/lib/runway";
import { arsFmt } from "./ingresos/ui";
import { RunwayProgressBar } from "./runway-progress-bar";

type RunwayCardProps = {
  category: MonoCategory;
  runway: RunwaySnapshot;
};

function pctTone(pct: number): string {
  if (pct >= 95) return "text-red-700";
  if (pct >= 80) return "text-amber-700";
  return "text-zinc-900";
}

export function RunwayCard({ category, runway }: RunwayCardProps) {
  const { accumulatedArs, ceilingArs, pctOfCeiling } = runway;
  const hasCeiling = pctOfCeiling !== null;

  return (
    <section
      className="space-y-4 border-t border-zinc-200 pt-6"
      aria-labelledby="runway-heading"
    >
      <div>
        <h2
          id="runway-heading"
          className="text-lg font-medium text-zinc-900"
        >
          Runway 12 meses
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Acumulado rolling vs tope declarado (categoría {category}).
        </p>
      </div>

      {!hasCeiling ? (
        <p className="text-sm text-zinc-600" role="status">
          Declará un tope arriba para ver el % de categoría. Acumulado actual:{" "}
          <span className="font-medium text-zinc-900">
            {arsFmt.format(Number(accumulatedArs))}
          </span>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Acumulado 12m
            </p>
            <p className="text-xl font-semibold tabular-nums text-zinc-900">
              {arsFmt.format(Number(accumulatedArs))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Tope (cat. {category})
            </p>
            <p className="text-xl font-semibold tabular-nums text-zinc-900">
              {arsFmt.format(Number(ceilingArs))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              % de categoría
            </p>
            <p
              className={`text-3xl font-semibold tabular-nums tracking-tight ${pctTone(pctOfCeiling)}`}
            >
              {pctOfCeiling.toLocaleString("es-AR", {
                maximumFractionDigits: 1,
              })}
              %
            </p>
          </div>
        </div>
      )}

      <RunwayProgressBar pctOfCeiling={pctOfCeiling} />
    </section>
  );
}
