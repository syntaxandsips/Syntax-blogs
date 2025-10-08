import { createServiceRoleClient } from '@/lib/supabase/server-client';

export interface AiWorkflow {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  topic?: string;
  metadata: Record<string, unknown>;
  result?: Record<string, unknown>;
  current_agent?: string;
}

export interface AiWorkflowEvent {
  id: string;
  workflow_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

interface CreateWorkflowInput {
  topic?: string;
  metadata?: Record<string, unknown>;
  current_agent?: string;
}

export async function createWorkflow(input: CreateWorkflowInput): Promise<AiWorkflow> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('ai_workflows')
    .insert({
      topic: input.topic ?? null,
      metadata: input.metadata ?? {},
      current_agent: input.current_agent ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create workflow: ${error.message}`);
  }

  return data as AiWorkflow;
}

export async function listWorkflows(): Promise<AiWorkflow[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('ai_workflows')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list workflows: ${error.message}`);
  }

  return (data ?? []) as AiWorkflow[];
}

export async function getWorkflowById(id: string): Promise<AiWorkflow | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client.from('ai_workflows').select('*').eq('id', id).single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get workflow: ${error.message}`);
  }

  return (data as AiWorkflow) ?? null;
}

export async function appendWorkflowEvent(
  workflowId: string,
  type: string,
  payload: Record<string, unknown>,
): Promise<AiWorkflowEvent> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('ai_workflow_events')
    .insert({ workflow_id: workflowId, type, payload })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to append workflow event: ${error.message}`);
  }

  return data as AiWorkflowEvent;
}

export async function listWorkflowEvents(workflowId: string): Promise<AiWorkflowEvent[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('ai_workflow_events')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to list workflow events: ${error.message}`);
  }

  return (data ?? []) as AiWorkflowEvent[];
}
