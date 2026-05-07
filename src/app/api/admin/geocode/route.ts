import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";

interface NominatimResult {
  lat?: string;
  lon?: string;
  display_name?: string;
}

const parseCoordinate = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (!query) {
    return NextResponse.json({ message: "Параметр q обязателен." }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "ru,en",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: `Сервис геокодирования недоступен: HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as NominatimResult[];
    const first = payload[0];
    if (!first) {
      return NextResponse.json(
        { message: "Адрес не найден. Уточните запрос." },
        { status: 404 },
      );
    }

    const lat = parseCoordinate(first.lat);
    const lng = parseCoordinate(first.lon);
    if (lat === null || lng === null) {
      return NextResponse.json(
        { message: "Не удалось прочитать координаты из ответа сервиса." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      lat,
      lng,
      displayName: first.display_name ?? query,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: `Ошибка геокодирования: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      },
      { status: 500 },
    );
  }
}

