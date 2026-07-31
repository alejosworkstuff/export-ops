"use client";

import { useRouter } from "next/navigation";
import type { ClientOption } from "./income-form";

type Props = {
  clients: ClientOption[];
  selectedClientId: string | null;
};

export function IncomeClientFilter({ clients, selectedClientId }: Props) {
  const router = useRouter();

  if (clients.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="ledger-client-filter" className="eo-label !mb-0">
        Filtrar por cliente
      </label>
      <select
        id="ledger-client-filter"
        value={selectedClientId ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          const params = new URLSearchParams();
          if (value) params.set("clientId", value);
          const qs = params.toString();
          router.push(qs ? `/app/ingresos?${qs}` : "/app/ingresos");
        }}
        className="eo-field-compact max-w-xs"
      >
        <option value="">Todos</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
