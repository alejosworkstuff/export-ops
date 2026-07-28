"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MonoCategory, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireLocalUser } from "@/lib/require-local-user";

const MONO_CATEGORIES = Object.values(MonoCategory) as [
  MonoCategory,
  ...MonoCategory[],
];

const categorySettingsSchema = z.object({
  category: z.enum(MONO_CATEGORIES),
  /** User-declared tope ARS — snapshot, not an ARCA scrape. */
  categoryCeilingArs: z.coerce
    .number()
    .positive("El tope debe ser mayor a 0"),
});

export type CategorySettingsResult =
  | {
      ok: true;
      category: MonoCategory;
      categoryCeilingArs: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function updateCategorySettings(
  raw: unknown,
): Promise<CategorySettingsResult> {
  const authResult = await requireLocalUser();
  if (!authResult.ok) {
    return { ok: false, error: authResult.error };
  }

  const parsed = categorySettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { category, categoryCeilingArs } = parsed.data;
  const ceiling = new Prisma.Decimal(categoryCeilingArs.toFixed(2));

  const updated = await prisma.user.update({
    where: { id: authResult.user.id },
    data: {
      category,
      categoryCeilingArs: ceiling,
    },
    select: {
      category: true,
      categoryCeilingArs: true,
    },
  });

  revalidatePath("/app");

  return {
    ok: true,
    category: updated.category,
    categoryCeilingArs: updated.categoryCeilingArs.toFixed(2),
  };
}

/** FormData adapter for `<form action={...}>` + `useActionState`. */
export async function updateCategorySettingsFormAction(
  _prev: CategorySettingsResult | null,
  formData: FormData,
): Promise<CategorySettingsResult> {
  return updateCategorySettings({
    category: String(formData.get("category") ?? ""),
    categoryCeilingArs: String(formData.get("categoryCeilingArs") ?? ""),
  });
}
