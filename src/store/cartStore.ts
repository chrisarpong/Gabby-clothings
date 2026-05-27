import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cartItemId: string; // unique string for the cart item entry
  productId: string;
  variantSku?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        // Check if we already have this product+variant combo
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.variantSku === item.variantSku
        );

        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += item.quantity;
          return { items: newItems };
        }

        return {
          items: [
            ...state.items,
            { ...item, cartItemId: crypto.randomUUID() },
          ],
        };
      }),
      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter((i) => i.cartItemId !== cartItemId),
      })),
      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity } : i
        ),
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'gabby-newluk-cart',
    }
  )
);
