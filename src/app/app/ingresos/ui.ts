/** Shared ledger form chrome — keep create/edit visually consistent. */

export const fieldClass =
  "w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-70";

export const fieldClassCompact =
  "w-full rounded-md border bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-70";

export function fieldBorder(hasError: boolean): string {
  return hasError
    ? "border-red-400 focus:ring-red-300"
    : "border-zinc-300 focus:ring-zinc-400";
}

export const arsFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

export const foreignFmt = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
});

export function formatBna(rate: string | number): string {
  return Number(rate).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
