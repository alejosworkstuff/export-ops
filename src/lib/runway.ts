import { Prisma } from "@/generated/prisma/client";

export type RunwaySnapshot = {
  accumulatedArs: Prisma.Decimal;
  ceilingArs: Prisma.Decimal;
  /** null when ceiling is unset (≤ 0), % would be meaningless. */
  pctOfCeiling: number | null;
};

/**
 * Rolling 12m ARS vs user-declared category ceiling.
 * Pure math, no DB. Call after sumRolling12MonthsArs + User.categoryCeilingArs.
 */
export function computeRunway(
  accumulatedArs: Prisma.Decimal,
  ceilingArs: Prisma.Decimal,
): RunwaySnapshot {
  const ceiling = Number(ceilingArs);
  if (!(ceiling > 0)) {
    return {
      accumulatedArs,
      ceilingArs,
      pctOfCeiling: null,
    };
  }

  const pct = (Number(accumulatedArs) / ceiling) * 100;
  return {
    accumulatedArs,
    ceilingArs,
    pctOfCeiling: Math.round(pct * 10) / 10,
  };
}
