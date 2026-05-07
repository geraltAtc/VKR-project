interface GeocodeCoordinates {
  lat: number;
  lng: number;
  displayName: string;
}

const parseNumber = (value: string | number | undefined | null): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const buildIdentificationHeaders = () => {
  const contact = (process.env.GEOCODER_CONTACT_EMAIL ?? "").trim();
  const suffix = contact ? `; contact=${contact}` : "";
  return {
    "Accept-Language": "ru,en",
    "User-Agent": `lite.travel/1.0${suffix}`,
    Referer: "https://lite.travel",
  };
};

const geocodeWithNominatim = async (query: string): Promise<GeocodeCoordinates | null> => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  const contact = (process.env.GEOCODER_CONTACT_EMAIL ?? "").trim();
  if (contact) {
    url.searchParams.set("email", contact);
  }

  const response = await fetch(url, {
    headers: buildIdentificationHeaders(),
    cache: "no-store",
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
  }>;
  const first = payload[0];
  if (!first) return null;

  const lat = parseNumber(first.lat);
  const lng = parseNumber(first.lon);
  if (lat === null || lng === null) return null;

  return {
    lat,
    lng,
    displayName: first.display_name ?? query,
  };
};

const geocodeWithPhoton = async (query: string): Promise<GeocodeCoordinates | null> => {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("lang", "ru");

  const response = await fetch(url, {
    headers: buildIdentificationHeaders(),
    cache: "no-store",
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] };
      properties?: { name?: string; city?: string; country?: string };
    }>;
  };

  const first = payload.features?.[0];
  const coords = first?.geometry?.coordinates;
  if (!coords || coords.length !== 2) return null;

  const lng = parseNumber(coords[0]);
  const lat = parseNumber(coords[1]);
  if (lat === null || lng === null) return null;

  const displayName = [
    first?.properties?.name,
    first?.properties?.city,
    first?.properties?.country,
  ]
    .filter((item): item is string => Boolean(item && item.trim()))
    .join(", ");

  return {
    lat,
    lng,
    displayName: displayName || query,
  };
};

export const geocodeAddress = async (query: string): Promise<GeocodeCoordinates | null> => {
  const normalized = query.trim();
  if (!normalized) return null;

  const nominatim = await geocodeWithNominatim(normalized);
  if (nominatim) return nominatim;

  const photon = await geocodeWithPhoton(normalized);
  if (photon) return photon;

  return null;
};

