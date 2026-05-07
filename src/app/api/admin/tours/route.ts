import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface CreateTourBody {
  id: string;
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  checkInTime: string;
  checkOutTime: string;
  roomDetails: string;
  transferDetails: string;
  emergencyPhone: string;
  operatorPhone: string;
  hotelLat?: number | null;
  hotelLng?: number | null;
}

const requiredStringFields: Array<keyof CreateTourBody> = [
  "id",
  "title",
  "city",
  "country",
  "startDate",
  "endDate",
  "hotelName",
  "hotelAddress",
];

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        message:
          "Supabase не настроен. Укажите NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as Partial<CreateTourBody>;

  const parseOptionalNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.trim());
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const geocodeAddress = async (query: string): Promise<{ lat: number; lng: number } | null> => {
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

    if (!response.ok) return null;
    const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
    const first = payload[0];
    if (!first) return null;

    const lat = parseOptionalNumber(first.lat);
    const lng = parseOptionalNumber(first.lon);
    if (lat === null || lng === null) return null;
    return { lat, lng };
  };

  for (const field of requiredStringFields) {
    if (!body[field] || typeof body[field] !== "string") {
      return NextResponse.json(
        { message: `Поле ${field} обязательно.` },
        { status: 400 },
      );
    }
  }

  let hotelLat = parseOptionalNumber(body.hotelLat);
  let hotelLng = parseOptionalNumber(body.hotelLng);

  if (hotelLat === null || hotelLng === null) {
    const locationQuery = `${body.hotelAddress}, ${body.city}, ${body.country}`;
    const geocoded = await geocodeAddress(locationQuery);
    if (geocoded) {
      hotelLat = geocoded.lat;
      hotelLng = geocoded.lng;
    }
  }

  if (hotelLat === null || hotelLng === null) {
    return NextResponse.json(
      {
        message:
          "Не удалось определить координаты отеля автоматически. Уточните адрес или заполните широту/долготу вручную.",
      },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("tours").upsert(
    {
      id: body.id,
      title: body.title,
      city: body.city,
      country: body.country,
      start_date: body.startDate,
      end_date: body.endDate,
      hotel_name: body.hotelName,
      hotel_address: body.hotelAddress,
      hotel_phone: body.hotelPhone ?? "",
      check_in_time: body.checkInTime ?? "",
      check_out_time: body.checkOutTime ?? "",
      room_details: body.roomDetails ?? "",
      transfer_details: body.transferDetails ?? "",
      emergency_phone: body.emergencyPhone ?? "",
      operator_phone: body.operatorPhone ?? "",
      hotel_lat: hotelLat,
      hotel_lng: hotelLng,
    },
    { onConflict: "id" },
  );

  if (error) {
    return NextResponse.json(
      { message: `Ошибка записи тура: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: body.id, message: "Тур сохранен." });
}

export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ message: "Поле id обязательно." }, { status: 400 });
  }

  const { error } = await supabase.from("tours").delete().eq("id", body.id);
  if (error) {
    return NextResponse.json(
      { message: `Ошибка удаления тура: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Тур удален." });
}
