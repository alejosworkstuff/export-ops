"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { evaluateAndPersistAlerts } from "@/lib/alerts";
import { getBnaVendedorRate, toArDateKey, type BnaCurrency } from "@/lib/bna";
import { prisma } from "@/lib/db";
import { requireLocalUser } from "@/lib/require-local-user";

const incomeFieldsSchema = z.object({
  amountForeign: z.coerce.number().positive("El monto debe ser positivo"),
  currency: z.enum(["USD", "EUR"]).default("USD"),
  earnedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  description: z.string().trim().max(500).optional(),
  clientId: z.string().cuid().optional().nullable(),
  /** Paste BNA vendedor when fetch is unavailable (esp. EUR histórico). */
  manualBnaRate: z.coerce.number().positive().optional(),
});

const createIncomeSchema = incomeFieldsSchema.extend({
  invoiced: z.boolean().optional().default(false),
});

const updateIncomeSchema = incomeFieldsSchema.extend({
  id: z.string().cuid(),
});

export type IncomeMutationResult =
  | { ok: true; incomeId: string; amountArs: string; bnaRate: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export type CreateIncomeResult = IncomeMutationResult;

export type DeleteIncomeResult =
  | { ok: true }
  | { ok: false; error: string };

/** Noon AR calendar day → stable UTC Date for earnedAt storage. */
function earnedAtFromDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T15:00:00.000Z`);
}

function revalidateIncomePaths(clientId?: string | null) {
  revalidatePath("/app");
  revalidatePath("/app/ingresos");
  revalidatePath("/app/clientes");
  if (clientId) {
    revalidatePath(`/app/clientes/${clientId}`);
  }
}

async function assertClientOwned(
  userId: string,
  clientId: string | null | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!clientId) return { ok: true };

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
    select: { id: true },
  });
  if (!client) {
    return { ok: false, error: "Cliente no encontrado" };
  }
  return { ok: true };
}

async function resolveBna(options: {
  dateKey: string;
  currency: BnaCurrency;
  manualRate?: number;
}): Promise<
  | { ok: true; rate: number }
  | { ok: false; error: string }
> {
  try {
    const bna = await getBnaVendedorRate({
      date: options.dateKey,
      currency: options.currency,
      manualRate: options.manualRate,
    });
    return { ok: true, rate: bna.rate };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al obtener BNA",
    };
  }
}

function parseIncomeFieldsFromFormData(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const manualBnaRate = String(formData.get("manualBnaRate") ?? "").trim();

  return {
    amountForeign: String(formData.get("amountForeign") ?? ""),
    currency: String(formData.get("currency") ?? "USD"),
    earnedAt: String(formData.get("earnedAt") ?? ""),
    description: description || undefined,
    clientId: clientId || null,
    manualBnaRate: manualBnaRate || undefined,
  };
}

export async function createIncome(
  raw: unknown,
): Promise<IncomeMutationResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
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
  const user = authResult.user;
  const dateKey = toArDateKey(data.earnedAt);

  const clientCheck = await assertClientOwned(user.id, data.clientId);
  if (!clientCheck.ok) {
    return { ok: false, error: clientCheck.error };
  }

  const bna = await resolveBna({
    dateKey,
    currency: data.currency as BnaCurrency,
    manualRate: data.manualBnaRate,
  });
  if (!bna.ok) {
    return { ok: false, error: bna.error };
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

  await evaluateAndPersistAlerts(user.id);
  revalidateIncomePaths(data.clientId);

  return {
    ok: true,
    incomeId: income.id,
    amountArs: amountArs.toFixed(2),
    bnaRate: bna.rate.toFixed(4),
  };
}

export async function updateIncome(
  raw: unknown,
): Promise<IncomeMutationResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const parsed = updateIncomeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const user = authResult.user;

  const existing = await prisma.income.findFirst({
    where: { id: data.id, userId: user.id },
    select: { id: true, clientId: true },
  });
  if (!existing) {
    return { ok: false, error: "Ingreso no encontrado" };
  }

  const dateKey = toArDateKey(data.earnedAt);

  const clientCheck = await assertClientOwned(user.id, data.clientId);
  if (!clientCheck.ok) {
    return { ok: false, error: clientCheck.error };
  }

  const bna = await resolveBna({
    dateKey,
    currency: data.currency as BnaCurrency,
    manualRate: data.manualBnaRate,
  });
  if (!bna.ok) {
    return { ok: false, error: bna.error };
  }

  const amountArs = new Prisma.Decimal(data.amountForeign).mul(bna.rate);

  await prisma.income.update({
    where: { id: data.id },
    data: {
      clientId: data.clientId ?? null,
      earnedAt: earnedAtFromDateKey(dateKey),
      amountForeign: new Prisma.Decimal(data.amountForeign),
      currency: data.currency,
      amountArs,
      bnaRate: new Prisma.Decimal(bna.rate),
      description: data.description || null,
      // invoiced: left untouched (task 4 toggle)
    },
  });

  await evaluateAndPersistAlerts(user.id);
  revalidateIncomePaths(data.clientId);
  if (existing.clientId && existing.clientId !== data.clientId) {
    revalidatePath(`/app/clientes/${existing.clientId}`);
  }

  return {
    ok: true,
    incomeId: data.id,
    amountArs: amountArs.toFixed(2),
    bnaRate: bna.rate.toFixed(4),
  };
}

export async function deleteIncome(
  incomeId: string,
): Promise<DeleteIncomeResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const idParsed = z.string().cuid().safeParse(incomeId);
  if (!idParsed.success) {
    return { ok: false, error: "ID inválido" };
  }

  const existing = await prisma.income.findFirst({
    where: { id: idParsed.data, userId: authResult.user.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Ingreso no encontrado" };
  }

  await prisma.income.delete({ where: { id: existing.id } });
  await evaluateAndPersistAlerts(authResult.user.id);
  revalidateIncomePaths();

  return { ok: true };
}

/**
 * Manual “qué falta facturar” flag — not ARCA/CAE, just ops tracking.
 * Sets absolute value (safer than flip under concurrent clicks).
 */
export async function setIncomeInvoiced(
  incomeId: string,
  invoiced: boolean,
): Promise<{ ok: true; invoiced: boolean } | { ok: false; error: string }> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const idParsed = z.string().cuid().safeParse(incomeId);
  if (!idParsed.success) {
    return { ok: false, error: "ID inválido" };
  }

  const existing = await prisma.income.findFirst({
    where: { id: idParsed.data, userId: authResult.user.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Ingreso no encontrado" };
  }

  await prisma.income.update({
    where: { id: existing.id },
    data: { invoiced },
  });

  revalidateIncomePaths();

  return { ok: true, invoiced };
}

/**
 * FormData adapter for `<form action={...}>` + `useActionState`.
 * Keeps `createIncome` as the typed core; this only maps HTML fields → input.
 */
export async function createIncomeFormAction(
  _prev: IncomeMutationResult | null,
  formData: FormData,
): Promise<IncomeMutationResult> {
  return createIncome(parseIncomeFieldsFromFormData(formData));
}

export async function updateIncomeFormAction(
  _prev: IncomeMutationResult | null,
  formData: FormData,
): Promise<IncomeMutationResult> {
  return updateIncome({
    id: String(formData.get("id") ?? ""),
    ...parseIncomeFieldsFromFormData(formData),
  });
}

export async function deleteIncomeFormAction(
  _prev: DeleteIncomeResult | null,
  formData: FormData,
): Promise<DeleteIncomeResult> {
  return deleteIncome(String(formData.get("id") ?? ""));
}
