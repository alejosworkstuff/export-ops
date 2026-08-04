import {
  AlertKind,
  Prisma,
  type AlertEvent,
} from "@/generated/prisma/client";
import {
  crossedCeilingThresholds,
  cycleThresholdFromDateKey,
  isInRecategorizationWindow,
  RECATEGORIZATION_WINDOW_DAYS,
} from "@/lib/alerts-rules";
import { prisma } from "@/lib/db";
import { sumRolling12MonthsArs } from "@/lib/income-rollup";
import {
  nextRecategorization,
  type RecategorizationCountdown,
} from "@/lib/recategorization";
import { computeRunway, type RunwaySnapshot } from "@/lib/runway";

export {
  CEILING_THRESHOLDS,
  crossedCeilingThresholds,
  cycleThresholdFromDateKey,
  isInRecategorizationWindow,
  RECATEGORIZATION_WINDOW_DAYS,
  type CeilingThreshold,
} from "@/lib/alerts-rules";

export type ActiveAlert = {
  id: string;
  kind: AlertKind;
  threshold: number;
  severity: "warn" | "danger";
  title: string;
  body: string;
};

async function createAlertIfAbsent(input: {
  userId: string;
  kind: AlertKind;
  threshold: number;
  payload: Prisma.InputJsonValue;
}): Promise<AlertEvent | null> {
  const existing = await prisma.alertEvent.findUnique({
    where: {
      userId_kind_threshold: {
        userId: input.userId,
        kind: input.kind,
        threshold: input.threshold,
      },
    },
  });
  if (existing) return null;

  try {
    return await prisma.alertEvent.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        threshold: input.threshold,
        channel: "in_app",
        payload: input.payload,
      },
    });
  } catch (err) {
    // Race: another request inserted the same unique key.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Persist AlertEvents for crossed ceilings + approaching Jan/Jul window.
 * Idempotent per (userId, kind, threshold).
 */
export async function evaluateAndPersistAlerts(
  userId: string,
  now = new Date(),
): Promise<{
  runway: RunwaySnapshot;
  countdown: RecategorizationCountdown;
  created: AlertEvent[];
}> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { categoryCeilingArs: true, category: true },
  });

  const accumulated = await sumRolling12MonthsArs(userId, now);
  const runway = computeRunway(accumulated, user.categoryCeilingArs);
  const countdown = nextRecategorization(now);
  const created: AlertEvent[] = [];

  for (const threshold of crossedCeilingThresholds(runway.pctOfCeiling)) {
    const event = await createAlertIfAbsent({
      userId,
      kind: AlertKind.CEILING_PCT,
      threshold,
      payload: {
        pctOfCeiling: runway.pctOfCeiling,
        accumulatedArs: runway.accumulatedArs.toFixed(2),
        ceilingArs: runway.ceilingArs.toFixed(2),
        category: user.category,
      },
    });
    if (event) created.push(event);
  }

  if (isInRecategorizationWindow(countdown.daysRemaining)) {
    const threshold = cycleThresholdFromDateKey(countdown.nextDateKey);
    const event = await createAlertIfAbsent({
      userId,
      kind: AlertKind.RECATEGORIZATION_WINDOW,
      threshold,
      payload: {
        nextDateKey: countdown.nextDateKey,
        label: countdown.label,
        daysRemaining: countdown.daysRemaining,
        windowDays: RECATEGORIZATION_WINDOW_DAYS,
      },
    });
    if (event) created.push(event);
  }

  return { runway, countdown, created };
}

/**
 * Clear ceiling alerts when the user changes tope/categoría so thresholds
 * can fire again against the new baseline.
 */
export async function resetCeilingAlerts(userId: string): Promise<void> {
  await prisma.alertEvent.deleteMany({
    where: { userId, kind: AlertKind.CEILING_PCT },
  });
}

function formatCeilingAlert(event: AlertEvent, pct: number): ActiveAlert {
  const severity = event.threshold >= 95 ? "danger" : "warn";
  const pctLabel = pct.toLocaleString("es-AR", { maximumFractionDigits: 1 });
  return {
    id: event.id,
    kind: event.kind,
    threshold: event.threshold,
    severity,
    title:
      event.threshold >= 95
        ? `Alerta crítica: ${event.threshold}% del tope`
        : `Alerta: ${event.threshold}% del tope`,
    body: `Tu acumulado de 12 meses está en ${pctLabel}% del tope declarado. Revisá el runway antes de seguir facturando.`,
  };
}

function formatRecategorizationAlert(
  event: AlertEvent,
  countdown: RecategorizationCountdown,
): ActiveAlert {
  const days =
    countdown.daysRemaining === 0
      ? "hoy"
      : countdown.daysRemaining === 1
        ? "1 día"
        : `${countdown.daysRemaining.toLocaleString("es-AR")} días`;
  return {
    id: event.id,
    kind: event.kind,
    threshold: event.threshold,
    severity: countdown.daysRemaining <= 14 ? "danger" : "warn",
    title: "Ventana de recategorización",
    body: `Faltan ${days} para el ${countdown.label}. Revisá tu categoría y tope antes de la fecha.`,
  };
}

/**
 * Alerts that should surface in the dashboard banner right now.
 * Call after evaluateAndPersistAlerts so new crossings are persisted.
 */
export async function getActiveAlerts(
  userId: string,
  now = new Date(),
): Promise<ActiveAlert[]> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { categoryCeilingArs: true },
  });
  const accumulated = await sumRolling12MonthsArs(userId, now);
  const runway = computeRunway(accumulated, user.categoryCeilingArs);
  const countdown = nextRecategorization(now);
  const cycleThreshold = cycleThresholdFromDateKey(countdown.nextDateKey);

  const events = await prisma.alertEvent.findMany({
    where: { userId },
    orderBy: [{ kind: "asc" }, { threshold: "desc" }],
  });

  const active: ActiveAlert[] = [];

  for (const event of events) {
    if (event.kind === AlertKind.CEILING_PCT) {
      if (
        runway.pctOfCeiling !== null &&
        runway.pctOfCeiling >= event.threshold
      ) {
        active.push(formatCeilingAlert(event, runway.pctOfCeiling));
      }
      continue;
    }

    if (
      event.kind === AlertKind.RECATEGORIZATION_WINDOW &&
      event.threshold === cycleThreshold &&
      isInRecategorizationWindow(countdown.daysRemaining)
    ) {
      active.push(formatRecategorizationAlert(event, countdown));
    }
  }

  // Prefer critical ceiling → warn ceiling → recategorization
  active.sort((a, b) => {
    const rank = (x: ActiveAlert) => {
      if (x.kind === AlertKind.CEILING_PCT && x.threshold >= 95) return 0;
      if (x.kind === AlertKind.CEILING_PCT) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  return active;
}
