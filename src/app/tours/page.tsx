"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, TourCard } from "@/components";
import { tourService } from "@/services";
import type { TourSummary } from "@/types/travel";

const humanizeLoadError = (reason: unknown, fallback: string) => {
  if (reason instanceof Error && /failed to fetch/i.test(reason.message)) {
    return "Нет сети и кэш пуст. Откройте тур онлайн хотя бы один раз, чтобы он был доступен офлайн.";
  }
  return reason instanceof Error ? reason.message : fallback;
};

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefetchedTourIdsRef = useRef<Set<string>>(new Set());

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
        setError(humanizeLoadError(reason, "Не удалось загрузить список туров."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const pendingTours = tours.filter(
      (tour) => !prefetchedTourIdsRef.current.has(tour.id),
    );
    if (pendingTours.length === 0) return;

    pendingTours.forEach((tour) => {
      prefetchedTourIdsRef.current.add(tour.id);
      router.prefetch(`/tours/${tour.id}`);
    });

    void Promise.allSettled(
      pendingTours.map(async (tour) => {
        const details = await tourService.getTourById(tour.id);
        await tourService.getWeather(details.hotelLat, details.hotelLng, details.id);
      }),
    );
  }, [router, tours]);

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
    <div className="travel-shell">
      <Header />

      <main className="page-enter relative z-10 mx-auto max-w-7xl px-4 py-8">
        <section className="hero-card rounded-3xl p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Мои туры
            </h1>
            <Link
              href="/admin/login"
              className="glass-chip rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
            >
              Вход для администратора
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            Единый гид по поездке: проживание, карта, ориентиры, полезные контакты и
            чек-лист в одном месте.
          </p>

          <div className="mt-5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по городу, стране, отелю..."
              className="w-full rounded-2xl border border-white/35 bg-white/16 px-4 py-2.5 text-sm text-white placeholder:text-white/70 outline-none ring-[#00D4FF] transition focus:ring-2"
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
