export const CEILING_THRESHOLDS = [80, 95] as const;
export type CeilingThreshold = (typeof CEILING_THRESHOLDS)[number];

/** Days before 1 ene / 1 jul when RECATEGORIZATION_WINDOW fires. */
export const RECATEGORIZATION_WINDOW_DAYS = 45;

/** Pure: which ceiling % thresholds are crossed (inclusive). */
export function crossedCeilingThresholds(
  pctOfCeiling: number | null,
): CeilingThreshold[] {
  if (pctOfCeiling === null) return [];
  return CEILING_THRESHOLDS.filter((t) => pctOfCeiling >= t);
}

/** Pure: encode next deadline YYYY-MM-DD → YYYYMM int for idempotent cycles. */
export function cycleThresholdFromDateKey(dateKey: string): number {
  const [y, m] = dateKey.split("-").map(Number);
  return y * 100 + m;
}

/** Pure: whether we're inside the approaching-window for Jan/Jul. */
export function isInRecategorizationWindow(
  daysRemaining: number,
  windowDays = RECATEGORIZATION_WINDOW_DAYS,
): boolean {
  return daysRemaining >= 0 && daysRemaining <= windowDays;
}
