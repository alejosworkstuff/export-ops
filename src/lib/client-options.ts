export const CURRENCIES = ["USD", "EUR", "ARS"] as const;

export type ClientCurrency = (typeof CURRENCIES)[number];
