export const ADMIN_SESSION_COOKIE = "lite_travel_admin_session";

const normalizeToken = (token: string | null | undefined): string =>
  (token ?? "").trim();

export const getConfiguredAdminToken = (): string => {
  return normalizeToken(process.env.ADMIN_DASHBOARD_TOKEN);
};

export const isValidAdminToken = (
  token: string | null | undefined,
): boolean => {
  const expected = getConfiguredAdminToken();
  const provided = normalizeToken(token);
  if (!expected || !provided) return false;
  return provided === expected;
};

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

export const isAdminRequestAuthorized = (request: Request): boolean => {
  const headerToken = request.headers.get("x-admin-token");
  if (isValidAdminToken(headerToken)) return true;

  const cookieToken = readCookieValue(
    request.headers.get("cookie"),
    ADMIN_SESSION_COOKIE,
  );
  return isValidAdminToken(cookieToken);
};
