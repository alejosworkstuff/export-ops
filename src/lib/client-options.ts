/** Shared client form options — must NOT live in a `"use server"` file. */
export const CHANNELS = ["Wise", "Payoneer", "Deel", "bank", "other"] as const;
export const CURRENCIES = ["USD", "EUR", "ARS"] as const;

export type ClientChannel = (typeof CHANNELS)[number];
export type ClientCurrency = (typeof CURRENCIES)[number];
