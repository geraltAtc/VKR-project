import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface CreateChecklistBody {
  id?: string;
  tourId: string;
  category: string;
  title: string;
  note: string;
  required: boolean;
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: "Нет доступа." }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase не настроен." }, { status: 500 });
  }

  const body = (await request.json()) as Partial<CreateChecklistBody>;
  if (!body.tourId || !body.category || !body.title) {
    return NextResponse.json(
      { message: "Поля tourId, category и title обязательны." },
      { status: 400 },
    );
  }

  const payload = {
    id: body.id,
    tour_id: body.tourId,
    category: body.category,
    title: body.title,
    note: body.note ?? "",
    is_required: body.required ?? false,
  };

  const query = body.id
    ? supabase.from("checklist_items").upsert(payload, { onConflict: "id" })
    : supabase.from("checklist_items").insert(payload);

  const { data, error } = await query.select("id").single();

  if (error || !data) {
    return NextResponse.json(
      { message: `Ошибка записи чек-листа: ${error?.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: data.id,
    message: body.id ? "Пункт чек-листа обновлен." : "Пункт чек-листа сохранен.",
  });
}
