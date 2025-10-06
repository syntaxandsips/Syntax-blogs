import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server-client';

interface RouteParams {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function POST(_request: Request, { params }: RouteParams) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc('increment_post_views', {
    post_slug: params.slug,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ views: data.views ?? 0 });
}
