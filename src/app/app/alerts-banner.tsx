import type { ActiveAlert } from "@/lib/alerts";

type AlertsBannerProps = {
  alerts: ActiveAlert[];
};

function toneClasses(severity: ActiveAlert["severity"]): string {
  if (severity === "danger") {
    return "border-[var(--eo-danger)]/30 bg-[var(--eo-danger-soft)] text-[var(--eo-danger)]";
  }
  return "border-[var(--eo-warn)]/35 bg-[var(--eo-warn-soft)] text-[var(--eo-warn)]";
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3" role="region" aria-label="Alertas activas">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-[var(--eo-radius)] border px-4 py-3 ${toneClasses(alert.severity)}`}
          role="alert"
        >
          <p className="eo-font-display text-sm font-semibold tracking-tight">
            {alert.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{alert.body}</p>
        </div>
      ))}
    </div>
  );
}
