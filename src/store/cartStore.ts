import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tour } from "./favoriteStore";

interface CartItem extends Tour {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (tour: Tour, quantity?: number) => void;
  removeFromCart: (tourId: string) => void;
  updateQuantity: (tourId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (tour, quantity = 1) => {
        set((state) => {
          const exists = state.items.find((i) => i.id === tour.id);
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.id === tour.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...tour, quantity }] };
        });
      },
      removeFromCart: (tourId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== tourId) }));
      },
      updateQuantity: (tourId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === tourId ? { ...i, quantity } : i,
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "cart-store" },
  ),
);
