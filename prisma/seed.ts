import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_CLERK_ID = "seed_demo_exportops";
const DEMO_EMAIL = "demo@exportops.local";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      category: "C",
      regime: "MONOTRIBUTO",
      categoryCeilingArs: new Prisma.Decimal(11_379_236.74),
    },
    create: {
      clerkId: DEMO_CLERK_ID,
      email: DEMO_EMAIL,
      category: "C",
      regime: "MONOTRIBUTO",
      categoryCeilingArs: new Prisma.Decimal(11_379_236.74),
    },
  });

  await prisma.alertEvent.deleteMany({ where: { userId: user.id } });
  await prisma.income.deleteMany({ where: { userId: user.id } });
  await prisma.client.deleteMany({ where: { userId: user.id } });

  const acme = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Acme Remote LLC",
      country: "US",
      currency: "USD",
      channel: "Wise",
      notes: "Contrato mensual, demo seed",
    },
  });

  const berlin = await prisma.client.create({
    data: {
      userId: user.id,
      name: "Berlin Design Studio",
      country: "DE",
      currency: "EUR",
      channel: "Payoneer",
    },
  });

  const incomes = [
    {
      clientId: acme.id,
      earnedAt: new Date("2025-09-15T15:00:00.000Z"),
      amountForeign: 1200,
      currency: "USD",
      bnaRate: 980,
      description: "Sprint Sept",
      invoiced: true,
    },
    {
      clientId: acme.id,
      earnedAt: new Date("2026-01-10T15:00:00.000Z"),
      amountForeign: 1500,
      currency: "USD",
      bnaRate: 1050,
      description: "Retainer Ene",
      invoiced: true,
    },
    {
      clientId: berlin.id,
      earnedAt: new Date("2026-03-20T15:00:00.000Z"),
      amountForeign: 800,
      currency: "EUR",
      bnaRate: 1140,
      description: "UI kit delivery",
      invoiced: false,
    },
    {
      clientId: acme.id,
      earnedAt: new Date("2026-06-05T15:00:00.000Z"),
      amountForeign: 2000,
      currency: "USD",
      bnaRate: 1200,
      description: "Feature pack Jun",
      invoiced: false,
    },
    {
      clientId: null as string | null,
      earnedAt: new Date("2026-07-12T15:00:00.000Z"),
      amountForeign: 500,
      currency: "USD",
      bnaRate: 1480,
      description: "One-off consult",
      invoiced: false,
    },
  ];

  for (const row of incomes) {
    const amountArs = new Prisma.Decimal(row.amountForeign).mul(row.bnaRate);
    await prisma.income.create({
      data: {
        userId: user.id,
        clientId: row.clientId,
        earnedAt: row.earnedAt,
        amountForeign: new Prisma.Decimal(row.amountForeign),
        currency: row.currency,
        amountArs,
        bnaRate: new Prisma.Decimal(row.bnaRate),
        description: row.description,
        invoiced: row.invoiced,
        source: "manual",
      },
    });
  }

  // Lower tope so demo seed sits ~82% → CEILING_PCT 80 is active for banner QA.
  const rollup = await prisma.income.aggregate({
    where: {
      userId: user.id,
      earnedAt: {
        gte: new Date(
          Date.UTC(
            new Date().getUTCFullYear() - 1,
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
          ),
        ),
      },
    },
    _sum: { amountArs: true },
  });

  const rolling = Number(rollup._sum.amountArs ?? 0);
  const demoCeiling =
    rolling > 0
      ? new Prisma.Decimal((rolling / 0.82).toFixed(2))
      : new Prisma.Decimal(11_379_236.74);

  await prisma.user.update({
    where: { id: user.id },
    data: { categoryCeilingArs: demoCeiling },
  });

  const pct =
    Number(demoCeiling) > 0
      ? Math.round((rolling / Number(demoCeiling)) * 1000) / 10
      : 0;

  if (pct >= 80) {
    await prisma.alertEvent.create({
      data: {
        userId: user.id,
        kind: "CEILING_PCT",
        threshold: 80,
        channel: "in_app",
        payload: {
          pctOfCeiling: pct,
          accumulatedArs: rolling.toFixed(2),
          ceilingArs: demoCeiling.toFixed(2),
          category: "C",
          source: "seed",
        },
      },
    });
  }
  if (pct >= 95) {
    await prisma.alertEvent.create({
      data: {
        userId: user.id,
        kind: "CEILING_PCT",
        threshold: 95,
        channel: "in_app",
        payload: {
          pctOfCeiling: pct,
          accumulatedArs: rolling.toFixed(2),
          ceilingArs: demoCeiling.toFixed(2),
          category: "C",
          source: "seed",
        },
      },
    });
  }

  console.log("Seed OK");
  console.log({
    userId: user.id,
    email: user.email,
    clients: 2,
    incomes: incomes.length,
    rolling12mArs: rollup._sum.amountArs?.toString() ?? "0",
    categoryCeilingArs: demoCeiling.toFixed(2),
    pctOfCeiling: pct,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
