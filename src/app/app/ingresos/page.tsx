import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { toArDateKey } from "@/lib/bna";
import { prisma } from "@/lib/db";
import { ensureLocalUser } from "@/lib/ensure-local-user";
import { listIncomesPage, type IncomeListPage } from "@/lib/list-incomes";
import { IncomeForm } from "./income-form";
import { IncomeList } from "./income-list";

type IngresosPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const emptyList = (): IncomeListPage => ({
  rows: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  totalArs: new Prisma.Decimal(0),
});

export default async function IngresosPage({ searchParams }: IngresosPageProps) {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  let clients: { id: string; name: string }[] = [];
  let list = emptyList();

  if (clerkId && email) {
    const user = await ensureLocalUser(clerkId, email);
    const [clientRows, incomePage] = await Promise.all([
      prisma.client.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      listIncomesPage(user.id, page),
    ]);
    clients = clientRows;
    list = incomePage;
  }

  const defaultEarnedAt = toArDateKey(new Date());

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Ingresos
        </h1>
        <p className="text-sm text-zinc-600">
          Ledger de ingresos en moneda extranjera convertidos a ARS (BNA
          vendedor).
        </p>
      </div>

      <IncomeForm clients={clients} defaultEarnedAt={defaultEarnedAt} />
      <IncomeList data={list} clients={clients} />
    </div>
  );
}
