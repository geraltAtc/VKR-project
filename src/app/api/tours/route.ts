import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { mockTravelData } from "@/lib/mockTravelData";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { resolveTourIdFromAccessRequest } from "@/lib/tourAccess";
import { mapTourSummary } from "@/lib/travelMappers";
import type { TourSummary } from "@/types/travel";

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
}

const getToursFromSupabase = async (
  allowedTourId?: string,
): Promise<TourSummary[] | null> => {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  let query = supabase
    .from("tours")
    .select(
      "id,title,city,country,start_date,end_date,hotel_name,hotel_address,hotel_lat,hotel_lng",
    )
    .order("start_date", { ascending: true });

  if (allowedTourId) {
    query = query.eq("id", allowedTourId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch tours from Supabase:", error.message);
    return null;
  }

  return ((data ?? []) as TourRow[]).map(mapTourSummary);
};

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(mockTravelData.getTourSummaries());
  }

  let allowedTourId: string | undefined;
  const isAdminRequest = isAdminRequestAuthorized(request);

  if (!isAdminRequest) {
    const resolvedTourId = await resolveTourIdFromAccessRequest(request);
    if (!resolvedTourId) {
      return NextResponse.json(
        {
          message:
            "Доступ к турам не предоставлен. Откройте персональную ссылку от администратора.",
        },
        { status: 401 },
      );
    }
    allowedTourId = resolvedTourId;
  }

  const tours = await getToursFromSupabase(allowedTourId);
  if (!tours) {
    return NextResponse.json(
      { message: "Не удалось загрузить туры из базы данных." },
      { status: 500 },
    );
  }

  return NextResponse.json(tours);
}
