import { NextRequest, NextResponse } from 'next/server';

import { getDraft, updateDraft } from '@/lib/mcp/blog';

const BLOG_MCP_URL = process.env.MCP_BLOG_URL ?? 'http://localhost:4001/mcp';
const BLOG_SERVICE_KEY = process.env.MCP_BLOG_SERVICE_KEY;

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const draft = await getDraft(
      { baseUrl: BLOG_MCP_URL, serviceRoleKey: BLOG_SERVICE_KEY },
      params.id,
    );

    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const result = await updateDraft(
      { baseUrl: BLOG_MCP_URL, serviceRoleKey: BLOG_SERVICE_KEY },
      { ...body, postId: params.id },
    );

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
