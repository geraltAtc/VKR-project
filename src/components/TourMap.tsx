"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Attraction } from "@/types/travel";

interface TourMapProps {
  hotel: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  attractions: Attraction[];
  selectedAttractionId?: string;
  height?: string;
}

interface MapLibreSource {
  setData: (data: Record<string, unknown>) => void;
}

interface MapLibreMap {
  addControl: (control: unknown, position?: string) => void;
  remove: () => void;
  jumpTo: (options: Record<string, unknown>) => void;
  fitBounds: (bounds: number[][], options?: Record<string, unknown>) => void;
  resize: () => void;
  addSource: (id: string, source: Record<string, unknown>) => void;
  getSource: (id: string) => MapLibreSource | undefined;
  removeSource: (id: string) => void;
  addLayer: (layer: Record<string, unknown>) => void;
  getLayer: (id: string) => Record<string, unknown> | undefined;
  removeLayer: (id: string) => void;
  loaded: () => boolean;
}

interface MapLibrePopup {
  setHTML: (html: string) => MapLibrePopup;
}

interface MapLibreMarker {
  setLngLat: (lngLat: [number, number]) => MapLibreMarker;
  setPopup: (popup: MapLibrePopup) => MapLibreMarker;
  addTo: (map: MapLibreMap) => MapLibreMarker;
  remove: () => void;
}

interface MapLibreGlobal {
  Map: new (options: Record<string, unknown>) => MapLibreMap;
  Popup: new (options?: Record<string, unknown>) => MapLibrePopup;
  Marker: new (options?: Record<string, unknown>) => MapLibreMarker;
  NavigationControl: new () => unknown;
}

declare global {
  interface Window {
    maplibregl?: MapLibreGlobal;
  }
}

const MAPLIBRE_SCRIPT_ID = "maplibre-script";
const MAPLIBRE_CSS_ID = "maplibre-css";
const MAPLIBRE_SCRIPT_URL =
  "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.js";
const MAPLIBRE_CSS_URL =
  "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.css";
const ROUTE_SOURCE_ID = "hotel-route-source";
const ROUTE_LAYER_ID = "hotel-route-layer";

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

const loadMapLibre = (): Promise<MapLibreGlobal> =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available"));
      return;
    }

    if (window.maplibregl) {
      resolve(window.maplibregl);
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
      if (window.maplibregl) {
        resolve(window.maplibregl);
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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDistance = (meters: number) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} км`;
  }
  return `${Math.round(meters)} м`;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours} ч ${rest} мин` : `${hours} ч`;
  }
  return `${minutes} мин`;
};

export const TourMap: React.FC<TourMapProps> = ({
  hotel,
  attractions,
  selectedAttractionId,
  height = "440px",
}) => {
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<MapLibreMarker[]>([]);
  const [maplibre, setMapLibre] = useState<MapLibreGlobal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<string | null>(null);

  const selectedAttraction = useMemo(
    () => attractions.find((item) => item.id === selectedAttractionId) ?? null,
    [attractions, selectedAttractionId],
  );

  useEffect(() => {
    let active = true;
    loadMapLibre()
      .then((lib) => {
        if (!active) return;
        setMapLibre(lib);
        setErrorMessage(null);
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(
          `Не удалось загрузить MapLibre: ${error instanceof Error ? error.message : "unknown error"}`,
        );
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
      center: [hotel.lng, hotel.lat],
      zoom: 13,
      attributionControl: true,
    });

    map.addControl(new maplibre.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [maplibre, hotel.lat, hotel.lng]);

  useEffect(() => {
    if (!maplibre || !mapRef.current) return;

    const map = mapRef.current;
    map.jumpTo({ center: [hotel.lng, hotel.lat], zoom: 13 });

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    const hotelPopup = new maplibre.Popup().setHTML(
      `<div style="font-size:13px;line-height:1.4;"><b>${escapeHtml(hotel.name)}</b><br/>${escapeHtml(hotel.address)}</div>`,
    );
    const hotelMarker = new maplibre.Marker({ color: "#1A2B48" })
      .setLngLat([hotel.lng, hotel.lat])
      .setPopup(hotelPopup)
      .addTo(map);
    markerRefs.current.push(hotelMarker);

    for (const attraction of attractions) {
      const popup = new maplibre.Popup().setHTML(
        `<div style="font-size:13px;line-height:1.4;"><b>${escapeHtml(attraction.name)}</b><br/>${escapeHtml(attraction.address)}</div>`,
      );
      const marker = new maplibre.Marker({
        color: attraction.id === selectedAttractionId ? "#E11D48" : "#00D4FF",
      })
        .setLngLat([attraction.lng, attraction.lat])
        .setPopup(popup)
        .addTo(map);
      markerRefs.current.push(marker);
    }
  }, [maplibre, attractions, hotel, selectedAttractionId]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.resize();
  }, [height]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const clearRoute = () => {
      if (map.getLayer(ROUTE_LAYER_ID)) {
        map.removeLayer(ROUTE_LAYER_ID);
      }
      if (map.getSource(ROUTE_SOURCE_ID)) {
        map.removeSource(ROUTE_SOURCE_ID);
      }
      setRouteInfo(null);
    };

    if (!selectedAttraction) {
      clearRoute();
      return;
    }

    let cancelled = false;

    const renderRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${hotel.lng},${hotel.lat};${selectedAttraction.lng},${selectedAttraction.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Routing HTTP ${response.status}`);
        }

        const payload = (await response.json()) as {
          routes?: Array<{
            geometry: Record<string, unknown>;
            distance: number;
            duration: number;
          }>;
        };

        if (cancelled) return;
        const route = payload.routes?.[0];
        if (!route?.geometry) {
          clearRoute();
          return;
        }

        const geojson = {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        };

        const source = map.getSource(ROUTE_SOURCE_ID);
        if (source) {
          source.setData(geojson);
        } else {
          map.addSource(ROUTE_SOURCE_ID, {
            type: "geojson",
            data: geojson,
          });
        }

        if (!map.getLayer(ROUTE_LAYER_ID)) {
          map.addLayer({
            id: ROUTE_LAYER_ID,
            type: "line",
            source: ROUTE_SOURCE_ID,
            paint: {
              "line-color": "#E11D48",
              "line-width": 4,
            },
          });
        }

        map.fitBounds(
          [
            [hotel.lng, hotel.lat],
            [selectedAttraction.lng, selectedAttraction.lat],
          ],
          { padding: 70, maxZoom: 15 },
        );

        setRouteInfo(
          `Маршрут до "${selectedAttraction.name}": ${formatDistance(route.distance)} • ${formatDuration(route.duration)}`,
        );
      } catch (error) {
        if (cancelled) return;
        setRouteInfo(
          `Не удалось построить маршрут: ${error instanceof Error ? error.message : "unknown error"}`,
        );
        clearRoute();
      }
    };

    renderRoute();

    return () => {
      cancelled = true;
    };
  }, [hotel.lat, hotel.lng, hotel.name, selectedAttraction]);

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
      <div ref={mapContainerRef} style={{ height }} />
      <div className="border-t border-slate-200 px-3 py-2 text-xs text-slate-600">
        {routeInfo || "Выберите достопримечательность, чтобы построить маршрут от отеля."}
      </div>
    </div>
  );
};

