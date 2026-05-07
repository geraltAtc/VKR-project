import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

interface AttractionBody {
  id?: unknown;
  tourId?: unknown;
  name?: unknown;
  address?: unknown;
  lat?: unknown;
  lng?: unknown;
  workingHours?: unknown;
  entryPrice?: unknown;
  visitDuration?: unknown;
  description?: unknown;
  tips?: unknown;
  category?: unknown;
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

function parseOptionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
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

  const body = (await request.json()) as AttractionBody;
  const normalizedIdRaw = typeof body.id === 'string' ? body.id.trim() : '';
  const hasId = normalizedIdRaw.length !== 0;

  const tourId = parseRequiredString(body.tourId);
  const name = parseRequiredString(body.name);
  const address = parseRequiredString(body.address);
  let lat = parseOptionalNumber(body.lat);
  let lng = parseOptionalNumber(body.lng);

  if (tourId === null) {
    return NextResponse.json({ message: 'Field tourId is required.' }, { status: 400 });
  }
  if (name === null) {
    return NextResponse.json({ message: 'Field name is required.' }, { status: 400 });
  }
  if (address === null) {
    return NextResponse.json({ message: 'Field address is required.' }, { status: 400 });
  }
  if (lat === null || lng === null) {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('q', address);

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'ru,en',
        },
        cache: 'no-store',
      });
      if (response.ok) {
        const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
        const first = payload[0];
        if (first) {
          lat = parseOptionalNumber(first.lat);
          lng = parseOptionalNumber(first.lon);
        }
      }
    } catch {
      // Ignore external geocoding failure and return friendly validation below.
    }
  }

  if (lat === null || lng === null) {
    return NextResponse.json(
      {
        message:
          'Не удалось определить координаты автоматически. Уточните адрес или заполните широту/долготу вручную.',
      },
      { status: 400 },
    );
  }

  let category = parseOptionalString(body.category);
  if (category.length === 0) {
    category = 'Other';
  }

  const payload = {
    tour_id: tourId,
    name,
    address,
    lat,
    lng,
    working_hours: parseOptionalString(body.workingHours),
    entry_price: parseOptionalString(body.entryPrice),
    visit_duration: parseOptionalString(body.visitDuration),
    description: parseOptionalString(body.description),
    tips: parseOptionalString(body.tips),
    category,
  };

  let query;
  if (hasId) {
    query = supabase.from('attractions').upsert({ ...payload, id: normalizedIdRaw }, { onConflict: 'id' });
  } else {
    query = supabase.from('attractions').insert(payload);
  }

  const { data, error } = await query.select('id').single();

  if (error) {
    return NextResponse.json(
      { message: `Error writing attraction: ${error.message}` },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      { message: 'Error writing attraction: empty response.' },
      { status: 500 },
    );
  }

  const message = hasId ? 'Attraction updated.' : 'Attraction saved.';
  return NextResponse.json({ id: data.id, message });
}
