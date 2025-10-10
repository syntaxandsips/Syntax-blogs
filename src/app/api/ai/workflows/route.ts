import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createServerClient } from '@/lib/supabase/server-client';
import { recordAuthzDeny } from '@/lib/observability/metrics';
import { eventBus } from '@/services/ai/eventBus';
import { createWorkflow, listWorkflows } from '@/services/ai/workflowService';

const CreateWorkflowSchema = z.object({
  topic: z.string().min(3),
  outline: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
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
        recordAuthzDeny('ai_workflow_access', { method: 'GET' })
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

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
