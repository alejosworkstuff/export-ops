import Link from "next/link";
import { toArDateKey } from "@/lib/bna";
import type { IncomeListPage } from "@/lib/list-incomes";
import type { ClientOption } from "./income-form";
import { IncomeRow, type IncomeRowView } from "./income-row";
import { arsFmt, foreignFmt } from "./ui";

type IncomeListProps = {
  data: IncomeListPage;
  clients: ClientOption[];
  filterClientId?: string | null;
};

function toRowView(row: IncomeListPage["rows"][number]): IncomeRowView {
  return {
    id: row.id,
    earnedAt: toArDateKey(row.earnedAt),
    amountForeign: row.amountForeign.toString(),
    currency: row.currency,
    amountArs: row.amountArs.toString(),
    bnaRate: row.bnaRate.toString(),
    description: row.description,
    invoiced: row.invoiced,
    clientId: row.clientId,
    clientName: row.client?.name ?? null,
  };
}

function pageHref(page: number, filterClientId?: string | null): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (filterClientId) params.set("clientId", filterClientId);
  return `/app/ingresos?${params.toString()}`;
}

export function IncomeList({
  data,
  clients,
  filterClientId,
}: IncomeListProps) {
  const { rows, page, totalPages, totalCount, totalArs } = data;

  return (
    <section className="eo-panel space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="eo-panel-title">Historial</h2>
          <p className="eo-panel-desc">
            {totalCount === 0
              ? filterClientId
                ? "No hay ingresos para este cliente."
                : "Todavía no hay ingresos cargados."
              : `${totalCount} ingreso${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        {totalCount > 0 ? (
          <p className="text-sm text-[var(--eo-muted)]">
            {filterClientId ? "Total filtrado: " : "Total: "}
            <span className="eo-stat text-base">
              {arsFmt.format(Number(totalArs.toString()))}
            </span>
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[var(--eo-radius-sm)] border border-dashed border-[var(--eo-line)] bg-white/50 px-4 py-12 text-center">
          <p className="text-sm font-semibold text-[var(--eo-ink)]">
            {filterClientId ? "Sin resultados" : "Todavía sin ingresos"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--eo-muted)]">
            {filterClientId
              ? "Probá otro cliente o cargá un ingreso vinculado."
              : "Cuando cobres en USD o EUR, cargá el ingreso arriba. Acá vas a ver el historial, el total en pesos y qué falta facturar."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--eo-radius-sm)] border border-[var(--eo-line)] bg-white/60">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--eo-line)] bg-[rgba(12,18,34,0.03)] text-[var(--eo-muted)]">
              <tr>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Fecha
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Monto
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  ARS
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  BNA
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Cliente
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Descripción
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Factura
                </th>
                <th className="px-3 py-2.5 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--eo-line)]">
              {rows.map((row) => {
                const view = toRowView(row);
                return (
                  <IncomeRow
                    key={row.id}
                    row={view}
                    clients={clients}
                    foreignLabel={foreignFmt.format(
                      Number(view.amountForeign),
                    )}
                    arsLabel={arsFmt.format(Number(view.amountArs))}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-3 text-sm"
          aria-label="Paginación de ingresos"
        >
          <p className="text-[var(--eo-muted)]">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1, filterClientId)}
                className="eo-btn-ghost !px-3 !py-1.5"
              >
                Anterior
              </Link>
            ) : (
              <span className="rounded-full border border-[var(--eo-line)] px-3 py-1.5 text-[var(--eo-muted)] opacity-50">
                Anterior
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1, filterClientId)}
                className="eo-btn-ghost !px-3 !py-1.5"
              >
                Siguiente
              </Link>
            ) : (
              <span className="rounded-full border border-[var(--eo-line)] px-3 py-1.5 text-[var(--eo-muted)] opacity-50">
                Siguiente
              </span>
            )}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
