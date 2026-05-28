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
  updateItemSize: (cartItemId: string, variantSku?: string) => void;
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
      updateItemSize: (cartItemId, variantSku) => set((state) => {
        const itemToUpdate = state.items.find(i => i.cartItemId === cartItemId);
        if (!itemToUpdate) return state;

        // Check if there is ALREADY an item with the same productId and the NEW variantSku
        const existingMergeTargetIndex = state.items.findIndex(
          (i) => i.productId === itemToUpdate.productId && i.variantSku === variantSku && i.cartItemId !== cartItemId
        );

        if (existingMergeTargetIndex > -1) {
          // Merge quantities and remove the old item
          const newItems = [...state.items];
          newItems[existingMergeTargetIndex].quantity += itemToUpdate.quantity;
          return { items: newItems.filter(i => i.cartItemId !== cartItemId) };
        }

        // Otherwise, update in place
        return {
          items: state.items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, variantSku } : i
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'gabby-newluk-cart',
    }
  )
);
