import { Prisma } from "@/generated/prisma/client";

export type RunwaySnapshot = {
  accumulatedArs: Prisma.Decimal;
  ceilingArs: Prisma.Decimal;
  pctOfCeiling: number | null;
};

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
