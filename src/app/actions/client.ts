"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CURRENCIES } from "@/lib/client-options";
import { prisma } from "@/lib/db";
import { requireLocalUser } from "@/lib/require-local-user";

const emptyToNull = (v: string | null | undefined) => {
  if (v == null) return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
};

const clientFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  country: z
    .string()
    .max(80)
    .optional()
    .nullable()
    .transform(emptyToNull),
  currency: z.enum(CURRENCIES).default("USD"),
  channel: z
    .string()
    .max(80, "Máximo 80 caracteres")
    .optional()
    .nullable()
    .transform(emptyToNull),
  notes: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform(emptyToNull),
});

const createClientSchema = clientFieldsSchema;

const updateClientSchema = clientFieldsSchema.extend({
  id: z.string().cuid(),
});

export type ClientMutationResult =
  | { ok: true; clientId: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export type DeleteClientResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidateClientPaths(clientId?: string) {
  revalidatePath("/app/clientes");
  revalidatePath("/app/ingresos");
  if (clientId) {
    revalidatePath(`/app/clientes/${clientId}`);
  }
}

function parseClientFieldsFromFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    country: String(formData.get("country") ?? ""),
    currency: String(formData.get("currency") ?? "USD"),
    channel: String(formData.get("channel") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createClient(
  raw: unknown,
): Promise<ClientMutationResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const parsed = createClientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const client = await prisma.client.create({
    data: {
      userId: authResult.user.id,
      name: data.name,
      country: data.country,
      currency: data.currency,
      channel: data.channel,
      notes: data.notes,
    },
  });

  revalidateClientPaths(client.id);

  return { ok: true, clientId: client.id };
}

export async function updateClient(
  raw: unknown,
): Promise<ClientMutationResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const parsed = updateClientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existing = await prisma.client.findFirst({
    where: { id: data.id, userId: authResult.user.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Cliente no encontrado" };
  }

  await prisma.client.update({
    where: { id: data.id },
    data: {
      name: data.name,
      country: data.country,
      currency: data.currency,
      channel: data.channel,
      notes: data.notes,
    },
  });

  revalidateClientPaths(data.id);

  return { ok: true, clientId: data.id };
}

export async function deleteClient(
  clientId: string,
): Promise<DeleteClientResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const idParsed = z.string().cuid().safeParse(clientId);
  if (!idParsed.success) {
    return { ok: false, error: "ID inválido" };
  }

  const existing = await prisma.client.findFirst({
    where: { id: idParsed.data, userId: authResult.user.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, error: "Cliente no encontrado" };
  }

  // Income.clientId uses onDelete: SetNull — cobros quedan sin cliente.
  await prisma.client.delete({ where: { id: existing.id } });
  revalidateClientPaths();

  return { ok: true };
}

export async function createClientFormAction(
  _prev: ClientMutationResult | null,
  formData: FormData,
): Promise<ClientMutationResult> {
  return createClient(parseClientFieldsFromFormData(formData));
}

export async function updateClientFormAction(
  _prev: ClientMutationResult | null,
  formData: FormData,
): Promise<ClientMutationResult> {
  return updateClient({
    id: String(formData.get("id") ?? ""),
    ...parseClientFieldsFromFormData(formData),
  });
}

export async function deleteClientFormAction(
  _prev: DeleteClientResult | null,
  formData: FormData,
): Promise<DeleteClientResult> {
  return deleteClient(String(formData.get("id") ?? ""));
}
