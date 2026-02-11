"use client";

import { useEffect, useState } from "react";
import {
  Header,
  HeroSearch,
  Filters,
  ComparisonModal,
  BookingForm,
  TourCard,
  TourMap,
} from "@/components";
import { tourService } from "@/services";
import { useCompareStore } from "@/store/compareStore";

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, /* filters */ setFilters] = useState<any>({});

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

  const markers = tours.map((t) => ({
    id: t.id,
    name: t.name,
    lat: t.lat || 51.505,
    lng: t.lng || -0.09,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <Header />
      <HeroSearch />

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1">
          <Filters onChange={setFilters} />
        </div>

        <div className="col-span-1 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Каталог туров</h3>
            <p className="text-sm text-muted-foreground">
              {loading ? "Загрузка..." : `${tours.length} туров`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-44 bg-gray-100 animate-pulse rounded-2xl"
                  />
                ))
              : tours.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        </div>

        <aside className="col-span-1">
          <div className="mb-4">
            <h4 className="font-semibold">Карта</h4>
          </div>
          <div className="h-96">
            <TourMap
              markers={markers}
              center={
                markers[0] ? [markers[0].lat, markers[0].lng] : [51.505, -0.09]
              }
            />
          </div>

          <div className="mt-4">
            <BookingForm />
          </div>
        </aside>
      </main>

      <ComparisonModal />
    </div>
  );
}
