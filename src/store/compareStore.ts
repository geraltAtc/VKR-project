import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tour } from "./favoriteStore";

interface CompareStore {
  items: Tour[];
  toggleCompare: (tour: Tour) => void;
  remove: (tourId: string) => void;
  clear: () => void;
  isCompared: (tourId: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleCompare: (tour) => {
        set((state) => {
          if (state.items.some((i) => i.id === tour.id)) {
            return { items: state.items.filter((i) => i.id !== tour.id) };
          }
          if (state.items.length >= 4) return state; // limit to 4 items
          return { items: [...state.items, tour] };
        });
      },
      remove: (tourId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== tourId) })),
      clear: () => set({ items: [] }),
      isCompared: (tourId) => get().items.some((i) => i.id === tourId),
    }),
    { name: "compare-store" },
  ),
);
