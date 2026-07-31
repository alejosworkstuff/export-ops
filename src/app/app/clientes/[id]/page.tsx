import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { toArDateKey } from "@/lib/bna";
import { ensureLocalUser } from "@/lib/ensure-local-user";
import { getClientDetail } from "@/lib/list-clients";
import { arsFmt, foreignFmt } from "@/app/app/ingresos/ui";
import { ClientDetailEditor } from "./client-detail-editor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClienteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  if (!clerkId || !email) {
    notFound();
  }

  const user = await ensureLocalUser(clerkId, email);
  const client = await getClientDetail(user.id, id);
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="eo-reveal space-y-2">
        <p className="text-sm text-[var(--eo-muted)]">
          <Link
            href="/app/clientes"
            className="underline-offset-2 hover:underline"
          >
            ← Clientes
          </Link>
        </p>
        <h1 className="eo-font-display text-3xl font-bold tracking-tight text-[var(--eo-ink)]">
          {client.name}
        </h1>
        <p className="text-sm text-[var(--eo-muted)]">
          {[client.country, client.currency, client.channel]
            .filter(Boolean)
            .join(" · ") || "Sin metadatos"}
        </p>
      </div>

      <div className="eo-reveal eo-reveal-delay-1 grid gap-4 sm:grid-cols-2">
        <div className="eo-panel">
          <p className="eo-meta">Acumulado ARS</p>
          <p className="eo-stat mt-1 text-2xl">
            {arsFmt.format(Number(client.totalArs.toString()))}
          </p>
          <p className="mt-1 text-sm text-[var(--eo-muted)]">
            {client.incomes.length} ingreso
            {client.incomes.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="eo-panel space-y-2">
          <p className="eo-meta">Accesos rápidos</p>
          <Link
            href={`/app/ingresos?clientId=${client.id}`}
            className="eo-btn-ghost inline-flex !px-3 !py-1.5 text-sm"
          >
            Ver en ledger
          </Link>
          <Link
            href="/app/ingresos"
            className="ml-2 text-sm text-[var(--eo-muted)] underline-offset-2 hover:underline"
          >
            Cargar ingreso
          </Link>
        </div>
      </div>

      <div className="eo-reveal eo-reveal-delay-2">
        <ClientDetailEditor
          client={{
            id: client.id,
            name: client.name,
            country: client.country,
            currency: client.currency,
            channel: client.channel,
            notes: client.notes,
          }}
        />
      </div>

      <section className="eo-reveal eo-reveal-delay-3 eo-panel space-y-5">
        <div>
          <h2 className="eo-panel-title">Ingresos asociados</h2>
          <p className="eo-panel-desc">Más recientes primero.</p>
        </div>

        {client.incomes.length === 0 ? (
          <div className="rounded-[var(--eo-radius-sm)] border border-dashed border-[var(--eo-line)] bg-white/50 px-4 py-10 text-center">
            <p className="text-sm text-[var(--eo-muted)]">
              Todavía no hay ingresos vinculados a este cliente.
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
                    Descripción
                  </th>
                  <th className="eo-meta px-3 py-2.5 font-medium normal-case tracking-[0.06em]">
                    Factura
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--eo-line)]">
                {client.incomes.map((row) => (
                  <tr key={row.id} className="text-zinc-800">
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {toArDateKey(row.earnedAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {foreignFmt.format(Number(row.amountForeign.toString()))}{" "}
                      {row.currency}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {arsFmt.format(Number(row.amountArs.toString()))}
                    </td>
                    <td className="max-w-[14rem] truncate px-3 py-2 text-zinc-600">
                      {row.description ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={
                          row.invoiced
                            ? "text-emerald-800"
                            : "text-amber-800"
                        }
                      >
                        {row.invoiced ? "Facturado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
