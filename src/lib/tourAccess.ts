import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const TOURIST_ACCESS_COOKIE = "lite_travel_tour_access";

interface TourAccessLinkRow {
  id: string;
  tour_id: string;
  is_active: boolean;
  expires_at: string | null;
}

const DEFAULT_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const readCookieValue = (
  cookieHeader: string | null,
  cookieName: string,
): string | null => {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";");
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part.startsWith(`${cookieName}=`)) continue;
    return decodeURIComponent(part.slice(cookieName.length + 1));
  }
  return null;
};

export const getTourAccessIdFromRequest = (request: Request): string | null => {
  const value = readCookieValue(
    request.headers.get("cookie"),
    TOURIST_ACCESS_COOKIE,
  );
  const normalized = (value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
};

export const isTourAccessLinkActive = (
  row: Pick<TourAccessLinkRow, "is_active" | "expires_at">,
): boolean => {
  if (!row.is_active) return false;
  if (!row.expires_at) return true;

  const expiresAt = new Date(row.expires_at).getTime();
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt > Date.now();
};

export const getTourAccessCookieMaxAge = (expiresAt: string | null): number => {
  if (!expiresAt) return DEFAULT_ACCESS_MAX_AGE_SECONDS;

  const expiresMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresMs)) return DEFAULT_ACCESS_MAX_AGE_SECONDS;

  const seconds = Math.floor((expiresMs - Date.now()) / 1000);
  if (seconds <= 0) return 1;
  return seconds;
};

export const resolveTourIdFromAccessRequest = async (
  request: Request,
): Promise<string | null> => {
  const accessId = getTourAccessIdFromRequest(request);
  if (!accessId) return null;

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tour_access_links")
    .select("id,tour_id,is_active,expires_at")
    .eq("id", accessId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as TourAccessLinkRow;
  if (!isTourAccessLinkActive(row)) return null;

  return row.tour_id;
};
