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

const BLOG_MCP_URL = process.env.MCP_BLOG_URL ?? 'http://localhost:4001/mcp';
const BLOG_SERVICE_KEY = process.env.MCP_BLOG_SERVICE_KEY;

export async function GET(request: NextRequest) {
  try {
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
