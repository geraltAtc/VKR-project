import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isTourAccessLinkActive } from "@/lib/tourAccess";

interface TourAccessLinkRow {
  id: string;
  tour_id: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

const mapTourAccessLink = (row: TourAccessLinkRow, request: Request) => {
  const baseUrl = new URL(request.url).origin;
  return {
    id: row.id,
    tourId: row.tour_id,
    label: row.label ?? "",
    isActive: isTourAccessLinkActive(row),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    url: `${baseUrl}/access/${row.id}`,
  };
};

const parseIsoDateOrNull = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;

  const timestamp = new Date(normalized).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString();
};

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const searchParams = new URL(request.url).searchParams;
  const tourId = (searchParams.get("tourId") ?? "").trim();
  if (!tourId) {
    return NextResponse.json({ message: "Поле tourId обязательно." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tour_access_links")
    .select("id,tour_id,label,is_active,created_at,expires_at,last_used_at")
    .eq("tour_id", tourId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: `Ошибка чтения персональных ссылок: ${error.message}` },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as TourAccessLinkRow[];
  return NextResponse.json(rows.map((row) => mapTourAccessLink(row, request)));
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const body = (await request.json()) as {
    tourId?: unknown;
    label?: unknown;
    expiresAt?: unknown;
  };

  const tourId = typeof body.tourId === "string" ? body.tourId.trim() : "";
  if (!tourId) {
    return NextResponse.json({ message: "Поле tourId обязательно." }, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.trim() : "";
  const expiresAt = parseIsoDateOrNull(body.expiresAt);
  if (body.expiresAt != null && !expiresAt) {
    return NextResponse.json(
      { message: "expiresAt должно быть валидной датой." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("tour_access_links")
    .insert({
      tour_id: tourId,
      label: label || null,
      expires_at: expiresAt,
      is_active: true,
    })
    .select("id,tour_id,label,is_active,created_at,expires_at,last_used_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: `Ошибка создания персональной ссылки: ${error?.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    link: mapTourAccessLink(data as TourAccessLinkRow, request),
    message: "Персональная ссылка создана.",
  });
}
