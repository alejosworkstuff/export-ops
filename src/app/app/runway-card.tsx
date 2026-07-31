import type { MonoCategory } from "@/generated/prisma/enums";
import type { RunwaySnapshot } from "@/lib/runway";
import { arsFmt } from "./ingresos/ui";
import { RunwayProgressBar } from "./runway-progress-bar";

type RunwayCardProps = {
  category: MonoCategory;
  runway: RunwaySnapshot;
};

function pctTone(pct: number): string {
  if (pct >= 95) return "text-[var(--eo-danger)]";
  if (pct >= 80) return "text-[var(--eo-warn)]";
  return "text-[var(--eo-ink)]";
}

export function RunwayCard({ category, runway }: RunwayCardProps) {
  const { accumulatedArs, ceilingArs, pctOfCeiling } = runway;
  const hasCeiling = pctOfCeiling !== null;

  return (
    <section className="eo-panel space-y-5" aria-labelledby="runway-heading">
      <div>
        <h2 id="runway-heading" className="eo-panel-title">
          Runway 12 meses
        </h2>
        <p className="eo-panel-desc">
          Acumulado rolling vs tope declarado (categoría {category}).
        </p>
      </div>

      {!hasCeiling ? (
        <p className="text-sm text-[var(--eo-muted)]" role="status">
          Declará un tope arriba para ver el % de categoría. Acumulado actual:{" "}
          <span className="eo-stat text-base">
            {arsFmt.format(Number(accumulatedArs))}
          </span>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="eo-meta">Acumulado 12m</p>
            <p className="eo-stat text-xl sm:text-2xl">
              {arsFmt.format(Number(accumulatedArs))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="eo-meta">Tope (cat. {category})</p>
            <p className="eo-stat text-xl sm:text-2xl">
              {arsFmt.format(Number(ceilingArs))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="eo-meta">% de categoría</p>
            <p
              className={`eo-stat text-3xl sm:text-4xl ${pctTone(pctOfCeiling)}`}
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
