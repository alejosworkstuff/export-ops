/** Shared ledger form chrome — keep create/edit visually consistent. */

export const fieldClass = "eo-field";

export const fieldClassCompact = "eo-field-compact";

export function fieldBorder(hasError: boolean): string {
  return hasError ? "eo-field-error" : "";
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
