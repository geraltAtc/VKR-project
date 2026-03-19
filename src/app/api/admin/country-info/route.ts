import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface UpsertCountryInfoBody {
  tourId: string;
  currencyInfo: string;
  languageInfo: string;
  transportInfo: string;
  climateInfo: string;
  foodInfo: string;
  safetyInfo: string;
  cultureInfo: string;
  usefulContacts: string;
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const body = (await request.json()) as Partial<UpsertCountryInfoBody>;
  if (!body.tourId) {
    return NextResponse.json({ message: "Поле tourId обязательно." }, { status: 400 });
  }

  const { error } = await supabase.from("country_info").upsert(
    {
      tour_id: body.tourId,
      currency_info: body.currencyInfo ?? "",
      language_info: body.languageInfo ?? "",
      transport_info: body.transportInfo ?? "",
      climate_info: body.climateInfo ?? "",
      food_info: body.foodInfo ?? "",
      safety_info: body.safetyInfo ?? "",
      culture_info: body.cultureInfo ?? "",
      useful_contacts: body.usefulContacts ?? "",
    },
    { onConflict: "tour_id" },
  );

  if (error) {
    return NextResponse.json(
      { message: `Ошибка записи информации о стране: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Информация о стране сохранена." });
}

