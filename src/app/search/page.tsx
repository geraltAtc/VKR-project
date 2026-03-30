"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components";
import { tourService } from "@/services";
import type { TourSummary } from "@/types/travel";

const humanizeLoadError = (reason: unknown) => {
  if (reason instanceof Error && /failed to fetch/i.test(reason.message)) {
    return "Нет сети и кэш пуст. Откройте раздел онлайн хотя бы один раз, чтобы использовать поиск офлайн.";
  }
  return reason instanceof Error ? reason.message : "Не удалось загрузить туры.";
};

export default function SearchPage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    tourService
      .getAllTours()
      .then((data) => {
        if (!active) return;
        setTours(data);
      })
      .catch((reason) => {
        if (!active) return;
        setError(humanizeLoadError(reason));
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
    <div className="travel-shell">
      <Header />
      <main className="page-enter relative z-10 mx-auto max-w-5xl px-4 py-8">
        <section className="surface-card rounded-3xl p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#16345F] dark:text-slate-100">
            Поиск по направлениям
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ищите тур по городу, стране или названию отеля.
          </p>

          <input
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white/70 px-4 py-2.5 text-sm outline-none ring-[#00D4FF] transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100 dark:placeholder:text-slate-400"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: Барселона, Испания, Hotel..."
          />
        </section>

        <div className="mt-6 space-y-3">
          {isLoading && <p className="text-sm text-slate-500">Загрузка...</p>}
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-sm text-slate-600">Ничего не найдено.</p>
          )}

          {filtered.map((tour) => (
            <article
              key={tour.id}
              className="surface-card rounded-2xl p-4"
            >
              <p className="text-xs uppercase tracking-wide text-[#0E5B7E] dark:text-slate-300">
                {tour.city}, {tour.country}
              </p>
              <h2 className="text-base font-semibold text-[#17385F] dark:text-slate-100">{tour.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{tour.hotelName}</p>
              <Link
                href={`/tours/${tour.id}`}
                className="mt-3 inline-flex rounded-xl bg-[#17385F] px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#102946]"
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
