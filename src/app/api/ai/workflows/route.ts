import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createServerClient } from '@/lib/supabase/server-client';
import { eventBus } from '@/services/ai/eventBus';
import { createWorkflow, listWorkflows } from '@/services/ai/workflowService';

const CreateWorkflowSchema = z.object({
  topic: z.string().min(3),
  outline: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET() {
  try {
    const workflows = await listWorkflows();
    return NextResponse.json({ workflows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to list workflows';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const payload = CreateWorkflowSchema.safeParse(body);

    if (!payload.success) {
      return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
    }

    const workflow = await createWorkflow({
      topic: payload.data.topic,
      metadata: {
        outline: payload.data.outline,
        user_id: user.id,
        requested_at: new Date().toISOString(),
      },
    });

    eventBus.emit('workflow:created', { workflowId: workflow.id });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create workflow';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
