import { NextRequest, NextResponse } from 'next/server';

function extractDraftId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('drafts');
  if (index === -1 || index + 1 >= segments.length) {
    return null;
  }
  return decodeURIComponent(segments[index + 1] ?? '');
}

import { getDraft, updateDraft } from '@/lib/mcp/blog';
import { createServerClient } from '@/lib/supabase/server-client';

const BLOG_MCP_URL = process.env.MCP_BLOG_URL ?? 'http://localhost:4001/mcp';
const BLOG_SERVICE_KEY = process.env.MCP_BLOG_SERVICE_KEY;

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: `Unable to verify session: ${authError.message}` },
        { status: 500 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: `Unable to load profile: ${profileError.message}` },
        { status: 500 },
      );
    }

    if (!profile?.is_admin) {
      const { data: hasRole, error: roleError } = await supabase.rpc(
        'user_has_any_role',
        { role_slugs: ['admin', 'editor'] },
      );

      if (roleError) {
        return NextResponse.json(
          { error: `Unable to verify privileges: ${roleError.message}` },
          { status: 500 },
        );
      }

      if (!hasRole) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const draftId = extractDraftId((request.nextUrl ?? new URL(request.url)).pathname);

    if (!draftId || Array.isArray(draftId)) {
      return NextResponse.json({ error: 'Missing draft id' }, { status: 400 });
    }

    const draft = await getDraft(
      { baseUrl: BLOG_MCP_URL, serviceRoleKey: BLOG_SERVICE_KEY },
      draftId,
    );

    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: `Unable to verify session: ${authError.message}` },
        { status: 500 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: `Unable to load profile: ${profileError.message}` },
        { status: 500 },
      );
    }

    if (!profile?.is_admin) {
      const { data: hasRole, error: roleError } = await supabase.rpc(
        'user_has_any_role',
        { role_slugs: ['admin', 'editor'] },
      );

      if (roleError) {
        return NextResponse.json(
          { error: `Unable to verify privileges: ${roleError.message}` },
          { status: 500 },
        );
      }

      if (!hasRole) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const draftId = extractDraftId((request.nextUrl ?? new URL(request.url)).pathname);

    if (!draftId || Array.isArray(draftId)) {
      return NextResponse.json({ error: 'Missing draft id' }, { status: 400 });
    }

    const body = await request.json();
    const result = await updateDraft(
      { baseUrl: BLOG_MCP_URL, serviceRoleKey: BLOG_SERVICE_KEY },
      { ...body, postId: draftId },
    );

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
