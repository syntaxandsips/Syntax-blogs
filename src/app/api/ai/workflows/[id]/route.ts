import { NextResponse } from 'next/server';

function extractWorkflowId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('workflows');
  if (index === -1 || index + 1 >= segments.length) {
    return null;
  }
  return decodeURIComponent(segments[index + 1] ?? '');
}

import { getWorkflowById, listWorkflowEvents } from '@/services/ai/workflowService';

export async function GET(request: Request) {
  try {
    const workflowId = extractWorkflowId(new URL(request.url).pathname);

    if (!workflowId || Array.isArray(workflowId)) {
      return NextResponse.json({ error: 'Missing workflow id' }, { status: 400 });
    }

    const workflow = await getWorkflowById(workflowId);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const events = await listWorkflowEvents(workflowId);

    return NextResponse.json({ workflow, events });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load workflow';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
