"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createClientFormAction,
  type ClientMutationResult,
} from "@/app/actions/client";
import {
  fieldBorder,
  fieldClass,
} from "@/app/app/ingresos/ui";
import { CHANNELS, CURRENCIES } from "@/lib/client-options";

function fieldError(
  state: ClientMutationResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) return undefined;
  return state.fieldErrors?.[field]?.[0];
}

export function ClientForm() {
  const [state, formAction, pending] = useActionState(
    createClientFormAction,
    null,
  );
  const [formKey, setFormKey] = useState(0);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setFormKey((k) => k + 1);
      successRef.current?.focus();
    }
  }, [state]);

  const nameError = fieldError(state, "name");
  const countryError = fieldError(state, "country");
  const currencyError = fieldError(state, "currency");
  const channelError = fieldError(state, "channel");
  const notesError = fieldError(state, "notes");

  return (
    <section className="eo-panel space-y-5">
      <div>
        <h2 className="eo-panel-title">Nuevo cliente</h2>
        <p className="eo-panel-desc">
          Quién paga, en qué moneda y por qué canal — sin CRM de más.
        </p>
      </div>

      <form
        key={formKey}
        action={formAction}
        className="grid max-w-xl gap-4 sm:grid-cols-2"
        aria-busy={pending}
      >
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="name" className="eo-label">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            disabled={pending}
            placeholder="Acme Remote LLC"
            className={`${fieldClass} ${fieldBorder(Boolean(nameError))}`}
            aria-invalid={Boolean(nameError)}
          />
          {nameError ? (
            <p className="text-xs text-red-600" role="alert">
              {nameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="country" className="eo-label">
            País{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id="country"
            name="country"
            type="text"
            maxLength={80}
            disabled={pending}
            placeholder="US / DE / AR"
            className={`${fieldClass} ${fieldBorder(Boolean(countryError))}`}
            aria-invalid={Boolean(countryError)}
          />
          {countryError ? (
            <p className="text-xs text-red-600" role="alert">
              {countryError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="currency" className="eo-label">
            Moneda habitual
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue="USD"
            disabled={pending}
            className={`${fieldClass} ${fieldBorder(Boolean(currencyError))}`}
            aria-invalid={Boolean(currencyError)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {currencyError ? (
            <p className="text-xs text-red-600" role="alert">
              {currencyError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="channel" className="eo-label">
            Canal{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <select
            id="channel"
            name="channel"
            defaultValue=""
            disabled={pending}
            className={`${fieldClass} ${fieldBorder(Boolean(channelError))}`}
            aria-invalid={Boolean(channelError)}
          >
            <option value="">Sin canal</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {channelError ? (
            <p className="text-xs text-red-600" role="alert">
              {channelError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="notes" className="eo-label">
            Notas{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            disabled={pending}
            placeholder="Contrato mensual, billing contact…"
            className={`${fieldClass} ${fieldBorder(Boolean(notesError))}`}
            aria-invalid={Boolean(notesError)}
          />
          {notesError ? (
            <p className="text-xs text-red-600" role="alert">
              {notesError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--eo-ink)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Crear cliente"}
          </button>
          {state?.ok ? (
            <p
              ref={successRef}
              tabIndex={-1}
              className="text-sm text-emerald-700"
            >
              Cliente creado.
            </p>
          ) : null}
          {state && !state.ok ? (
            <p className="text-sm text-red-700" role="alert">
              {state.error}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
