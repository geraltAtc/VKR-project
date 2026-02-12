"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { useFavoriteStore, type Tour } from "@/store/favoriteStore";
import { useCartStore } from "@/store/cartStore";
import { useCompareStore } from "@/store/compareStore";

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const favorite = useFavoriteStore((state) => state.isFavorite(tour.id));
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const { addToCart } = useCartStore();
  const compared = useCompareStore((state) => state.isCompared(tour.id));
  const toggleCompare = useCompareStore((state) => state.toggleCompare);

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFavorite(tour.id);
    } else {
      addFavorite(tour);
    }
  };

  const handleAddToCart = () => {
    addToCart(tour, 1);
  };

  const handleToggleCompare = () => {
    toggleCompare(tour);
  };

  return (
    <div className="rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm flex flex-col">
      {/* Изображение тура */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {tour.image && (
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Кнопка избранного */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
        >
          <Heart
            size={20}
            className={favorite ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </div>

      {/* Информация о туре */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{tour.name}</h3>

          {tour.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {tour.description}
            </p>
          )}
        </div>

        {tour.price != null && (
          <div className="text-lg font-bold text-[#1A2B48]">
            ${tour.price.toLocaleString()}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#1A2B48] text-white text-sm rounded-xl hover:bg-[#243861] transition"
          >
            <ShoppingCart size={16} />
            В корзину
          </button>
          <button
            onClick={handleToggleCompare}
            className={`inline-flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-xl border ${
              compared
                ? "bg-[#00D4FF]/10 border-[#00D4FF] text-[#00D4FF]"
                : "bg-white/70 border-gray-200 text-gray-700"
            }`}
          >
            {compared ? "В сравнении" : "Сравнить"}
          </button>
        </div>
      </div>
    </div>
  );
};
