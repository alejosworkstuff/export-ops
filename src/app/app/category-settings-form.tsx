"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateCategorySettingsFormAction,
  type CategorySettingsResult,
} from "@/app/actions/category";
import { MonoCategory } from "@/generated/prisma/enums";
import { fieldBorder, fieldClass } from "./ingresos/ui";

const CATEGORIES = Object.values(MonoCategory);

export type CategorySettingsDefaults = {
  category: MonoCategory;
  /** Empty string when ceiling is 0 (unset). */
  categoryCeilingArs: string;
};

type CategorySettingsFormProps = {
  defaults: CategorySettingsDefaults;
};

function fieldError(
  state: CategorySettingsResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) return undefined;
  return state.fieldErrors?.[field]?.[0];
}

export function CategorySettingsForm({ defaults }: CategorySettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCategorySettingsFormAction,
    null,
  );
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.ok) {
      successRef.current?.focus();
    }
  }, [state]);

  const categoryError = fieldError(state, "category");
  const ceilingError = fieldError(state, "categoryCeilingArs");

  const categoryValue =
    state?.ok === true ? state.category : defaults.category;
  const ceilingValue =
    state?.ok === true
      ? state.categoryCeilingArs
      : defaults.categoryCeilingArs;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-zinc-900">
          Categoría y tope
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Declarás tu categoría Monotributo y el tope anual en ARS. No consultamos
          ARCA — es un snapshot tuyo para calcular runway.
        </p>
      </div>

      <form action={formAction} className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-zinc-800"
          >
            Categoría
          </label>
          <select
            id="category"
            name="category"
            required
            disabled={pending}
            defaultValue={categoryValue}
            key={`category-${categoryValue}`}
            className={`${fieldClass} ${fieldBorder(Boolean(categoryError))}`}
            aria-invalid={Boolean(categoryError)}
            aria-describedby={categoryError ? "category-error" : undefined}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {categoryError ? (
            <p id="category-error" className="text-sm text-red-600">
              {categoryError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="categoryCeilingArs"
            className="block text-sm font-medium text-zinc-800"
          >
            Tope categoría (ARS)
          </label>
          <input
            id="categoryCeilingArs"
            name="categoryCeilingArs"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            disabled={pending}
            defaultValue={ceilingValue}
            key={`ceiling-${ceilingValue}`}
            placeholder="ej. 78000000"
            className={`${fieldClass} ${fieldBorder(Boolean(ceilingError))}`}
            aria-invalid={Boolean(ceilingError)}
            aria-describedby={
              ceilingError ? "ceiling-error" : "ceiling-hint"
            }
          />
          {ceilingError ? (
            <p id="ceiling-error" className="text-sm text-red-600">
              {ceilingError}
            </p>
          ) : (
            <p id="ceiling-hint" className="text-xs text-zinc-500">
              Usá el tope vigente de tu categoría. Cuando AFIP actualice escalas,
              editá este número.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>

        {state?.ok === false ? (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.ok === true ? (
          <p
            ref={successRef}
            tabIndex={-1}
            className="text-sm text-emerald-700 outline-none"
            role="status"
          >
            Guardado: categoría {state.category}, tope{" "}
            {Number(state.categoryCeilingArs).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
            .
          </p>
        ) : null}
      </form>
    </section>
  );
}
