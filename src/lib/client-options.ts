/** Shared client form options, must NOT live in a `"use server"` file. */
export const CURRENCIES = ["USD", "EUR", "ARS"] as const;

export type ClientCurrency = (typeof CURRENCIES)[number];
