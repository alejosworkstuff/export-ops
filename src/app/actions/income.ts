"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getBnaVendedorRate, toArDateKey, type BnaCurrency } from "@/lib/bna";
import { prisma } from "@/lib/db";
import { ensureLocalUser } from "@/lib/ensure-local-user";

const createIncomeSchema = z.object({
  amountForeign: z.coerce.number().positive("El monto debe ser positivo"),
  currency: z.enum(["USD", "EUR"]).default("USD"),
  earnedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  description: z.string().trim().max(500).optional(),
  clientId: z.string().cuid().optional().nullable(),
  invoiced: z.boolean().optional().default(false),
  /** Paste BNA vendedor when fetch is unavailable (esp. EUR histórico). */
  manualBnaRate: z.coerce.number().positive().optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;

export type CreateIncomeResult =
  | { ok: true; incomeId: string; amountArs: string; bnaRate: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

/** Noon AR calendar day → stable UTC Date for earnedAt storage. */
function earnedAtFromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T15:00:00.000Z`);
}

export async function createIncome(
  raw: CreateIncomeInput,
): Promise<CreateIncomeResult> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { ok: false, error: "No autenticado" };
  }

  const parsed = createIncomeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { ok: false, error: "Usuario sin email" };
  }

  const user = await ensureLocalUser(clerkId, email);
  const dateKey = toArDateKey(data.earnedAt);

  if (data.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, userId: user.id },
      select: { id: true },
    });
    if (!client) {
      return { ok: false, error: "Cliente no encontrado" };
    }
  }

  let bna;
  try {
    bna = await getBnaVendedorRate({
      date: dateKey,
      currency: data.currency as BnaCurrency,
      manualRate: data.manualBnaRate,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al obtener BNA",
    };
  }

  const amountArs = new Prisma.Decimal(data.amountForeign).mul(bna.rate);

  const income = await prisma.income.create({
    data: {
      userId: user.id,
      clientId: data.clientId ?? null,
      earnedAt: earnedAtFromDateKey(dateKey),
      amountForeign: new Prisma.Decimal(data.amountForeign),
      currency: data.currency,
      amountArs,
      bnaRate: new Prisma.Decimal(bna.rate),
      description: data.description || null,
      invoiced: data.invoiced ?? false,
      source: "manual",
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/ingresos");

  return {
    ok: true,
    incomeId: income.id,
    amountArs: amountArs.toFixed(2),
    bnaRate: bna.rate.toFixed(4),
  };
}
