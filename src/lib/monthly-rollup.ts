import { Prisma } from "@/generated/prisma/client";
import { toArDateKey } from "@/lib/bna";
import { prisma } from "@/lib/db";
import { rolling12MonthsStart } from "@/lib/income-rollup";

export type MonthlyArsPoint = {
  /** YYYY-MM in America/Argentina/Buenos_Aires */
  monthKey: string;
  /** Short es-AR label, e.g. "jul 26" */
  label: string;
  amountArs: number;
};

function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

/** Last 12 calendar months ending at `now` (AR), oldest → newest. */
export function rolling12MonthKeys(now = new Date()): string[] {
  const todayKey = toArDateKey(now);
  const [yStr, mStr] = todayKey.split("-");
  let y = Number(yStr);
  let m = Number(mStr);

  const keys: string[] = [];
  for (let i = 0; i < 12; i++) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return keys.reverse();
}

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Monthly SUM(amountArs) for the rolling 12 calendar months (AR), zero-filled.
 * No chart lib, callers render CSS/SVG bars.
 */
export async function monthlyRolling12MonthsArs(
  userId: string,
  now = new Date(),
): Promise<MonthlyArsPoint[]> {
  const keys = rolling12MonthKeys(now);
  const rows = await prisma.income.findMany({
    where: {
      userId,
      earnedAt: { gte: rolling12MonthsStart(now) },
    },
    select: { earnedAt: true, amountArs: true },
  });

  const sums = new Map<string, Prisma.Decimal>();
  for (const key of keys) {
    sums.set(key, new Prisma.Decimal(0));
  }

  for (const row of rows) {
    const key = monthKeyFromDateKey(toArDateKey(row.earnedAt));
    if (!sums.has(key)) continue;
    sums.set(key, (sums.get(key) ?? new Prisma.Decimal(0)).add(row.amountArs));
  }

  return keys.map((monthKey) => ({
    monthKey,
    label: monthLabel(monthKey),
    amountArs: Number(sums.get(monthKey) ?? 0),
  }));
}
