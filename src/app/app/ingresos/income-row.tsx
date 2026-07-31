"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import {
  deleteIncome,
  setIncomeInvoiced,
  updateIncomeFormAction,
  type DeleteIncomeResult,
  type IncomeMutationResult,
} from "@/app/actions/income";
import type { ClientOption } from "./income-form";
import { fieldBorder, fieldClassCompact } from "./ui";

/** Plain JSON-safe row for Client Components (no Prisma.Decimal). */
export type IncomeRowView = {
  id: string;
  earnedAt: string;
  amountForeign: string;
  currency: string;
  amountArs: string;
  bnaRate: string;
  description: string | null;
  invoiced: boolean;
  clientId: string | null;
  clientName: string | null;
};

type IncomeRowProps = {
  row: IncomeRowView;
  clients: ClientOption[];
  arsLabel: string;
  foreignLabel: string;
};

function fieldError(
  state: IncomeMutationResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) return undefined;
  return state.fieldErrors?.[field]?.[0];
}

function FieldHint({
  state,
  field,
}: {
  state: IncomeMutationResult | null;
  field: string;
}) {
  const msg = fieldError(state, field);
  if (!msg) return null;
  return (
    <p className="text-xs text-red-600" role="alert">
      {msg}
    </p>
  );
}

export function IncomeRow({
  row,
  clients,
  arsLabel,
  foreignLabel,
}: IncomeRowProps) {
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [isTogglingInvoice, startInvoiceToggle] = useTransition();
  const [optimisticInvoiced, setOptimisticInvoiced] = useOptimistic(
    row.invoiced,
  );

  const [updateState, updateAction, isUpdating] = useActionState(
    updateIncomeFormAction,
    null,
  );

  useEffect(() => {
    if (updateState?.ok) {
      setEditing(false);
    }
  }, [updateState]);

  function onDelete() {
    if (
      !window.confirm(
        "¿Borrar este ingreso? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }
    setDeleteError(null);
    startDelete(async () => {
      const result: DeleteIncomeResult = await deleteIncome(row.id);
      if (!result.ok) {
        setDeleteError(result.error);
      }
    });
  }

  function onToggleInvoiced() {
    const next = !optimisticInvoiced;
    setInvoiceError(null);
    startInvoiceToggle(async () => {
      setOptimisticInvoiced(next);
      const result = await setIncomeInvoiced(row.id, next);
      if (!result.ok) {
        setInvoiceError(result.error);
      }
    });
  }

  if (editing) {
    const amountErr = Boolean(fieldError(updateState, "amountForeign"));
    const currencyErr = Boolean(fieldError(updateState, "currency"));
    const dateErr = Boolean(fieldError(updateState, "earnedAt"));
    const clientErr = Boolean(fieldError(updateState, "clientId"));
    const descErr = Boolean(fieldError(updateState, "description"));
    const rateErr = Boolean(fieldError(updateState, "manualBnaRate"));

    return (
      <tr className="bg-zinc-50 text-zinc-800" aria-busy={isUpdating}>
        <td colSpan={8} className="px-3 py-3">
          <form
            action={updateAction}
            className="grid gap-3 sm:grid-cols-2"
            aria-busy={isUpdating}
          >
            <input type="hidden" name="id" value={row.id} />

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`amount-${row.id}`}
              >
                Monto
              </label>
              <input
                id={`amount-${row.id}`}
                name="amountForeign"
                type="number"
                step="0.01"
                min="0.01"
                required
                disabled={isUpdating}
                defaultValue={row.amountForeign}
                className={`${fieldClassCompact} ${fieldBorder(amountErr)}`}
                aria-invalid={amountErr}
              />
              <FieldHint state={updateState} field="amountForeign" />
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`currency-${row.id}`}
              >
                Moneda
              </label>
              <select
                id={`currency-${row.id}`}
                name="currency"
                required
                disabled={isUpdating}
                defaultValue={row.currency}
                className={`${fieldClassCompact} ${fieldBorder(currencyErr)}`}
                aria-invalid={currencyErr}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <FieldHint state={updateState} field="currency" />
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`date-${row.id}`}
              >
                Fecha
              </label>
              <input
                id={`date-${row.id}`}
                name="earnedAt"
                type="date"
                required
                disabled={isUpdating}
                defaultValue={row.earnedAt}
                className={`${fieldClassCompact} ${fieldBorder(dateErr)}`}
                aria-invalid={dateErr}
              />
              <FieldHint state={updateState} field="earnedAt" />
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`client-${row.id}`}
              >
                Cliente
              </label>
              <select
                id={`client-${row.id}`}
                name="clientId"
                disabled={isUpdating}
                defaultValue={row.clientId ?? ""}
                className={`${fieldClassCompact} ${fieldBorder(clientErr)}`}
                aria-invalid={clientErr}
              >
                <option value="">Sin cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldHint state={updateState} field="clientId" />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`desc-${row.id}`}
              >
                Descripción
              </label>
              <input
                id={`desc-${row.id}`}
                name="description"
                type="text"
                maxLength={500}
                disabled={isUpdating}
                defaultValue={row.description ?? ""}
                className={`${fieldClassCompact} ${fieldBorder(descErr)}`}
                aria-invalid={descErr}
              />
              <FieldHint state={updateState} field="description" />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`bna-${row.id}`}
              >
                BNA manual (opcional)
              </label>
              <input
                id={`bna-${row.id}`}
                name="manualBnaRate"
                type="number"
                step="0.0001"
                min="0.0001"
                disabled={isUpdating}
                placeholder={row.bnaRate}
                className={`${fieldClassCompact} ${fieldBorder(rateErr)}`}
                aria-invalid={rateErr}
              />
              <FieldHint state={updateState} field="manualBnaRate" />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-full bg-[var(--eo-ink)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isUpdating ? "Guardando…" : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={isUpdating}
                className="eo-btn-ghost !rounded-full !px-3 !py-1.5 text-sm"
              >
                Cancelar
              </button>
              {isUpdating ? (
                <p className="text-xs text-zinc-500">Recalculando BNA…</p>
              ) : null}
              {updateState && !updateState.ok ? (
                <p className="text-sm text-red-700" role="alert">
                  {updateState.error}
                </p>
              ) : null}
            </div>
          </form>
        </td>
      </tr>
    );
  }

  const busy = isDeleting || isTogglingInvoice;

  return (
    <tr
      className={`text-zinc-800 transition-opacity ${isDeleting ? "opacity-50" : ""}`}
      aria-busy={busy}
    >
      <td className="whitespace-nowrap px-3 py-2 tabular-nums">{row.earnedAt}</td>
      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
        {foreignLabel} {row.currency}
      </td>
      <td className="whitespace-nowrap px-3 py-2 tabular-nums">{arsLabel}</td>
      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-600">
        {Number(row.bnaRate).toFixed(4)}
      </td>
      <td className="max-w-[10rem] truncate px-3 py-2">
        {row.clientId && row.clientName ? (
          <Link
            href={`/app/clientes/${row.clientId}`}
            className="underline-offset-2 hover:underline"
          >
            {row.clientName}
          </Link>
        ) : (
          "—"
        )}
      </td>
      <td className="max-w-[14rem] truncate px-3 py-2 text-zinc-600">
        {row.description ?? "—"}
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        <button
          type="button"
          onClick={onToggleInvoiced}
          disabled={busy}
          aria-pressed={optimisticInvoiced}
          title={
            optimisticInvoiced
              ? "Marcar como pendiente de facturar"
              : "Marcar como facturado"
          }
          className={`rounded-md px-2 py-1 text-sm transition-colors disabled:opacity-50 ${
            optimisticInvoiced
              ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
        >
          {isTogglingInvoice
            ? "…"
            : optimisticInvoiced
              ? "Facturado"
              : "Pendiente"}
        </button>
        {invoiceError ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {invoiceError}
          </p>
        ) : null}
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={busy}
            className="text-sm text-zinc-700 underline-offset-2 hover:underline disabled:opacity-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="text-sm text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
          >
            {isDeleting ? "Borrando…" : "Borrar"}
          </button>
        </div>
        {deleteError ? (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {deleteError}
          </p>
        ) : null}
      </td>
    </tr>
  );
}
