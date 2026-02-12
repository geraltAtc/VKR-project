"use client";

import { useEffect, useState } from "react";
import { Header, HeroSearch, TourCard } from "@/components";
import { tourService } from "@/services";
import type { Tour } from "@/store/favoriteStore";

export default function SearchPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    tourService
      .getAllTours()
      .then((data) => {
        if (!mounted) return;
        setTours(data || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = tours.filter((t) => {
    if (!query) return true;
    const lower = query.toLowerCase();
    const inName = t.name.toLowerCase().includes(lower);
    const inDescription = t.description?.toLowerCase().includes(lower);
    const inLocation = (t as any).location
      ?.toLowerCase()
      .includes(lower);
    return inName || inDescription || inLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <Header />
      <HeroSearch tours={tours} onSearchChange={setQuery} />

      <main className="max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-semibold mb-2">Результаты поиска</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {loading
            ? "Загрузка..."
            : `${filtered.length} туров по запросу "${query || "все"}"`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-44 bg-gray-100 animate-pulse rounded-2xl"
                />
              ))
            : filtered.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      </main>
    </div>
  );
}

