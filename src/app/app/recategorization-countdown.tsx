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
    <section
      className="space-y-4 border-t border-zinc-200 pt-6"
      aria-labelledby="recat-heading"
    >
      <div>
        <h2 id="recat-heading" className="text-lg font-medium text-zinc-900">
          Próxima recategorización
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Ventanas Monotributo: 1 de enero y 1 de julio (calendario AR).
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Fecha
          </p>
          <p className="text-xl font-semibold capitalize text-zinc-900">
            {label}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Faltan
          </p>
          <p
            className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900"
            aria-label={`${daysLabel(daysRemaining)} hasta ${label}`}
          >
            {daysLabel(daysRemaining)}
          </p>
        </div>
      </div>
    </section>
  );
}
