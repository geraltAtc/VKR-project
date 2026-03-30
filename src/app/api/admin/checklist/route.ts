import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

interface ChecklistBody {
  id?: unknown;
  tourId?: unknown;
  category?: unknown;
  title?: unknown;
  note?: unknown;
  required?: unknown;
}

function parseRequiredString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length !== 0) {
    return trimmed;
  }
  return null;
}

function parseOptionalString(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ message: 'No access.' }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase is not configured.' }, { status: 500 });
  }

  const body = (await request.json()) as ChecklistBody;
  const normalizedIdRaw = typeof body.id === 'string' ? body.id.trim() : '';
  const hasId = normalizedIdRaw.length !== 0;

  const tourId = parseRequiredString(body.tourId);
  const category = parseRequiredString(body.category);
  const title = parseRequiredString(body.title);

  if (tourId === null) {
    return NextResponse.json({ message: 'Field tourId is required.' }, { status: 400 });
  }
  if (category === null) {
    return NextResponse.json({ message: 'Field category is required.' }, { status: 400 });
  }
  if (title === null) {
    return NextResponse.json({ message: 'Field title is required.' }, { status: 400 });
  }

  const payload = {
    tour_id: tourId,
    category,
    title,
    note: parseOptionalString(body.note),
    is_required: body.required === true,
  };

  let query;
  if (hasId) {
    query = supabase.from('checklist_items').upsert({ ...payload, id: normalizedIdRaw }, { onConflict: 'id' });
  } else {
    query = supabase.from('checklist_items').insert(payload);
  }

  const { data, error } = await query.select('id').single();

  if (error) {
    return NextResponse.json(
      { message: `Error writing checklist item: ${error.message}` },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      { message: 'Error writing checklist item: empty response.' },
      { status: 500 },
    );
  }

  const message = hasId ? 'Checklist item updated.' : 'Checklist item saved.';
  return NextResponse.json({ id: data.id, message });
}
