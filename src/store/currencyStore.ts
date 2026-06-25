import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyCode, isValidCurrency } from '../utils/currency';

interface CurrencyState {
  activeCurrency: CurrencyCode;
  rates: Record<string, number>;
  setCurrency: (currency: CurrencyCode) => void;
  setRates: (rates: Record<string, number>) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      activeCurrency: 'GHS', // Default
      rates: {},
      setCurrency: (currency) => set({ activeCurrency: currency }),
      setRates: (rates) => set({ rates }),
    }),
    {
      name: 'gabby_newluk_currency',
      onRehydrateStorage: () => (state) => {
        // Validation step on hydration
        if (state && !isValidCurrency(state.activeCurrency)) {
          state.setCurrency('GHS');
        }
      },
    }
  )
);
