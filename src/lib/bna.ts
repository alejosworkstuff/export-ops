/**
 * BNA vendedor rate helper.
 * - USD historical: bluelytics Oficial series
 * - USD/EUR "today": dolarapi oficial venta
 * - Always accepts manual paste; caches by currency+day
 */

export type BnaCurrency = "USD" | "EUR";

export type BnaRateResult = {
  rate: number;
  date: string; // YYYY-MM-DD (rate day actually used)
  currency: BnaCurrency;
  source: "cache" | "manual" | "dolarapi" | "bluelytics";
};

const cache = new Map<string, BnaRateResult>();

function cacheKey(currency: BnaCurrency, date: string) {
  return `${currency}:${date}`;
}

/** Normalize Date | YYYY-MM-DD to calendar day in America/Argentina/Buenos_Aires. */
export function toArDateKey(input: Date | string): string {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${String(input)}`);
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function todayArKey(): string {
  return toArDateKey(new Date());
}

/** Inject / override a rate for a day (paste path). */
export function setManualBnaRate(
  date: Date | string,
  currency: BnaCurrency,
  rate: number,
): BnaRateResult {
  if (!(rate > 0) || !Number.isFinite(rate)) {
    throw new Error("BNA rate must be a positive number");
  }

  const dateKey = toArDateKey(date);
  const result: BnaRateResult = {
    rate,
    date: dateKey,
    currency,
    source: "manual",
  };
  cache.set(cacheKey(currency, dateKey), result);
  return result;
}

export function clearBnaCache() {
  cache.clear();
}

type BluelyticsPoint = {
  date: string;
  source: string;
  value_sell: number;
  value_buy: number;
};

async function fetchBluelyticsOficialSeries(): Promise<BluelyticsPoint[]> {
  const res = await fetch(
    "https://api.bluelytics.com.ar/v2/evolution.json?days=400",
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) {
    throw new Error(`bluelytics evolution failed: ${res.status}`);
  }
  const data = (await res.json()) as BluelyticsPoint[];
  return data.filter((p) => p.source === "Oficial");
}

async function fetchDolarapiVenta(currency: BnaCurrency): Promise<number> {
  const path =
    currency === "USD" ? "/v1/dolares/oficial" : "/v1/cotizaciones/eur";
  const res = await fetch(`https://dolarapi.com${path}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`dolarapi failed: ${res.status}`);
  }
  const data = (await res.json()) as { venta: number };
  if (!(data.venta > 0)) {
    throw new Error("dolarapi returned invalid venta");
  }
  return data.venta;
}

function findRateOnOrBefore(
  series: BluelyticsPoint[],
  dateKey: string,
): BluelyticsPoint | undefined {
  const sorted = [...series].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.find((p) => p.date <= dateKey);
}

/**
 * Resolve BNA vendedor for `date` + currency.
 * Pass `manualRate` to skip fetch (paste). Cached per currency+day.
 */
export async function getBnaVendedorRate(options: {
  date: Date | string;
  currency?: BnaCurrency;
  manualRate?: number;
}): Promise<BnaRateResult> {
  const currency = options.currency ?? "USD";
  const dateKey = toArDateKey(options.date);

  if (options.manualRate != null) {
    return setManualBnaRate(dateKey, currency, options.manualRate);
  }

  const hit = cache.get(cacheKey(currency, dateKey));
  if (hit) {
    return { ...hit, source: "cache" };
  }

  // EUR has no public historical series here, today via dolarapi, else require paste.
  if (currency === "EUR") {
    if (dateKey === todayArKey()) {
      const rate = await fetchDolarapiVenta("EUR");
      const result: BnaRateResult = {
        rate,
        date: dateKey,
        currency,
        source: "dolarapi",
      };
      cache.set(cacheKey(currency, dateKey), result);
      return result;
    }
    throw new Error(
      `No hay serie histórica EUR para ${dateKey}. Pasá manualRate (paste BNA vendedor).`,
    );
  }

  // USD: prefer historical series; fall back to dolarapi for today if series miss.
  try {
    const series = await fetchBluelyticsOficialSeries();
    const point = findRateOnOrBefore(series, dateKey);
    if (point) {
      const result: BnaRateResult = {
        rate: point.value_sell,
        date: point.date,
        currency,
        source: "bluelytics",
      };
      cache.set(cacheKey(currency, dateKey), result);
      return result;
    }
  } catch {
    // fall through to dolarapi for today
  }

  if (dateKey === todayArKey()) {
    const rate = await fetchDolarapiVenta("USD");
    const result: BnaRateResult = {
      rate,
      date: dateKey,
      currency,
      source: "dolarapi",
    };
    cache.set(cacheKey(currency, dateKey), result);
    return result;
  }

  throw new Error(
    `No se pudo obtener BNA USD para ${dateKey}. Pasá manualRate (paste).`,
  );
}
