export const SUPPORTED_CURRENCIES = ['GHS', 'USD', 'GBP', 'EUR', 'ZAR', 'NGN', 'CAD', 'AUD', 'JPY', 'AED'] as const;
export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number];

const localeMap: Record<CurrencyCode, string> = {
  GHS: 'en-GH',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'de-DE', // General EUR locale formatting
  ZAR: 'en-ZA',
  NGN: 'en-NG',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  AED: 'ar-AE',
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
  let rate = currency === 'GHS' ? 1 : (rates[currency] ?? 1);
  
  // Smart math based on user clue: "if the rate of that currency is high you know the maths to do"
  // If a user enters '15' for USD (meaning 1 USD = 15 GHS), they expect the system to divide.
  // We apply this logic to currencies that are historically stronger than GHS (where 1 GHS < 1 Foreign is normal).
  const isStrongCurrency = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'ZAR'].includes(currency);
  if (isStrongCurrency && rate > 1) {
    // Inverse the rate (e.g., 15 becomes 1/15 = 0.0666)
    rate = 1 / rate;
  }

  const converted = amountInGHS * rate;

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
  }).format(converted);
}
