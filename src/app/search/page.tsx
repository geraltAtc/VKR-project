"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components";
import { tourService } from "@/services";
import type { TourSummary } from "@/types/travel";

export default function SearchPage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    tourService
      .getAllTours()
      .then((data) => {
        if (!active) return;
        setTours(data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query) return tours;
    const lower = query.toLowerCase();
    return tours.filter((tour) =>
      [tour.city, tour.country, tour.title, tour.hotelName]
        .join(" ")
        .toLowerCase()
        .includes(lower),
    );
  }, [query, tours]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#1A2B48]">Поиск по направлениям</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ищите тур по городу, стране или названию отеля.
        </p>

        <input
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none ring-[#00D4FF] focus:ring-2"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Например: Барселона, Испания, Hotel..."
        />

        <div className="mt-6 space-y-3">
          {isLoading && <p className="text-sm text-slate-500">Загрузка...</p>}

          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-slate-600">Ничего не найдено.</p>
          )}

          {filtered.map((tour) => (
            <article
              key={tour.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {tour.city}, {tour.country}
              </p>
              <h2 className="text-base font-semibold text-[#1A2B48]">{tour.title}</h2>
              <p className="text-sm text-slate-600">{tour.hotelName}</p>
              <Link
                href={`/tours/${tour.id}`}
                className="mt-3 inline-flex rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
              >
                Перейти к гиду
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

