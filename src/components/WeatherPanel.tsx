"use client";

import { useEffect, useState } from "react";
import { tourService } from "@/services";
import type { WeatherForecast } from "@/types/travel";

interface WeatherPanelProps {
  tourId: string;
  lat: number;
  lng: number;
}

const humanizeLoadError = (reason: unknown) => {
  if (reason instanceof Error && /failed to fetch/i.test(reason.message)) {
    return "Нет сети и нет локального кэша прогноза.";
  }
  return reason instanceof Error ? reason.message : "Ошибка загрузки погоды.";
};

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ tourId, lat, lng }) => {
  const [data, setData] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    tourService
      .getWeather(lat, lng, tourId)
      .then((forecast) => {
        if (!active) return;
        setData(forecast);
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
  }, [lat, lng, tourId]);

  return (
    <section className="surface-card rounded-3xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-[#1A2B48] dark:text-slate-100">
        Прогноз погоды
      </h3>

      {isLoading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Загрузка прогноза...
        </p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!isLoading && !error && !data && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Нет данных по погоде.
        </p>
      )}

      {data && (
        <div>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            Направление: {data.locationLabel}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.days.map((day) => (
              <article
                key={day.date}
                className="rounded-2xl border border-slate-200/80 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  {day.date}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {day.description}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  День: {day.temperatureDay}°C, Ночь: {day.temperatureNight}°C
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ветер: {day.windSpeed} м/с, Осадки: {day.precipitationProbability}%
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
