import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
}

const FUNCTION_ENDPOINT = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/newsletter-subscribe`;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as {
    email?: string;
  };

  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Please provide a valid email address.' },
      { status: 422 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const requestUrl = new URL(request.url);

    const response = await fetch(FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        source: requestUrl.searchParams.get('source') ?? 'web',
        metadata: {
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const payload = (await response.json().catch(() => null)) ?? {
      error: 'Unexpected error subscribing to newsletter.',
    };

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to subscribe at this time. Please try again later.' },
      { status: 500 },
    );
  }
}
