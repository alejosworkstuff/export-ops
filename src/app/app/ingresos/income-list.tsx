import Link from "next/link";
import { toArDateKey } from "@/lib/bna";
import type { IncomeListPage } from "@/lib/list-incomes";
import type { ClientOption } from "./income-form";
import { IncomeRow, type IncomeRowView } from "./income-row";
import { arsFmt, foreignFmt } from "./ui";

type IncomeListProps = {
  data: IncomeListPage;
  clients: ClientOption[];
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

export function IncomeList({ data, clients }: IncomeListProps) {
  const { rows, page, totalPages, totalCount, totalArs } = data;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-zinc-900">Historial</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {totalCount === 0
              ? "Todavía no hay ingresos cargados."
              : `${totalCount} ingreso${totalCount === 1 ? "" : "s"}`}
          </p>
        </div>
        {totalCount > 0 ? (
          <p className="text-sm text-zinc-700">
            Total ledger:{" "}
            <span className="font-semibold tabular-nums text-zinc-900">
              {arsFmt.format(Number(totalArs.toString()))}
            </span>
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center">
          <p className="text-sm font-medium text-zinc-800">Ledger vacío</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-600">
            Cuando cobres en USD/EUR, cargá el ingreso arriba. Acá vas a ver el
            historial, el total en ARS y qué falta facturar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-zinc-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Monto</th>
                <th className="px-3 py-2 font-medium">ARS</th>
                <th className="px-3 py-2 font-medium">BNA</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Descripción</th>
                <th className="px-3 py-2 font-medium">Factura</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
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
          <p className="text-zinc-600">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/app/ingresos?page=${page - 1}`}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 hover:bg-zinc-50"
              >
                Anterior
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">
                Anterior
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/app/ingresos?page=${page + 1}`}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-800 hover:bg-zinc-50"
              >
                Siguiente
              </Link>
            ) : (
              <span className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-400">
                Siguiente
              </span>
            )}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
