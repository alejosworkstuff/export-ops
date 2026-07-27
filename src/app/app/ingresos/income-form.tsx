"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createIncomeFormAction,
  type CreateIncomeResult,
} from "@/app/actions/income";
import {
  arsFmt,
  fieldBorder,
  fieldClass,
  formatBna,
} from "./ui";

export type ClientOption = {
  id: string;
  name: string;
};

type IncomeFormProps = {
  clients: ClientOption[];
  /** YYYY-MM-DD in America/Argentina/Buenos_Aires */
  defaultEarnedAt: string;
};

function fieldError(
  state: CreateIncomeResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) return undefined;
  return state.fieldErrors?.[field]?.[0];
}

export function IncomeForm({ clients, defaultEarnedAt }: IncomeFormProps) {
  const [state, formAction, pending] = useActionState(
    createIncomeFormAction,
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

  const amountError = fieldError(state, "amountForeign");
  const currencyError = fieldError(state, "currency");
  const dateError = fieldError(state, "earnedAt");
  const descriptionError = fieldError(state, "description");
  const clientError = fieldError(state, "clientId");
  const rateError = fieldError(state, "manualBnaRate");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-zinc-900">Cargar ingreso</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Monto en moneda extranjera → ARS al BNA vendedor del día.
        </p>
      </div>

      <form
        key={formKey}
        action={formAction}
        className="grid max-w-xl gap-4 sm:grid-cols-2"
        aria-busy={pending}
      >
        <div className="space-y-1.5 sm:col-span-1">
          <label
            htmlFor="amountForeign"
            className="block text-sm font-medium text-zinc-800"
          >
            Monto
          </label>
          <input
            id="amountForeign"
            name="amountForeign"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            disabled={pending}
            placeholder="1500"
            className={`${fieldClass} ${fieldBorder(Boolean(amountError))}`}
            aria-invalid={Boolean(amountError)}
            aria-describedby={amountError ? "amountForeign-error" : undefined}
          />
          {amountError ? (
            <p id="amountForeign-error" className="text-xs text-red-600" role="alert">
              {amountError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-1">
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-zinc-800"
          >
            Moneda
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue="USD"
            required
            disabled={pending}
            className={`${fieldClass} ${fieldBorder(Boolean(currencyError))}`}
            aria-invalid={Boolean(currencyError)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          {currencyError ? (
            <p className="text-xs text-red-600" role="alert">
              {currencyError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-1">
          <label
            htmlFor="earnedAt"
            className="block text-sm font-medium text-zinc-800"
          >
            Fecha
          </label>
          <input
            id="earnedAt"
            name="earnedAt"
            type="date"
            required
            disabled={pending}
            defaultValue={defaultEarnedAt}
            className={`${fieldClass} ${fieldBorder(Boolean(dateError))}`}
            aria-invalid={Boolean(dateError)}
            aria-describedby={dateError ? "earnedAt-error" : undefined}
          />
          {dateError ? (
            <p id="earnedAt-error" className="text-xs text-red-600" role="alert">
              {dateError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-1">
          <label
            htmlFor="clientId"
            className="block text-sm font-medium text-zinc-800"
          >
            Cliente <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <select
            id="clientId"
            name="clientId"
            defaultValue=""
            disabled={pending}
            className={`${fieldClass} ${fieldBorder(Boolean(clientError))}`}
            aria-invalid={Boolean(clientError)}
          >
            <option value="">Sin cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clientError ? (
            <p className="text-xs text-red-600" role="alert">
              {clientError}
            </p>
          ) : null}
          {clients.length === 0 ? (
            <p className="text-xs text-zinc-500">
              Todavía no hay clientes — podés cargar el ingreso igual.
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-800"
          >
            Descripción{" "}
            <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id="description"
            name="description"
            type="text"
            maxLength={500}
            disabled={pending}
            placeholder="Retainer julio / Sprint 12"
            className={`${fieldClass} ${fieldBorder(Boolean(descriptionError))}`}
            aria-invalid={Boolean(descriptionError)}
          />
          {descriptionError ? (
            <p className="text-xs text-red-600" role="alert">
              {descriptionError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="manualBnaRate"
            className="block text-sm font-medium text-zinc-800"
          >
            BNA vendedor manual{" "}
            <span className="font-normal text-zinc-500">
              (solo si falla el fetch — típico EUR histórico)
            </span>
          </label>
          <input
            id="manualBnaRate"
            name="manualBnaRate"
            type="number"
            inputMode="decimal"
            step="0.0001"
            min="0.0001"
            disabled={pending}
            placeholder="ej. 1480.50"
            className={`${fieldClass} ${fieldBorder(Boolean(rateError))}`}
            aria-invalid={Boolean(rateError)}
          />
          {rateError ? (
            <p className="text-xs text-red-600" role="alert">
              {rateError}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Guardar ingreso"}
          </button>
          {pending ? (
            <p className="mt-2 text-xs text-zinc-500">
              Consultando BNA y guardando en el ledger…
            </p>
          ) : null}
        </div>
      </form>

      <div aria-live="polite" className="max-w-xl">
        {state?.ok ? (
          <p
            ref={successRef}
            tabIndex={-1}
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 outline-none"
          >
            Guardado. {arsFmt.format(Number(state.amountArs))} @ BNA{" "}
            {formatBna(state.bnaRate)}.
          </p>
        ) : null}
        {state && !state.ok ? (
          <p
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {state.error}
            {state.fieldErrors ? (
              <span className="mt-1 block text-xs text-red-700">
                Revisá los campos marcados en rojo.
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
    </section>
  );
}
