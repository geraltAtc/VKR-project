import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { mockTravelData } from "@/lib/mockTravelData";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { resolveTourIdFromAccessRequest } from "@/lib/tourAccess";
import {
  mapAttraction,
  mapChecklistItem,
  mapCountryInfo,
  mapTourDetails,
} from "@/lib/travelMappers";

interface TourRow {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  hotel_name: string;
  hotel_address: string;
  hotel_lat: number | null;
  hotel_lng: number | null;
  hotel_phone: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  room_details: string | null;
  transfer_details: string | null;
  emergency_phone: string | null;
  operator_phone: string | null;
}

interface AttractionRow {
  id: string;
  tour_id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  working_hours: string | null;
  entry_price: string | null;
  visit_duration: string | null;
  description: string | null;
  tips: string | null;
  category: string | null;
}

interface CountryInfoRow {
  tour_id: string;
  currency_info: string | null;
  language_info: string | null;
  transport_info: string | null;
  climate_info: string | null;
  food_info: string | null;
  safety_info: string | null;
  culture_info: string | null;
  useful_contacts: string | null;
}

interface ChecklistRow {
  id: string;
  tour_id: string;
  category: string;
  title: string;
  note: string | null;
  is_required: boolean | null;
}

const getTourFromSupabase = async (tourId: string) => {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data: tourRow, error: tourError } = await supabase
    .from("tours")
    .select(
      "id,title,city,country,start_date,end_date,hotel_name,hotel_address,hotel_lat,hotel_lng,hotel_phone,check_in_time,check_out_time,room_details,transfer_details,emergency_phone,operator_phone",
    )
    .eq("id", tourId)
    .single();

  if (tourError || !tourRow) {
    if (tourError) {
      console.error("Failed to fetch tour details from Supabase:", tourError.message);
    }
    return null;
  }

  const [attractionsResponse, countryInfoResponse, checklistResponse] =
    await Promise.all([
      supabase
        .from("attractions")
        .select(
          "id,tour_id,name,address,lat,lng,working_hours,entry_price,visit_duration,description,tips,category",
        )
        .eq("tour_id", tourId),
      supabase
        .from("country_info")
        .select(
          "tour_id,currency_info,language_info,transport_info,climate_info,food_info,safety_info,culture_info,useful_contacts",
        )
        .eq("tour_id", tourId)
        .maybeSingle(),
      supabase
        .from("checklist_items")
        .select("id,tour_id,category,title,note,is_required")
        .eq("tour_id", tourId),
    ]);

  if (attractionsResponse.error) {
    console.error(
      "Failed to fetch attractions from Supabase:",
      attractionsResponse.error.message,
    );
  }

  if (countryInfoResponse.error) {
    console.error(
      "Failed to fetch country info from Supabase:",
      countryInfoResponse.error.message,
    );
  }

  if (checklistResponse.error) {
    console.error(
      "Failed to fetch checklist from Supabase:",
      checklistResponse.error.message,
    );
  }

  const attractions = ((attractionsResponse.data ?? []) as AttractionRow[]).map(
    mapAttraction,
  );
  const countryInfo = countryInfoResponse.data
    ? mapCountryInfo(countryInfoResponse.data as CountryInfoRow)
    : null;
  const checklistItems = ((checklistResponse.data ?? []) as ChecklistRow[]).map(
    mapChecklistItem,
  );

  return mapTourDetails(
    tourRow as TourRow,
    attractions,
    countryInfo,
    checklistItems,
  );
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const hasSupabase = Boolean(createSupabaseServerClient());
  const isAdminRequest = isAdminRequestAuthorized(request);

  if (hasSupabase && !isAdminRequest) {
    const allowedTourId = await resolveTourIdFromAccessRequest(request);
    if (!allowedTourId) {
      return NextResponse.json(
        {
          message:
            "Доступ к туру не предоставлен. Откройте персональную ссылку от администратора.",
        },
        { status: 401 },
      );
    }

    if (allowedTourId !== id) {
      return NextResponse.json({ message: "Нет доступа к этому туру." }, { status: 403 });
    }
  }

  const fromSupabase = await getTourFromSupabase(id);
  if (fromSupabase) {
    return NextResponse.json(fromSupabase);
  }

  if (hasSupabase) {
    return NextResponse.json({ message: "Тур не найден" }, { status: 404 });
  }

  const fromMock = mockTravelData.getTourById(id);
  if (!fromMock) {
    return NextResponse.json({ message: "Тур не найден" }, { status: 404 });
  }

  return NextResponse.json(fromMock);
}
