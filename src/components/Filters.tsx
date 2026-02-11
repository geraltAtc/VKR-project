"use client";

import { useState } from "react";

interface FiltersProps {
  onChange?: (filters: any) => void;
}

export const Filters: React.FC<FiltersProps> = ({ onChange }) => {
  const [price, setPrice] = useState<[number, number]>([0, 5000]);
  const [duration, setDuration] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);

  const apply = () => {
    onChange?.({ price, duration, rating });
  };

  return (
    <aside className="p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
      <h4 className="font-semibold mb-2">Фильтры</h4>

      <div className="mb-3">
        <label htmlFor="price-min" className="text-sm">
          Цена
        </label>
        <div className="flex gap-2 mt-2">
          <input
            id="price-min"
            type="number"
            value={price[0]}
            onChange={(e) => setPrice([Number(e.target.value), price[1]])}
            className="w-1/2 p-2 rounded-md border"
          />
          <input
            id="price-max"
            type="number"
            value={price[1]}
            onChange={(e) => setPrice([price[0], Number(e.target.value)])}
            className="w-1/2 p-2 rounded-md border"
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="duration" className="text-sm">
          Длительность
        </label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-2 rounded-md border mt-2"
        >
          <option value="">Любая</option>
          <option value="1-3">1-3 дня</option>
          <option value="4-7">4-7 дней</option>
          <option value=">7">Больше 7</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="rating" className="text-sm">
          Рейтинг
        </label>
        <input type="hidden" id="rating" value={rating ?? ""} />
        <div className="flex gap-2 mt-2">
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              className={`px-2 py-1 rounded ${rating === r ? "bg-[#00D4FF] text-white" : "bg-white/60"}`}
            >
              {r}★
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={apply}
          className="px-3 py-2 bg-[#1A2B48] text-white rounded-lg"
        >
          Применить
        </button>
        <button
          onClick={() => {
            setPrice([0, 5000]);
            setDuration("");
            setRating(null);
            onChange?.({});
          }}
          className="px-3 py-2 border rounded-lg"
        >
          Сброс
        </button>
      </div>
    </aside>
  );
};
