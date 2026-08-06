import { toArDateKey } from "@/lib/bna";

export type RecategorizationCountdown = {
  /** Next 1 Jan or 1 Jul as YYYY-MM-DD (AR calendar). */
  nextDateKey: string;
  /** Human label es-AR, e.g. "1 de julio de 2026". */
  label: string;
  /** Whole calendar days from today (AR) to nextDateKey. 0 = today. */
  daysRemaining: number;
};

const DEADLINE_MONTHS = [1, 7] as const; // January, July

function parseDateKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

/** UTC noon for a calendar key, stable day-diff without DST quirks. */
function utcNoonFromKey(key: string): Date {
  const { y, m, d } = parseDateKey(key);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function formatEsArLabel(key: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcNoonFromKey(key));
}

function daysBetweenKeys(fromKey: string, toKey: string): number {
  const ms =
    utcNoonFromKey(toKey).getTime() - utcNoonFromKey(fromKey).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/**
 * Next Monotributo recategorization checkpoint: 1 Jan or 1 Jul (AR calendar).
 * Pure, no DB. AlertEvent for the window: lib/alerts.
 */
export function nextRecategorization(now = new Date()): RecategorizationCountdown {
  const todayKey = toArDateKey(now);
  const { y, m, d } = parseDateKey(todayKey);

  let nextY = y;
  let nextM: (typeof DEADLINE_MONTHS)[number] | null = null;

  for (const month of DEADLINE_MONTHS) {
    if (m < month || (m === month && d <= 1)) {
      nextM = month;
      break;
    }
  }

  if (nextM === null) {
    nextY = y + 1;
    nextM = 1;
  }

  const nextDateKey = `${nextY}-${String(nextM).padStart(2, "0")}-01`;

  return {
    nextDateKey,
    label: formatEsArLabel(nextDateKey),
    daysRemaining: daysBetweenKeys(todayKey, nextDateKey),
  };
}
