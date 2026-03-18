"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChecklistPanel, Header, TourMap, WeatherPanel } from "@/components";
import { tourService } from "@/services";
import type { CountryInfo, TourDetails } from "@/types/travel";

const countryBlocks = (countryInfo: CountryInfo | null) => [
  { title: "Валюта и деньги", value: countryInfo?.currencyInfo },
  { title: "Язык", value: countryInfo?.languageInfo },
  { title: "Транспорт", value: countryInfo?.transportInfo },
  { title: "Климат", value: countryInfo?.climateInfo },
  { title: "Еда и напитки", value: countryInfo?.foodInfo },
  { title: "Безопасность", value: countryInfo?.safetyInfo },
  { title: "Культура", value: countryInfo?.cultureInfo },
  { title: "Полезные контакты", value: countryInfo?.usefulContacts },
];

export default function TourDetailsPage() {
  const params = useParams<{ id: string }>();
  const tourId = params?.id;
  const [tour, setTour] = useState<TourDetails | null>(null);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tourId) {
      setError("Не удалось определить ID тура.");
      setIsLoading(false);
      return;
    }

    let active = true;
    tourService
      .getTourById(tourId)
      .then((data) => {
        if (!active) return;
        setTour(data);
        setSelectedAttractionId(data.attractions[0]?.id);
      })
      .catch((reason) => {
        if (!active) return;
        setError(
          reason instanceof Error ? reason.message : "Не удалось загрузить тур.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tourId]);

  const infoBlocks = useMemo(
    () => countryBlocks(tour?.countryInfo ?? null),
    [tour?.countryInfo],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/tours" className="text-sm text-slate-500 hover:text-slate-700">
          ← К списку туров
        </Link>

        {isLoading && <p className="mt-4 text-sm text-slate-600">Загрузка тура...</p>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        {tour && (
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {tour.city}, {tour.country}
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-[#1A2B48]">{tour.title}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  {tour.startDate} - {tour.endDate}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h2 className="text-sm font-semibold text-slate-700">
                      Отель и проживание
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{tour.hotelName}</p>
                    <p className="text-sm text-slate-600">{tour.hotelAddress}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Заселение: {tour.checkInTime || "не указано"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Выезд: {tour.checkOutTime || "не указано"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{tour.roomDetails}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h2 className="text-sm font-semibold text-slate-700">
                      Трансфер и контакты
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{tour.transferDetails}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Отель: {tour.hotelPhone || "не указано"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Экстренный контакт: {tour.emergencyPhone || "не указано"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Туроператор: {tour.operatorPhone || "не указано"}
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#1A2B48]">
                  Карта направления
                </h2>
                <TourMap
                  hotel={{
                    name: tour.hotelName,
                    address: tour.hotelAddress,
                    lat: tour.hotelLat,
                    lng: tour.hotelLng,
                  }}
                  attractions={tour.attractions}
                  selectedAttractionId={selectedAttractionId}
                />
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#1A2B48]">
                  Достопримечательности
                </h2>

                {tour.attractions.length === 0 && (
                  <p className="text-sm text-slate-600">
                    Пока нет добавленных мест. Администратор может заполнить раздел в
                    панели.
                  </p>
                )}

                <div className="space-y-4">
                  {tour.attractions.map((attraction) => (
                    <article
                      key={attraction.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-800">
                          {attraction.name}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {attraction.category}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">{attraction.address}</p>
                      <p className="mt-2 text-sm text-slate-600">{attraction.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Часы: {attraction.workingHours} | Вход: {attraction.entryPrice} |
                        Время осмотра: {attraction.visitDuration}
                      </p>
                      <p className="mt-2 text-xs text-[#1A2B48]">Совет: {attraction.tips}</p>

                      <button
                        onClick={() => setSelectedAttractionId(attraction.id)}
                        className={`mt-3 inline-flex rounded-xl border px-3 py-1.5 text-xs ${
                          selectedAttractionId === attraction.id
                            ? "border-[#1A2B48] bg-[#1A2B48] text-white"
                            : "border-slate-300 text-slate-700"
                        }`}
                      >
                        {selectedAttractionId === attraction.id
                          ? "Маршрут отображается на карте"
                          : "Показать маршрут на карте"}
                      </button>
                    </article>
                  ))}
                </div>
              </article>
            </section>

            <aside className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#1A2B48]">
                  Информация о стране
                </h2>
                <div className="space-y-3">
                  {infoBlocks.map((item) => (
                    <div key={item.title} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.value || "Пока не заполнено администратором."}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <WeatherPanel tourId={tour.id} lat={tour.hotelLat} lng={tour.hotelLng} />
              <ChecklistPanel tourId={tour.id} items={tour.checklistItems} />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
