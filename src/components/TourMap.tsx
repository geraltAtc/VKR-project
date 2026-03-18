"use client";

import { useEffect, useRef, useState } from "react";
import type { Attraction } from "@/types/travel";

interface TourMapProps {
  hotel: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  attractions: Attraction[];
  height?: string;
}

interface YandexMapInstance {
  destroy: () => void;
  geoObjects: {
    add: (object: unknown) => void;
  };
  setBounds: (bounds: unknown, options?: Record<string, unknown>) => void;
}

interface YandexMapsApi {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YandexMapInstance;
  Placemark: new (
    coordinates: number[],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => unknown;
}

declare global {
  interface Window {
    ymaps?: YandexMapsApi;
  }
}

const YANDEX_SCRIPT_ID = "yandex-maps-script";
const MAP_CONTAINER_ID = "tour-ymap";

const loadYandexMaps = (apiKey: string): Promise<YandexMapsApi> =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available"));
      return;
    }

    if (window.ymaps) {
      resolve(window.ymaps);
      return;
    }

    const existing = document.getElementById(YANDEX_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    const scriptUrl = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(
      apiKey,
    )}&lang=ru_RU`;

    const handleReady = () => {
      if (!window.ymaps) {
        reject(new Error("Yandex Maps global object is missing"));
        return;
      }

      window.ymaps.ready(() => resolve(window.ymaps as YandexMapsApi));
    };

    if (existing) {
      existing.addEventListener("load", handleReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("Script load error")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = YANDEX_SCRIPT_ID;
    script.src = scriptUrl;
    script.async = true;
    script.addEventListener("load", handleReady, { once: true });
    script.addEventListener("error", () => reject(new Error("Script load error")), {
      once: true,
    });
    document.body.appendChild(script);
  });

export const TourMap: React.FC<TourMapProps> = ({
  hotel,
  attractions,
  height = "440px",
}) => {
  const mapRef = useRef<YandexMapInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    if (!apiKey) {
      setErrorMessage(
        "Ключ Яндекс.Карт не задан. Укажите NEXT_PUBLIC_YANDEX_MAPS_API_KEY в .env.local.",
      );
      setIsLoading(false);
      return;
    }

    let mounted = true;

    loadYandexMaps(apiKey)
      .then((ymaps) => {
        if (!mounted) return;

        const container = document.getElementById(MAP_CONTAINER_ID);
        if (!container) {
          setErrorMessage("Не удалось инициализировать контейнер карты.");
          return;
        }

        const map = new ymaps.Map(
          container,
          {
            center: [hotel.lat, hotel.lng],
            zoom: 13,
            controls: ["zoomControl", "fullscreenControl"],
          },
          { suppressMapOpenBlock: true },
        );

        const hotelPlacemark = new ymaps.Placemark(
          [hotel.lat, hotel.lng],
          {
            balloonContentHeader: hotel.name,
            balloonContentBody: hotel.address,
            hintContent: "Отель",
          },
          {
            preset: "islands#blueHotelIcon",
          },
        );

        map.geoObjects.add(hotelPlacemark);

        for (const attraction of attractions) {
          const place = new ymaps.Placemark(
            [attraction.lat, attraction.lng],
            {
              balloonContentHeader: attraction.name,
              balloonContentBody: `${attraction.address}<br/>${attraction.workingHours}`,
              hintContent: attraction.name,
            },
            { preset: "islands#nightAttractionIcon" },
          );

          map.geoObjects.add(place);
        }

        mapRef.current = map;
      })
      .catch((error) => {
        setErrorMessage(
          `Не удалось загрузить Яндекс.Карты: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [attractions, hotel.address, hotel.lat, hotel.lng, hotel.name]);

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
      >
        Загрузка карты...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        style={{ height }}
        className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div id={MAP_CONTAINER_ID} style={{ height }} />
    </div>
  );
};

