"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteClient,
  updateClientFormAction,
  type ClientMutationResult,
} from "@/app/actions/client";
import { fieldBorder, fieldClass } from "@/app/app/ingresos/ui";
import { CHANNELS, CURRENCIES } from "@/lib/client-options";

type Props = {
  client: {
    id: string;
    name: string;
    country: string | null;
    currency: string;
    channel: string | null;
    notes: string | null;
  };
};

function fieldError(
  state: ClientMutationResult | null,
  field: string,
): string | undefined {
  if (!state || state.ok) return undefined;
  return state.fieldErrors?.[field]?.[0];
}

export function ClientDetailEditor({ client }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateClientFormAction,
    null,
  );
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  function onDelete() {
    if (
      !window.confirm(
        `¿Borrar «${client.name}»? Los ingresos quedan sin cliente.`,
      )
    ) {
      return;
    }
    startDelete(async () => {
      const result = await deleteClient(client.id);
      if (result.ok) {
        router.push("/app/clientes");
        router.refresh();
      }
    });
  }

  const nameError = fieldError(state, "name");

  return (
    <section className="eo-panel space-y-5">
      <div>
        <h2 className="eo-panel-title">Datos del cliente</h2>
        <p className="eo-panel-desc">Editá y guardá — o borrá si ya no aplica.</p>
      </div>

      <form
        action={formAction}
        className="grid max-w-xl gap-4 sm:grid-cols-2"
        aria-busy={pending}
      >
        <input type="hidden" name="id" value={client.id} />

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="detail-name" className="eo-label">
            Nombre
          </label>
          <input
            id="detail-name"
            name="name"
            type="text"
            required
            maxLength={120}
            disabled={pending || isDeleting}
            defaultValue={client.name}
            className={`${fieldClass} ${fieldBorder(Boolean(nameError))}`}
          />
          {nameError ? (
            <p className="text-xs text-red-600" role="alert">
              {nameError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="detail-country" className="eo-label">
            País
          </label>
          <input
            id="detail-country"
            name="country"
            type="text"
            maxLength={80}
            disabled={pending || isDeleting}
            defaultValue={client.country ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="detail-currency" className="eo-label">
            Moneda
          </label>
          <select
            id="detail-currency"
            name="currency"
            disabled={pending || isDeleting}
            defaultValue={client.currency}
            className={fieldClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="detail-channel" className="eo-label">
            Canal
          </label>
          <select
            id="detail-channel"
            name="channel"
            disabled={pending || isDeleting}
            defaultValue={client.channel ?? ""}
            className={fieldClass}
          >
            <option value="">Sin canal</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="detail-notes" className="eo-label">
            Notas
          </label>
          <textarea
            id="detail-notes"
            name="notes"
            rows={3}
            maxLength={1000}
            disabled={pending || isDeleting}
            defaultValue={client.notes ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending || isDeleting}
            className="rounded-full bg-[var(--eo-ink)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending || isDeleting}
            className="text-sm text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
          >
            {isDeleting ? "Borrando…" : "Borrar cliente"}
          </button>
          {state?.ok ? (
            <p className="text-sm text-emerald-700">Guardado.</p>
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
