"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  CHANNELS,
  CURRENCIES,
  deleteClient,
  updateClientFormAction,
  type ClientMutationResult,
  type DeleteClientResult,
} from "@/app/actions/client";
import { fieldBorder, fieldClassCompact } from "@/app/app/ingresos/ui";

export type ClientRowView = {
  id: string;
  name: string;
  country: string | null;
  currency: string;
  channel: string | null;
  notes: string | null;
  incomeCount: number;
  totalArsLabel: string;
};

function fieldError(
  state: ClientMutationResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) return undefined;
  return state.fieldErrors?.[field]?.[0];
}

function FieldHint({
  state,
  field,
}: {
  state: ClientMutationResult | null;
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

export function ClientRow({ row }: { row: ClientRowView }) {
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const [updateState, updateAction, isUpdating] = useActionState(
    updateClientFormAction,
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
        `¿Borrar «${row.name}»? Los ingresos quedan sin cliente (no se borran).`,
      )
    ) {
      return;
    }
    setDeleteError(null);
    startDelete(async () => {
      const result: DeleteClientResult = await deleteClient(row.id);
      if (!result.ok) {
        setDeleteError(result.error);
      }
    });
  }

  if (editing) {
    return (
      <tr className="bg-zinc-50 text-zinc-800" aria-busy={isUpdating}>
        <td colSpan={6} className="px-3 py-3">
          <form
            action={updateAction}
            className="grid gap-3 sm:grid-cols-2"
            aria-busy={isUpdating}
          >
            <input type="hidden" name="id" value={row.id} />

            <div className="space-y-1 sm:col-span-2">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`name-${row.id}`}
              >
                Nombre
              </label>
              <input
                id={`name-${row.id}`}
                name="name"
                type="text"
                required
                maxLength={120}
                disabled={isUpdating}
                defaultValue={row.name}
                className={`${fieldClassCompact} ${fieldBorder(Boolean(fieldError(updateState, "name")))}`}
              />
              <FieldHint state={updateState} field="name" />
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`country-${row.id}`}
              >
                País
              </label>
              <input
                id={`country-${row.id}`}
                name="country"
                type="text"
                maxLength={80}
                disabled={isUpdating}
                defaultValue={row.country ?? ""}
                className={fieldClassCompact}
              />
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
                disabled={isUpdating}
                defaultValue={row.currency}
                className={fieldClassCompact}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`channel-${row.id}`}
              >
                Canal
              </label>
              <select
                id={`channel-${row.id}`}
                name="channel"
                disabled={isUpdating}
                defaultValue={row.channel ?? ""}
                className={fieldClassCompact}
              >
                <option value="">Sin canal</option>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                className="text-xs font-medium text-zinc-600"
                htmlFor={`notes-${row.id}`}
              >
                Notas
              </label>
              <textarea
                id={`notes-${row.id}`}
                name="notes"
                rows={2}
                maxLength={1000}
                disabled={isUpdating}
                defaultValue={row.notes ?? ""}
                className={fieldClassCompact}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-full bg-[var(--eo-ink)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isUpdating ? "Guardando…" : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={isUpdating}
                className="eo-btn-ghost !rounded-full !px-3 !py-1.5 text-sm"
              >
                Cancelar
              </button>
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

  return (
    <tr
      className={`text-zinc-800 transition-opacity ${isDeleting ? "opacity-50" : ""}`}
      aria-busy={isDeleting}
    >
      <td className="px-3 py-2">
        <Link
          href={`/app/clientes/${row.id}`}
          className="font-medium text-[var(--eo-ink)] underline-offset-2 hover:underline"
        >
          {row.name}
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
        {row.country ?? "—"}
      </td>
      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
        {row.currency}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-zinc-600">
        {row.channel ?? "—"}
      </td>
      <td className="whitespace-nowrap px-3 py-2 tabular-nums">
        <span className="text-zinc-500">{row.incomeCount} · </span>
        {row.totalArsLabel}
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={isDeleting}
            className="text-sm text-zinc-700 underline-offset-2 hover:underline disabled:opacity-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
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
