export const SUPPORTED_CURRENCIES = ['GHS', 'USD', 'GBP', 'EUR'] as const;
export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number];

const localeMap: Record<CurrencyCode, string> = {
  GHS: 'en-GH',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'de-DE', // General EUR locale formatting
};

export function isValidCurrency(currency: string): currency is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(currency as CurrencyCode);
}

export function formatPrice(
  amountInGHS: number | undefined | null, 
  currency: CurrencyCode, 
  rates: Record<string, number> = {}
): string {
  // Guard against invalid inputs
  if (amountInGHS === undefined || amountInGHS === null || isNaN(amountInGHS)) {
    return 'GH₵0.00';
  }

  // Base rate logic (GHS -> GHS is always 1)
  const rate = currency === 'GHS' ? 1 : (rates[currency] ?? 1);
  const converted = amountInGHS * rate;

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
  }).format(converted);
}
