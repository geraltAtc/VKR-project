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

interface AreaSectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const AreaSection: React.FC<AreaSectionProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    setIsOpen((value) => {
      const next = !value;
      if (next && typeof window !== "undefined") {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("lite-travel:section-opened"));
        });
      }
      return next;
    });
  };

  return (
    <section className="surface-card rounded-3xl border border-slate-200/80 dark:border-slate-800">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left transition hover:bg-white/40 dark:hover:bg-slate-900/30"
      >
        <div>
          <h2 className="text-base font-semibold text-[#1A2B48] dark:text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <span
          className={`rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 transition dark:border-slate-600 dark:text-slate-300 ${
            isOpen ? "bg-slate-100 dark:bg-slate-800" : "bg-white/70 dark:bg-slate-900/70"
          }`}
        >
          {isOpen ? "Скрыть" : "Открыть"}
        </span>
      </button>

      <div
        className={`border-t border-slate-200/80 px-5 py-4 dark:border-slate-800 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </section>
  );
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
          <div className="mt-4 space-y-4">
            <article className="surface-card rounded-3xl p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {tour.city}, {tour.country}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#16345F] dark:text-slate-100">
                {tour.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {tour.startDate} - {tour.endDate}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                  Достопримечательностей: {tour.attractions.length}
                </span>
                <span className="rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                  Пунктов чек-листа: {tour.checklistItems.length}
                </span>
              </div>
            </article>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="space-y-4 lg:col-span-2">
                <AreaSection
                  title="Проживание и контакты"
                  subtitle="Отель, заселение, трансфер и важные телефоны"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Отель и проживание
                      </h3>
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
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Трансфер и контакты
                      </h3>
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
                </AreaSection>

                <AreaSection
                  title="Карта и маршрут"
                  subtitle="Построение маршрута от отеля до выбранной точки"
                >
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
                </AreaSection>

                <AreaSection
                  title="Достопримечательности"
                  subtitle="Список мест с раскрытием подробностей"
                >
                  {tour.attractions.length === 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Пока нет добавленных мест. Администратор может заполнить раздел в
                      панели.
                    </p>
                  )}

                  <div className="space-y-3">
                    {tour.attractions.map((attraction) => (
                      <details
                        key={attraction.id}
                        className="group rounded-2xl border border-slate-200/80 bg-white/75 dark:border-slate-700 dark:bg-slate-900/60"
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {attraction.name}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {attraction.address}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {attraction.category}
                          </span>
                        </summary>

                        <div className="border-t border-slate-200/80 px-4 pb-4 pt-3 dark:border-slate-700">
                          <p className="text-sm text-slate-600 dark:text-slate-300">{attraction.description}</p>
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
                        </div>
                      </details>
                    ))}
                  </div>
                </AreaSection>
              </section>

              <aside className="space-y-4">
                <AreaSection
                  title="Информация о стране"
                  subtitle="Валюта, язык, безопасность, контакты"
                >
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
                </AreaSection>

                <AreaSection
                  title="Погода"
                  subtitle="Актуальные условия по координатам тура"
                >
                  <WeatherPanel
                    tourId={tour.id}
                    lat={tour.hotelLat}
                    lng={tour.hotelLng}
                    embedded
                  />
                </AreaSection>

                <AreaSection
                  title="Чек-лист"
                  subtitle="Контроль готовности к поездке"
                >
                  <ChecklistPanel tourId={tour.id} items={tour.checklistItems} embedded />
                </AreaSection>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
