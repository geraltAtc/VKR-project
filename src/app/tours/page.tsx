"use client";

import { useEffect, useMemo, useState } from "react";
import { Header, TourCard } from "@/components";
import { tourService } from "@/services";
import type { TourSummary } from "@/types/travel";

export default function ToursPage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    tourService
      .getAllTours()
      .then((data) => {
        if (!active) return;
        setTours(data);
      })
      .catch((reason) => {
        if (!active) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Не удалось загрузить список туров.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredTours = useMemo(() => {
    if (!query) return tours;
    const lower = query.toLowerCase();
    return tours.filter((tour) =>
      [tour.title, tour.city, tour.country, tour.hotelName]
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
  }, [query, tours]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#1A2B48]">Мои туры</h1>
          <p className="mt-2 text-sm text-slate-600">
            Откройте нужный тур, чтобы увидеть отель, карту, достопримечательности,
            страну и персональный чек-лист.
          </p>

          <div className="mt-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по городу, стране, отелю..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none ring-[#00D4FF] focus:ring-2"
            />
          </div>
        </section>

        <section className="mt-6">
          {isLoading && <p className="text-sm text-slate-500">Загрузка туров...</p>}
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {!isLoading && !error && filteredTours.length === 0 && (
            <p className="text-sm text-slate-600">По вашему запросу туров не найдено.</p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

