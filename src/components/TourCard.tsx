"use client";

import { Heart } from "lucide-react";
import { useFavoriteStore, type Tour } from "@/store/favoriteStore";

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore();
  const favorite = isFavorite(tour.id);

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFavorite(tour.id);
    } else {
      addFavorite(tour);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
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
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{tour.name}</h3>

        {tour.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {tour.description}
          </p>
        )}

        {tour.price && (
          <div className="text-lg font-bold text-blue-600">
            ${tour.price.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
