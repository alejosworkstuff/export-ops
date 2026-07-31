import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureLocalUser } from "@/lib/ensure-local-user";
import { listClientsWithTotals } from "@/lib/list-clients";
import { ClientForm } from "./client-form";
import { ClientList } from "./client-list";

export default async function ClientesPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  let rows: Awaited<ReturnType<typeof listClientsWithTotals>> = [];

  if (clerkId && email) {
    const user = await ensureLocalUser(clerkId, email);
    rows = await listClientsWithTotals(user.id);
  }

  return (
    <div className="space-y-6">
      <div className="eo-reveal space-y-2">
        <h1 className="eo-font-display text-3xl font-bold tracking-tight text-[var(--eo-ink)]">
          Clientes
        </h1>
        <p className="text-sm text-[var(--eo-muted)]">
          Quién te paga, canal y acumulado en ARS — para vincular al ledger.
        </p>
      </div>

      <div className="eo-reveal eo-reveal-delay-1">
        <ClientForm />
      </div>
      <div className="eo-reveal eo-reveal-delay-2">
        <ClientList rows={rows} />
      </div>
    </div>
  );
}
