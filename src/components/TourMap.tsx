"use client";

import { useEffect, useRef, useState } from "react";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  price?: number;
}

type LatLngTuple = [number, number];

interface TourMapProps {
  markers: MapMarker[];
  center?: LatLngTuple;
  zoom?: number;
  height?: string;
}

interface MapLibreMap {
  addControl: (control: unknown, position?: string) => void;
  jumpTo: (options: Record<string, unknown>) => void;
  resize: () => void;
  remove: () => void;
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

type MapLibreModule = {
  Map: new (options: Record<string, unknown>) => MapLibreMap;
  Marker: new (options?: Record<string, unknown>) => MapLibreMarker;
  Popup: new (options?: Record<string, unknown>) => MapLibrePopup;
  NavigationControl: new () => unknown;
};

declare global {
  interface Window {
    maplibregl?: MapLibreModule;
  }
}

const MAPLIBRE_SCRIPT_ID = "maplibre-script";
const MAPLIBRE_CSS_ID = "maplibre-css";
const MAPLIBRE_SCRIPT_URL =
  "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.js";
const MAPLIBRE_CSS_URL =
  "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.css";
const MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const popupMarkup = (marker: MapMarker) => {
  const name = escapeHtml(marker.name);
  const description = marker.description ? escapeHtml(marker.description) : "";
  const price =
    marker.price != null
      ? `<p style="margin:0 0 4px 0;font-weight:600;color:#00D4FF;">$${marker.price.toLocaleString()}</p>`
      : "";

  return `
    <div style="font-size:14px;line-height:1.4;max-width:220px;">
      <h4 style="margin:0 0 6px 0;font-weight:700;">${name}</h4>
      ${price}
      ${description ? `<p style="margin:0;">${description}</p>` : ""}
    </div>
  `;
};

const loadMapLibre = (): Promise<MapLibreModule> =>
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

export const TourMap: React.FC<TourMapProps> = ({
  markers,
  center = [51.505, -0.09],
  zoom = 13,
  height = "400px",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [maplibre, setMapLibre] = useState<MapLibreModule | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<MapLibreMarker[]>([]);

  useEffect(() => {
    let active = true;

    loadMapLibre()
      .then((mod) => {
        if (!active) return;
        setMapLibre(mod);
        setHasError(false);
      })
      .catch((err) => {
        console.error("Failed to load MapLibre GL JS", err);
        if (!active) return;
        setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!maplibre || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibre.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: [center[1], center[0]],
      zoom,
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
  }, [maplibre, center, zoom]);

  useEffect(() => {
    if (!maplibre || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    map.jumpTo({
      center: [center[1], center[0]],
      zoom,
    });

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    markers.forEach((marker) => {
      const popup = new maplibre.Popup({ offset: 18 }).setHTML(
        popupMarkup(marker),
      );

      const mapMarker = new maplibre.Marker({ color: "#00D4FF" })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map);

      markerRefs.current.push(mapMarker);
    });
  }, [maplibre, markers, center, zoom]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.resize();
  }, [height]);

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <p className="text-gray-500">Загрузка карты...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <p className="text-gray-500">Не удалось загрузить карту.</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
    </div>
  );
};
