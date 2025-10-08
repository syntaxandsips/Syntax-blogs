import { NextResponse } from 'next/server';

import { getWorkflowById, listWorkflowEvents } from '@/services/ai/workflowService';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const workflow = await getWorkflowById(params.id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const events = await listWorkflowEvents(params.id);

    return NextResponse.json({ workflow, events });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load workflow';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
