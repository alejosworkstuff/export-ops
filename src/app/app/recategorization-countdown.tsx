import type { RecategorizationCountdown } from "@/lib/recategorization";

type RecategorizationCountdownProps = {
  countdown: RecategorizationCountdown;
};

function daysLabel(days: number): string {
  if (days === 0) return "Hoy";
  if (days === 1) return "1 día";
  return `${days.toLocaleString("es-AR")} días`;
}

export function RecategorizationCountdownSection({
  countdown,
}: RecategorizationCountdownProps) {
  const { label, daysRemaining } = countdown;

  return (
    <section className="eo-panel space-y-5" aria-labelledby="recat-heading">
      <div>
        <h2 id="recat-heading" className="eo-panel-title">
          Próxima recategorización
        </h2>
        <p className="eo-panel-desc">
          En Monotributo se revisa el 1 de enero y el 1 de julio.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1 rounded-xl bg-[var(--eo-accent-soft)] px-4 py-3">
          <p className="eo-meta">Fecha</p>
          <p className="eo-stat text-xl capitalize sm:text-2xl">{label}</p>
        </div>
        <div className="space-y-1 rounded-xl bg-[rgba(12,18,34,0.04)] px-4 py-3">
          <p className="eo-meta">Faltan</p>
          <p
            className="eo-stat text-3xl text-[var(--eo-accent-deep)] sm:text-4xl"
            aria-label={`${daysLabel(daysRemaining)} hasta ${label}`}
          >
            {daysLabel(daysRemaining)}
          </p>
        </div>
      </div>
    </section>
  );
}
