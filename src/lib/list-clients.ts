import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type ClientListRow = {
  id: string;
  name: string;
  country: string | null;
  currency: string;
  channel: string | null;
  notes: string | null;
  incomeCount: number;
  totalArs: Prisma.Decimal;
};

export type ClientDetail = {
  id: string;
  name: string;
  country: string | null;
  currency: string;
  channel: string | null;
  notes: string | null;
  createdAt: Date;
  totalArs: Prisma.Decimal;
  incomes: {
    id: string;
    earnedAt: Date;
    amountForeign: Prisma.Decimal;
    currency: string;
    amountArs: Prisma.Decimal;
    description: string | null;
    invoiced: boolean;
  }[];
};

/**
 * Clients for a user with income count + SUM(amountArs), name ASC.
 */
export async function listClientsWithTotals(
  userId: string,
): Promise<ClientListRow[]> {
  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      country: true,
      currency: true,
      channel: true,
      notes: true,
      incomes: {
        select: { amountArs: true },
      },
    },
  });

  return clients.map((c) => {
    const totalArs = c.incomes.reduce(
      (acc, row) => acc.add(row.amountArs),
      new Prisma.Decimal(0),
    );
    return {
      id: c.id,
      name: c.name,
      country: c.country,
      currency: c.currency,
      channel: c.channel,
      notes: c.notes,
      incomeCount: c.incomes.length,
      totalArs,
    };
  });
}

export async function getClientDetail(
  userId: string,
  clientId: string,
): Promise<ClientDetail | null> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
    select: {
      id: true,
      name: true,
      country: true,
      currency: true,
      channel: true,
      notes: true,
      createdAt: true,
      incomes: {
        orderBy: [{ earnedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          earnedAt: true,
          amountForeign: true,
          currency: true,
          amountArs: true,
          description: true,
          invoiced: true,
        },
      },
    },
  });

  if (!client) return null;

  const totalArs = client.incomes.reduce(
    (acc, row) => acc.add(row.amountArs),
    new Prisma.Decimal(0),
  );

  return {
    id: client.id,
    name: client.name,
    country: client.country,
    currency: client.currency,
    channel: client.channel,
    notes: client.notes,
    createdAt: client.createdAt,
    totalArs,
    incomes: client.incomes,
  };
}
