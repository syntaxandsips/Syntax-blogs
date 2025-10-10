import { NextRequest, NextResponse } from 'next/server';

function extractToolId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('tools');
  if (index === -1 || index + 1 >= segments.length) {
    return null;
  }
  return decodeURIComponent(segments[index + 1] ?? '');
}

import { runResearchQuery } from '@/lib/mcp/research';
import { runSeoAnalysis } from '@/lib/mcp/seo';
import { recordAuthzDeny } from '@/lib/observability/metrics';
import { uploadAsset } from '@/lib/mcp/storage';
import { createServerClient } from '@/lib/supabase/server-client';

const RESEARCH_MCP_URL = process.env.MCP_RESEARCH_URL ?? 'http://localhost:4000/mcp';
const SEO_MCP_URL = process.env.MCP_SEO_URL ?? 'http://localhost:4002/mcp';
const STORAGE_MCP_URL = process.env.MCP_STORAGE_URL ?? 'http://localhost:4003/mcp';

const RESEARCH_TOKEN = process.env.MCP_RESEARCH_TOKEN;
const SEO_TOKEN = process.env.MCP_SEO_TOKEN;
const STORAGE_TOKEN = process.env.MCP_STORAGE_TOKEN;

export async function POST(request: NextRequest) {
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
        { role_slugs: ['admin', 'moderator', 'organizer'] },
      );

      if (roleError) {
        return NextResponse.json(
          { error: `Unable to verify privileges: ${roleError.message}` },
          { status: 500 },
        );
      }

      if (!hasRole) {
        recordAuthzDeny('ai_tool_access', { method: 'POST' })
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const tool = extractToolId((request.nextUrl ?? new URL(request.url)).pathname);

    if (!tool || Array.isArray(tool)) {
      return NextResponse.json({ error: 'Tool identifier missing' }, { status: 400 });
    }

    const payload = await request.json();

    switch (tool) {
      case 'research:search': {
        const result = await runResearchQuery(
          { baseUrl: RESEARCH_MCP_URL, apiKey: RESEARCH_TOKEN },
          payload,
        );
        return NextResponse.json({ result });
      }
      case 'seo:analyze': {
        const result = await runSeoAnalysis(
          { baseUrl: SEO_MCP_URL, token: SEO_TOKEN },
          payload,
        );
        return NextResponse.json({ result });
      }
      case 'storage:upload': {
        const result = await uploadAsset(
          { baseUrl: STORAGE_MCP_URL, token: STORAGE_TOKEN },
          payload,
        );
        return NextResponse.json({ result });
      }
      default:
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool invocation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
