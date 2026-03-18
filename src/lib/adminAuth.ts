export const isValidAdminToken = (token: string | null): boolean => {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) return false;
  return token === expected;
};

