"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface CoordinatePickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onPick: (coords: { lat: number; lng: number }) => void;
  height?: string;
}

interface PickerMapLibreMapClickEvent {
  lngLat: {
    lng: number;
    lat: number;
  };
}

interface PickerMapLibreMap {
  addControl: (control: unknown, position?: string) => void;
  remove: () => void;
  jumpTo: (options: Record<string, unknown>) => void;
  on: (event: string, handler: (event: PickerMapLibreMapClickEvent) => void) => void;
}

interface PickerMapLibreMarker {
  setLngLat: (lngLat: [number, number]) => PickerMapLibreMarker;
  addTo: (map: PickerMapLibreMap) => PickerMapLibreMarker;
  remove: () => void;
}

interface PickerMapLibreGlobal {
  Map: new (options: Record<string, unknown>) => PickerMapLibreMap;
  Marker: new (options?: Record<string, unknown>) => PickerMapLibreMarker;
  NavigationControl: new () => unknown;
}

const MAPLIBRE_SCRIPT_ID = "maplibre-script";
const MAPLIBRE_CSS_ID = "maplibre-css";
const MAPLIBRE_SCRIPT_URL = "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.js";
const MAPLIBRE_CSS_URL = "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.css";

const defaultStyle = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const isValidCoordinatePair = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

const loadMapLibre = (): Promise<PickerMapLibreGlobal> =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available"));
      return;
    }

    const windowWithMapLibre = window as Window & { maplibregl?: PickerMapLibreGlobal };

    if (windowWithMapLibre.maplibregl) {
      resolve(windowWithMapLibre.maplibregl);
      return;
    }

    if (!document.getElementById(MAPLIBRE_CSS_ID)) {
      const link = document.createElement("link");
      link.id = MAPLIBRE_CSS_ID;
      link.rel = "stylesheet";
      link.href = MAPLIBRE_CSS_URL;
      document.head.appendChild(link);
    }

    const onReady = () => {
      const windowWithLib = window as Window & { maplibregl?: PickerMapLibreGlobal };
      if (windowWithLib.maplibregl) {
        resolve(windowWithLib.maplibregl);
      } else {
        reject(new Error("MapLibre loaded but global object is missing"));
      }
    };

    const onError = () => reject(new Error("Failed to load maplibre-gl"));

    const existingScript = document.getElementById(
      MAPLIBRE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", onReady, { once: true });
      existingScript.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = MAPLIBRE_SCRIPT_ID;
    script.src = MAPLIBRE_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.body.appendChild(script);
  });

export const CoordinatePickerMap: React.FC<CoordinatePickerMapProps> = ({
  initialLat,
  initialLng,
  onPick,
  height = "320px",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<PickerMapLibreMap | null>(null);
  const markerRef = useRef<PickerMapLibreMarker | null>(null);
  const [maplibre, setMapLibre] = useState<PickerMapLibreGlobal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialCenter = useMemo<[number, number]>(() => {
    if (
      typeof initialLat === "number" &&
      typeof initialLng === "number" &&
      isValidCoordinatePair(initialLat, initialLng)
    ) {
      return [initialLng, initialLat];
    }
    return [37.6176, 55.7558];
  }, [initialLat, initialLng]);

  useEffect(() => {
    let active = true;
    loadMapLibre()
      .then((lib) => {
        if (!active) return;
        setMapLibre(lib);
        setError(null);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "unknown error");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!maplibre || !mapContainerRef.current || mapRef.current) return;

    const map = new maplibre.Map({
      container: mapContainerRef.current,
      style: defaultStyle,
      center: initialCenter,
      zoom: 13,
      attributionControl: true,
    });

    map.addControl(new maplibre.NavigationControl(), "top-right");
    mapRef.current = map;

    if (
      typeof initialLat === "number" &&
      typeof initialLng === "number" &&
      isValidCoordinatePair(initialLat, initialLng)
    ) {
      markerRef.current = new maplibre.Marker({ color: "#E11D48" })
        .setLngLat([initialLng, initialLat])
        .addTo(map);
    }

    map.on("click", (event) => {
      const lat = event.lngLat.lat;
      const lng = event.lngLat.lng;
      if (!isValidCoordinatePair(lat, lng)) return;

      if (!markerRef.current) {
        markerRef.current = new maplibre.Marker({ color: "#E11D48" })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      onPick({ lat, lng });
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter, initialLat, initialLng, maplibre, onPick]);

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-600"
      >
        Загрузка карты выбора координат...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ height }}
        className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
      >
        Не удалось загрузить карту: {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div ref={mapContainerRef} style={{ height }} />
      <p className="border-t border-slate-200 px-3 py-2 text-xs text-slate-600">
        Кликните на карте, чтобы выбрать координаты.
      </p>
    </div>
  );
};
