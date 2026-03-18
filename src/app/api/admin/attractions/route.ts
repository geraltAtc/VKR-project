import { NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface CreateAttractionBody {
  tourId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  workingHours: string;
  entryPrice: string;
  visitDuration: string;
  description: string;
  tips: string;
  category: string;
}

const requiredFields: Array<keyof CreateAttractionBody> = [
  "tourId",
  "name",
  "address",
  "lat",
  "lng",
];

export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token");
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const body = (await request.json()) as Partial<CreateAttractionBody>;
  for (const field of requiredFields) {
    if (body[field] == null) {
      return NextResponse.json(
        { message: `Поле ${field} обязательно.` },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase
    .from("attractions")
    .insert({
      tour_id: body.tourId,
      name: body.name,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      working_hours: body.workingHours ?? "",
      entry_price: body.entryPrice ?? "",
      visit_duration: body.visitDuration ?? "",
      description: body.description ?? "",
      tips: body.tips ?? "",
      category: body.category ?? "Другое",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: `Ошибка записи достопримечательности: ${error?.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id, message: "Достопримечательность сохранена." });
}

