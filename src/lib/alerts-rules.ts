export const CEILING_THRESHOLDS = [80, 95] as const;
export type CeilingThreshold = (typeof CEILING_THRESHOLDS)[number];

export const RECATEGORIZATION_WINDOW_DAYS = 45;

export function crossedCeilingThresholds(
  pctOfCeiling: number | null,
): CeilingThreshold[] {
  if (pctOfCeiling === null) return [];
  return CEILING_THRESHOLDS.filter((t) => pctOfCeiling >= t);
}

export function cycleThresholdFromDateKey(dateKey: string): number {
  const [y, m] = dateKey.split("-").map(Number);
  return y * 100 + m;
}

export function isInRecategorizationWindow(
  daysRemaining: number,
  windowDays = RECATEGORIZATION_WINDOW_DAYS,
): boolean {
  return daysRemaining >= 0 && daysRemaining <= windowDays;
}
