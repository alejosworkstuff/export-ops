import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export const INCOME_PAGE_SIZE = 10;

export type IncomeListRow = {
  id: string;
  earnedAt: Date;
  amountForeign: Prisma.Decimal;
  currency: string;
  amountArs: Prisma.Decimal;
  bnaRate: Prisma.Decimal;
  description: string | null;
  invoiced: boolean;
  clientId: string | null;
  client: { name: string } | null;
};

export type IncomeListPage = {
  rows: IncomeListRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalArs: Prisma.Decimal;
};

function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export type ListIncomesOptions = {
  clientId?: string | null;
};

export async function listIncomesPage(
  userId: string,
  pageRaw: number,
  options: ListIncomesOptions = {},
): Promise<IncomeListPage> {
  const where: { userId: string; clientId?: string } = { userId };
  if (options.clientId) {
    where.clientId = options.clientId;
  }

  const [totalCount, aggregate] = await Promise.all([
    prisma.income.count({ where }),
    prisma.income.aggregate({ where, _sum: { amountArs: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / INCOME_PAGE_SIZE));
  const page = clampPage(
    Number.isFinite(pageRaw) ? Math.trunc(pageRaw) : 1,
    totalPages,
  );

  const rows = await prisma.income.findMany({
    where,
    orderBy: [{ earnedAt: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * INCOME_PAGE_SIZE,
    take: INCOME_PAGE_SIZE,
    select: {
      id: true,
      earnedAt: true,
      amountForeign: true,
      currency: true,
      amountArs: true,
      bnaRate: true,
      description: true,
      invoiced: true,
      clientId: true,
      client: { select: { name: true } },
    },
  });

  return {
    rows,
    page,
    pageSize: INCOME_PAGE_SIZE,
    totalCount,
    totalPages: totalCount === 0 ? 0 : totalPages,
    totalArs: aggregate._sum.amountArs ?? new Prisma.Decimal(0),
  };
}
