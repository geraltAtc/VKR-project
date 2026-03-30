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

const humanizeLoadError = (reason: unknown) => {
  if (reason instanceof Error && /failed to fetch/i.test(reason.message)) {
    return "Нет сети и кэш этого тура пуст. Откройте тур онлайн хотя бы один раз, чтобы использовать его офлайн.";
  }
  return reason instanceof Error ? reason.message : "Не удалось загрузить тур.";
};

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
        setError(humanizeLoadError(reason));
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
    <div className="travel-shell">
      <Header />
      <main className="page-enter relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/tours"
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← К списку туров
        </Link>

        {isLoading && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Загрузка тура...
          </p>
        )}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        {tour && (
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="space-y-6 lg:col-span-2">
              <article className="surface-card rounded-3xl p-6">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {tour.city}, {tour.country}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#16345F] dark:text-slate-100">
                  {tour.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {tour.startDate} - {tour.endDate}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Отель и проживание
                    </h2>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{tour.hotelName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{tour.hotelAddress}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Заселение: {tour.checkInTime || "не указано"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Выезд: {tour.checkOutTime || "не указано"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{tour.roomDetails}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Трансфер и контакты
                    </h2>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{tour.transferDetails}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Отель: {tour.hotelPhone || "не указано"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Экстренный контакт: {tour.emergencyPhone || "не указано"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Туроператор: {tour.operatorPhone || "не указано"}
                    </p>
                  </div>
                </div>
              </article>

              <article className="surface-card rounded-3xl p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1A2B48] dark:text-slate-100">
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

              <article className="surface-card rounded-3xl p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1A2B48] dark:text-slate-100">
                  Достопримечательности
                </h2>

                {tour.attractions.length === 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Пока нет добавленных мест. Администратор может заполнить раздел в
                    панели.
                  </p>
                )}

                <div className="space-y-4">
                  {tour.attractions.map((attraction) => (
                    <article
                      key={attraction.id}
                      className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                          {attraction.name}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {attraction.category}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{attraction.address}</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{attraction.description}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Часы: {attraction.workingHours} | Вход: {attraction.entryPrice} |
                        Время осмотра: {attraction.visitDuration}
                      </p>
                      <p className="mt-2 text-xs text-[#1A2B48] dark:text-slate-200">
                        Совет: {attraction.tips}
                      </p>

                      <button
                        onClick={() => setSelectedAttractionId(attraction.id)}
                        className={`mt-3 inline-flex rounded-xl border px-3 py-1.5 text-xs ${
                          selectedAttractionId === attraction.id
                            ? "border-[#17385F] bg-[#17385F] text-white"
                            : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
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
              <article className="surface-card rounded-3xl p-5">
                <h2 className="mb-4 text-lg font-semibold text-[#1A2B48] dark:text-slate-100">
                  Информация о стране
                </h2>
                <div className="space-y-3">
                  {infoBlocks.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-200/80 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-900/60"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
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
