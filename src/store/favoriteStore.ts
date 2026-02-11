import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tour {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
}

interface FavoriteStore {
  favorites: Tour[];
  addFavorite: (tour: Tour) => void;
  removeFavorite: (tourId: string) => void;
  isFavorite: (tourId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (tour: Tour) => {
        set((state) => {
          if (!state.favorites.find((fav) => fav.id === tour.id)) {
            return { favorites: [...state.favorites, tour] };
          }
          return state;
        });
      },
      removeFavorite: (tourId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== tourId),
        }));
      },
      isFavorite: (tourId: string) => {
        return get().favorites.some((fav) => fav.id === tourId);
      },
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: "favorite-store",
    },
  ),
);
