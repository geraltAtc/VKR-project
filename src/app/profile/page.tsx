"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components";
import { tourService } from "@/services";
import type { TourSummary } from "@/types/travel";

const checklistStoragePrefix = "lite-travel-checklist:";
const humanizeLoadError = (reason: unknown) => {
  if (reason instanceof Error && /failed to fetch/i.test(reason.message)) {
    return "Нет сети и кэш пуст. Откройте туры онлайн хотя бы один раз, чтобы видеть их в офлайне.";
  }
  return reason instanceof Error ? reason.message : "Не удалось загрузить список туров.";
};

export default function ProfilePage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [checklistState, setChecklistState] = useState<Record<string, number>>({});
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
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const progress: Record<string, number> = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(checklistStoragePrefix)) continue;
      const tourId = key.replace(checklistStoragePrefix, "");
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        progress[tourId] = Object.values(parsed).filter(Boolean).length;
      } catch {
        progress[tourId] = 0;
      }
    }

    setChecklistState(progress);
  }, []);

  return (
    <div className="travel-shell">
      <Header />

      <main className="page-enter relative z-10 mx-auto max-w-5xl px-4 py-8">
        <section className="surface-card rounded-3xl p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#16345F] dark:text-slate-100">
            Мой кабинет туриста
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Локальный прогресс по чек-листам хранится на устройстве и доступен даже
            офлайн.
          </p>
        </section>

        <div className="mt-6 grid gap-4">
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {!error && tours.length === 0 && (
            <p className="text-sm text-slate-600">Нет доступных туров.</p>
          )}

          {tours.map((tour) => (
            <article
              key={tour.id}
              className="surface-card rounded-2xl p-4"
            >
              <p className="text-xs uppercase tracking-wide text-[#0E5B7E] dark:text-slate-300">
                {tour.city}, {tour.country}
              </p>
              <h2 className="text-base font-semibold text-[#17385F] dark:text-slate-100">{tour.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Выполнено пунктов: {checklistState[tour.id] ?? 0}
              </p>
              <Link
                href={`/tours/${tour.id}`}
                className="mt-3 inline-flex rounded-xl bg-[#17385F] px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#102946]"
              >
                Открыть тур
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
