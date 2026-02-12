"use client";

import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  price?: number;
}

interface TourMapProps {
  markers: MapMarker[];
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
}

type LeafletModule = typeof import("react-leaflet");

export const TourMap: React.FC<TourMapProps> = ({
  markers,
  center = [51.505, -0.09],
  zoom = 13,
  height = "400px",
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      // Динамически подключаем Leaflet только на клиенте
      import("leaflet/dist/leaflet.css");
      import("react-leaflet")
        .then((mod) => {
          setLeaflet(mod);
        })
        .catch((err) => {
          console.error("Failed to load react-leaflet", err);
        });
    }
  }, []);

  if (!isMounted || !leaflet) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <p className="text-gray-500">Загрузка карты...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = leaflet;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height, borderRadius: "8px" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng]}>
          <Popup>
            <div className="text-sm">
              <h4 className="font-bold mb-1">{marker.name}</h4>
              {marker.price != null && (
                <p className="font-semibold text-[#00D4FF] mb-1">
                  ${marker.price.toLocaleString()}
                </p>
              )}
              {marker.description && <p>{marker.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
