export default function IngresosLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando ingresos">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-zinc-100" />
      </div>

      <div className="max-w-xl space-y-4">
        <div className="h-6 w-36 animate-pulse rounded bg-zinc-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-10 animate-pulse rounded-md bg-zinc-100 ${
                i >= 4 ? "sm:col-span-2" : ""
              }`}
            />
          ))}
        </div>
        <div className="h-10 w-36 animate-pulse rounded-md bg-zinc-200" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between gap-3">
          <div className="h-6 w-28 animate-pulse rounded bg-zinc-200" />
          <div className="h-5 w-40 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-48 animate-pulse rounded-md border border-zinc-200 bg-zinc-50" />
      </div>
    </div>
  );
}
