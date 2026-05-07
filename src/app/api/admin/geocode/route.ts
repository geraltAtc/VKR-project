import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { geocodeAddress } from "@/lib/geocoding";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (!query) {
    return NextResponse.json({ message: "Параметр q обязателен." }, { status: 400 });
  }

  try {
    const result = await geocodeAddress(query);
    if (!result) {
      return NextResponse.json(
        {
          message:
            "Не удалось определить координаты по адресу. Уточните адрес или выберите точку на карте.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      lat: result.lat,
      lng: result.lng,
      displayName: result.displayName,
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
