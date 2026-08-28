import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export function rolling12MonthsStart(now = new Date()): Date {
  const start = new Date(now);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return start;
}

export async function sumRolling12MonthsArs(userId: string, now = new Date()) {
  const result = await prisma.income.aggregate({
    where: {
      userId,
      earnedAt: { gte: rolling12MonthsStart(now) },
    },
    _sum: { amountArs: true },
  });

  return result._sum.amountArs ?? new Prisma.Decimal(0);
}
