type UsdRates = Record<string, number>;

const CACHE_TTL_MS = 1000 * 60 * 60;

const FALLBACK_USD_RATES: UsdRates = {
  USD: 1,
  UGX: 3825,
  KES: 129,
  EUR: 0.92,
  GBP: 0.78,
  ZAR: 18.5,
  NGN: 1575,
  GHS: 15.3,
  TZS: 2575,
};

let cachedRates: UsdRates | null = null;
let cacheTimestamp = 0;

function normalizeCurrencyCode(currency: string): string {
  return currency.trim().toUpperCase();
}

function normalizeRates(rates: unknown): UsdRates | null {
  if (!rates || typeof rates !== "object") {
    return null;
  }

  const normalized: UsdRates = {};
  for (const [key, value] of Object.entries(rates as Record<string, unknown>)) {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate <= 0) {
      continue;
    }
    normalized[normalizeCurrencyCode(key)] = rate;
  }

  if (!normalized.USD) {
    normalized.USD = 1;
  }

  return Object.keys(normalized).length > 1 ? normalized : null;
}

function mergeWithFallback(rates: UsdRates): UsdRates {
  return {
    ...FALLBACK_USD_RATES,
    ...rates,
    USD: 1,
  };
}

async function fetchJsonWithTimeout(
  url: string,
  timeoutMs = 4500,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromOpenErApi(): Promise<UsdRates | null> {
  const payload = (await fetchJsonWithTimeout(
    "https://open.er-api.com/v6/latest/USD",
  )) as { rates?: unknown };
  return normalizeRates(payload.rates);
}

async function fetchFromFrankfurter(): Promise<UsdRates | null> {
  const payload = (await fetchJsonWithTimeout(
    "https://api.frankfurter.app/latest?from=USD",
  )) as { rates?: unknown };
  return normalizeRates(payload.rates);
}

async function fetchFromCurrencyApiPages(): Promise<UsdRates | null> {
  const payload = (await fetchJsonWithTimeout(
    "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
  )) as { usd?: unknown };
  return normalizeRates(payload.usd);
}

export async function getUsdExchangeRates(): Promise<UsdRates> {
  const now = Date.now();
  if (cachedRates && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  const providers = [
    fetchFromOpenErApi,
    fetchFromFrankfurter,
    fetchFromCurrencyApiPages,
  ];

  for (const provider of providers) {
    try {
      const rates = await provider();
      if (rates) {
        cachedRates = mergeWithFallback(rates);
        cacheTimestamp = now;
        return cachedRates;
      }
    } catch (error) {
      console.warn("Exchange rate provider failed:", error);
    }
  }

  cachedRates = { ...FALLBACK_USD_RATES };
  cacheTimestamp = now;
  return cachedRates;
}

export function convertAmountWithUsdBase({
  amount,
  fromCurrency,
  toCurrency,
  usdRates,
}: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  usdRates: UsdRates;
}): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  const from = normalizeCurrencyCode(fromCurrency || "USD");
  const to = normalizeCurrencyCode(toCurrency || "USD");

  if (from === to) {
    return amount;
  }

  const fromRate = usdRates[from];
  const toRate = usdRates[to];

  if (!fromRate || !toRate) {
    return amount;
  }

  const inUsd = amount / fromRate;
  const converted = inUsd * toRate;

  return Number.isFinite(converted) ? converted : amount;
}
