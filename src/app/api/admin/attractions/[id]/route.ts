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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "ID не указан." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const { error } = await supabase.from("attractions").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { message: `Ошибка удаления достопримечательности: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Достопримечательность удалена." });
}

