import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "@/lib/adminAuth";

interface LoginBody {
  token: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LoginBody>;
  if (!isValidAdminToken(body.token)) {
    return NextResponse.json(
      { message: "Неверный токен администратора." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ message: "Вход выполнен." });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: body.token as string,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

