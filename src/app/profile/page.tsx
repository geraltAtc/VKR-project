"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components";
import { tourService } from "@/services";
import type { TourSummary } from "@/types/travel";

const checklistStoragePrefix = "lite-travel-checklist:";

export default function ProfilePage() {
  const [tours, setTours] = useState<TourSummary[]>([]);
  const [checklistState, setChecklistState] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    tourService.getAllTours().then((data) => {
      if (!active) return;
      setTours(data);
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#1A2B48]">Мой кабинет туриста</h1>
        <p className="mt-2 text-sm text-slate-600">
          Здесь отображается локальный прогресс по чек-листам, который доступен даже
          в офлайне.
        </p>

        <div className="mt-6 grid gap-4">
          {tours.map((tour) => (
            <article
              key={tour.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {tour.city}, {tour.country}
              </p>
              <h2 className="text-base font-semibold text-[#1A2B48]">{tour.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Выполнено пунктов: {checklistState[tour.id] ?? 0}
              </p>
              <Link
                href={`/tours/${tour.id}`}
                className="mt-3 inline-flex rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
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

