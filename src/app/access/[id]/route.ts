import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  TOURIST_ACCESS_COOKIE,
  getTourAccessCookieMaxAge,
  isTourAccessLinkActive,
} from "@/lib/tourAccess";

interface TourAccessLinkRow {
  id: string;
  tour_id: string;
  is_active: boolean;
  expires_at: string | null;
}

const redirectToTours = (request: Request, accessState?: "invalid") => {
  const url = new URL("/tours", request.url);
  if (accessState) {
    url.searchParams.set("access", accessState);
  }
  const response = NextResponse.redirect(url);
  if (accessState) {
    response.cookies.set({
      name: TOURIST_ACCESS_COOKIE,
      value: "",
      maxAge: 0,
      path: "/",
    });
  }
  return response;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return redirectToTours(request, "invalid");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return redirectToTours(request, "invalid");
  }

  const { data, error } = await supabase
    .from("tour_access_links")
    .select("id,tour_id,is_active,expires_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return redirectToTours(request, "invalid");
  }

  const row = data as TourAccessLinkRow;
  if (!isTourAccessLinkActive(row)) {
    return redirectToTours(request, "invalid");
  }

  await supabase
    .from("tour_access_links")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);

  const response = NextResponse.redirect(new URL(`/tours/${row.tour_id}`, request.url));
  response.cookies.set({
    name: TOURIST_ACCESS_COOKIE,
    value: row.id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getTourAccessCookieMaxAge(row.expires_at),
  });
  return response;
}
