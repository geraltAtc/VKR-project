import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "ID ссылки не указан." }, { status: 400 });
  }

  const { error } = await supabase
    .from("tour_access_links")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { message: `Ошибка отключения ссылки: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Ссылка отключена." });
}
