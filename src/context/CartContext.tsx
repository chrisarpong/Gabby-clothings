import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
// import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ---------- Types ----------

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "gabby_cart";

// ---------- Helper ----------

function readGuestCart(): CartItem[] {
  try {
    const data = localStorage.getItem(GUEST_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function addItemToArray(prev: CartItem[], item: CartItem): CartItem[] {
  const existing = prev.find((i) => i.productId === item.productId);
  if (existing) {
    return prev.map((i) =>
      i.productId === item.productId
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    );
  }
  return [...prev, { ...item, id: item.productId }];
}

// ---------- Provider ----------

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated: isSignedIn } = useConvexAuth();

  // Server cart (only fetched when signed in)
  const serverCart = useQuery(api.cart.getCart, isSignedIn ? {} : "skip");

  // Convex mutations
  const addToCartMutation = useMutation(api.cart.addToCart);
  const updateQtyMutation = useMutation(api.cart.updateQuantity);
  const removeItemMutation = useMutation(api.cart.removeFromCart);
  const clearCartMutation = useMutation(api.cart.clearCart);
  const mergeGuestCartMutation = useMutation(api.cart.mergeGuestCart);

  // Guest cart (always available as fallback)
  const [guestCart, setGuestCart] = useState<CartItem[]>(readGuestCart);
  const hasMerged = useRef(false);

  // Persist guest cart changes to localStorage
  useEffect(() => {
    writeGuestCart(guestCart);
  }, [guestCart]);

  // Merge guest → server when user signs in
  useEffect(() => {
    if (isSignedIn && !hasMerged.current) {
      hasMerged.current = true;
      const guestItems = readGuestCart();
      if (guestItems.length > 0) {
        mergeGuestCartMutation({
          items: guestItems.map((item) => ({
            productId: (item.productId || item.id) as Id<"products">,
            quantity: item.quantity,
          })),
        })
          .then(() => {
            localStorage.removeItem(GUEST_CART_KEY);
            setGuestCart([]);
          })
          .catch((err) => {
            console.error("Failed to merge guest cart:", err);
            // Keep guest cart items if merge fails
          });
      }
    }
    if (!isSignedIn) {
      hasMerged.current = false;
    }
  }, [isSignedIn, mergeGuestCartMutation]);

  // Normalize server cart
  const normalizedServerCart: CartItem[] =
    serverCart?.map((item) => ({
      id: item._id,
      productId: item.productId,
      name: item.product?.name ?? "Unknown Product",
      price: item.product?.price ?? 0,
      quantity: item.quantity,
      image: item.product?.images?.[0] ?? "",
    })) ?? [];

  // ── THE KEY FIX ──
  // When signed in: prefer server cart, but fall back to guest cart if server is empty
  // and guest cart has items (means auth isn't synced yet or mutation failed)
  const cart =
    isSignedIn && normalizedServerCart.length > 0
      ? normalizedServerCart
      : isSignedIn && guestCart.length > 0
        ? guestCart
        : isSignedIn
          ? normalizedServerCart
          : guestCart;

  const isLoading = isSignedIn ? serverCart === undefined : false;

  // ---------- Cart actions ----------

  const addToCart = useCallback(
    (item: CartItem) => {
      // Always add to guest cart first (instant UI update)
      setGuestCart((prev) => addItemToArray(prev, item));

      // If signed in, also try the server mutation
      if (isSignedIn) {
        addToCartMutation({
          productId: item.productId as Id<"products">,
          quantity: item.quantity,
        })
          .then(() => {
            // Server succeeded — clear guest cart since server is source of truth
            setGuestCart([]);
            localStorage.removeItem(GUEST_CART_KEY);
          })
          .catch((err) => {
            console.error("Server cart add failed, using local cart:", err);
            // Guest cart already has the item, so UI stays correct
          });
      }
    },
    [isSignedIn, addToCartMutation]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      if (isSignedIn) {
        removeItemMutation({ cartItemId: id as Id<"cartItems"> }).catch(() => {
          setGuestCart((prev) => prev.filter((i) => i.id !== id));
        });
      } else {
        setGuestCart((prev) => prev.filter((i) => i.id !== id));
      }
    },
    [isSignedIn, removeItemMutation]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(id);
        return;
      }
      if (isSignedIn) {
        updateQtyMutation({
          cartItemId: id as Id<"cartItems">,
          quantity,
        }).catch(() => {
          setGuestCart((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
          );
        });
      } else {
        setGuestCart((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
      }
    },
    [isSignedIn, updateQtyMutation, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setGuestCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
    if (isSignedIn) {
      clearCartMutation({}).catch((err) => {
        console.error("Failed to clear server cart:", err);
      });
    }
  }, [isSignedIn, clearCartMutation]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
