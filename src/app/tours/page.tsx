"use client";

import { useEffect, useState } from "react";
import {
  Header,
  HeroSearch,
  Filters,
  ComparisonModal,
  BookingForm,
  TourCard,
  // TourMap,
  // PwaBenefits,
} from "@/components";
import { tourService } from "@/services";
import type { Tour } from "@/store/favoriteStore";

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    price?: [number, number];
    duration?: string;
    rating?: number | null;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t as any).location?.toLowerCase().includes(searchQuery.toLowerCase());

    const [minPrice, maxPrice] = filters.price || [0, Number.MAX_SAFE_INTEGER];
    const priceOk =
      t.price == null ||
      (typeof t.price === "number" && t.price >= minPrice && t.price <= maxPrice);

    const durationFilter = filters.duration;
    let durationOk = true;
    const rawDuration = (t as any).duration as string | undefined;
    if (durationFilter && rawDuration) {
      const daysMatch = rawDuration.match(/\d+/);
      const days = daysMatch ? Number(daysMatch[0]) : undefined;
      if (days != null) {
        if (durationFilter === "1-3") durationOk = days >= 1 && days <= 3;
        if (durationFilter === "4-7") durationOk = days >= 4 && days <= 7;
        if (durationFilter === ">7") durationOk = days > 7;
      }
    }

    const ratingFilter = filters.rating;
    const ratingOk =
      !ratingFilter ||
      ((t as any).rating != null && (t as any).rating >= ratingFilter);

    return matchesSearch && priceOk && durationOk && ratingOk;
  });

  const markers = filteredTours.map((t) => ({
    id: t.id,
    name: t.name,
    lat: (t as any).lat || 51.505,
    lng: (t as any).lng || -0.09,
    price: t.price,
    description: (t as any).location || t.description,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <Header />
      <HeroSearch
        tours={tours}
        onSearchChange={(value) => setSearchQuery(value)}
      />
      {/* <PwaBenefits /> */}

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
              : filteredTours.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        </div>

        <aside className="col-span-1">
          {/* <div className="mb-4">
            <h4 className="font-semibold">Карта</h4>
          </div>
          <div className="h-96">
            <TourMap
              markers={markers}
              center={
                markers[0] ? [markers[0].lat, markers[0].lng] : [51.505, -0.09]
              }
            />
          </div> */}

          <div className="mt-4">
            <BookingForm />
          </div>
        </aside>
      </main>

      <ComparisonModal />
    </div>
  );
}
