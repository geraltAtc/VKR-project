import { NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/adminAuth";
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
  hotelLat: number;
  hotelLng: number;
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
  const token = request.headers.get("x-admin-token");
  if (!isValidAdminToken(token)) {
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

  for (const field of requiredStringFields) {
    if (!body[field] || typeof body[field] !== "string") {
      return NextResponse.json(
        { message: `Поле ${field} обязательно.` },
        { status: 400 },
      );
    }
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
      hotel_lat: body.hotelLat ?? 0,
      hotel_lng: body.hotelLng ?? 0,
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

