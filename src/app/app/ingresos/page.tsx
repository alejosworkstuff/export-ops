import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { toArDateKey } from "@/lib/bna";
import { prisma } from "@/lib/db";
import { ensureLocalUser } from "@/lib/ensure-local-user";
import { listIncomesPage, type IncomeListPage } from "@/lib/list-incomes";
import { IncomeClientFilter } from "./income-client-filter";
import { IncomeForm } from "./income-form";
import { IncomeList } from "./income-list";

type IngresosPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    clientId?: string | string[];
  }>;
};

const emptyList = (): IncomeListPage => ({
  rows: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  totalArs: new Prisma.Decimal(0),
});

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IngresosPage({ searchParams }: IngresosPageProps) {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  const params = await searchParams;
  const pageParam = firstParam(params.page);
  const clientIdParam = firstParam(params.clientId);
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  let clients: { id: string; name: string }[] = [];
  let list = emptyList();
  let selectedClientId: string | null = null;

  if (clerkId && email) {
    const user = await ensureLocalUser(clerkId, email);
    clients = await prisma.client.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    if (
      clientIdParam &&
      clients.some((c) => c.id === clientIdParam)
    ) {
      selectedClientId = clientIdParam;
    }

    list = await listIncomesPage(user.id, page, {
      clientId: selectedClientId,
    });
  }

  const defaultEarnedAt = toArDateKey(new Date());
  const selectedName = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)?.name
    : null;

  return (
    <div className="space-y-6">
      <div className="eo-reveal space-y-2">
        <h1 className="eo-font-display text-3xl font-bold tracking-tight text-[var(--eo-ink)]">
          Ingresos
        </h1>
        <p className="text-sm text-[var(--eo-muted)]">
          Cobros en moneda extranjera convertidos a pesos (tipo BNA vendedor).
          {selectedName ? (
            <>
              {" "}
              Filtrado: <span className="font-medium text-[var(--eo-ink)]">{selectedName}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="eo-reveal eo-reveal-delay-1">
        <IncomeForm clients={clients} defaultEarnedAt={defaultEarnedAt} />
      </div>
      <div className="eo-reveal eo-reveal-delay-2 space-y-3">
        <IncomeClientFilter
          clients={clients}
          selectedClientId={selectedClientId}
        />
        <IncomeList
          data={list}
          clients={clients}
          filterClientId={selectedClientId}
        />
      </div>
    </div>
  );
}
