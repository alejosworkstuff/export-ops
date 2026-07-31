import type { ClientListRow } from "@/lib/list-clients";
import { arsFmt } from "@/app/app/ingresos/ui";
import { ClientRow, type ClientRowView } from "./client-row";

type ClientListProps = {
  rows: ClientListRow[];
};

function toView(row: ClientListRow): ClientRowView {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    currency: row.currency,
    channel: row.channel,
    notes: row.notes,
    incomeCount: row.incomeCount,
    totalArsLabel: arsFmt.format(Number(row.totalArs.toString())),
  };
}

export function ClientList({ rows }: ClientListProps) {
  return (
    <section className="eo-panel space-y-5">
      <div>
        <h2 className="eo-panel-title">Tus clientes</h2>
        <p className="eo-panel-desc">
          {rows.length === 0
            ? "Todavía no hay clientes."
            : `${rows.length} cliente${rows.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[var(--eo-radius-sm)] border border-dashed border-[var(--eo-line)] bg-white/50 px-4 py-12 text-center">
          <p className="text-sm font-semibold text-[var(--eo-ink)]">
            Sin clientes aún
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--eo-muted)]">
            Creá el primero arriba. Después lo vinculás al cargar un ingreso.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--eo-radius-sm)] border border-[var(--eo-line)] bg-white/60">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--eo-line)] bg-[rgba(12,18,34,0.03)] text-[var(--eo-muted)]">
              <tr>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Nombre
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  País
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Moneda
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Canal
                </th>
                <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                  Total ARS
                </th>
                <th className="px-3 py-2.5 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--eo-line)]">
              {rows.map((row) => (
                <ClientRow key={row.id} row={toView(row)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
