'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AiWorkflow, AiWorkflowEvent } from '@/services/ai/workflowService';

interface Props {
  initialWorkflows: AiWorkflow[];
}

type HistoryEvent = { type: 'history'; events: AiWorkflowEvent[] };
type StatusEvent = { type: 'status'; status: string };
type GenericEvent = {
  type: string;
  payload?: unknown;
  created_at?: string;
};

function isHistoryEvent(event: unknown): event is HistoryEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    (event as { type?: unknown }).type === 'history' &&
    Array.isArray((event as { events?: unknown }).events)
  );
}

function isStatusEvent(event: unknown): event is StatusEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    (event as { type?: unknown }).type === 'status' &&
    typeof (event as { status?: unknown }).status === 'string'
  );
}

export function WorkflowTimeline({ initialWorkflows }: Props) {
  const [workflows, setWorkflows] = useState<AiWorkflow[]>(initialWorkflows);
  const [selectedId, setSelectedId] = useState<string | null>(initialWorkflows[0]?.id ?? null);
  const [eventsByWorkflow, setEventsByWorkflow] = useState<Record<string, AiWorkflowEvent[]>>({});

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/ai/workflows');
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as { workflows: AiWorkflow[] };
      setWorkflows(payload.workflows);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }

    const source = new EventSource(`/api/ai/workflows/${selectedId}/events`);
    source.onmessage = event => {
      try {
        const parsed = JSON.parse(event.data) as unknown;

        if (isHistoryEvent(parsed)) {
          setEventsByWorkflow(previous => ({
            ...previous,
            [selectedId]: parsed.events,
          }));
        } else if (isStatusEvent(parsed)) {
          setWorkflows(previous =>
            previous.map(workflow =>
              workflow.id === selectedId
                ? { ...workflow, status: parsed.status as AiWorkflow['status'] }
                : workflow,
            ),
          );
        } else {
          const data = parsed as GenericEvent;
          const event: AiWorkflowEvent = {
            id: crypto.randomUUID(),
            workflow_id: selectedId,
            type: data.type,
            payload: 'payload' in data ? (data.payload as Record<string, unknown>) : {},
            created_at: 'created_at' in data && typeof data.created_at === 'string'
              ? data.created_at
              : new Date().toISOString(),
          };

          setEventsByWorkflow(previous => ({
            ...previous,
            [selectedId]: [...(previous[selectedId] ?? []), event],
          }));
        }
      } catch (error) {
        console.error('Failed to parse workflow event', error);
      }
    };

    return () => source.close();
  }, [selectedId]);

  const selectedEvents = useMemo(() => {
    if (!selectedId) {
      return [];
    }

    return eventsByWorkflow[selectedId] ?? [];
  }, [eventsByWorkflow, selectedId]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        {workflows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workflows yet. Launch one to see progress.</p>
        ) : (
          workflows.map(workflow => {
            const metadata = workflow.metadata as { topic?: string } | undefined;
            const topic = metadata?.topic ?? 'Untitled Topic';

            return (
            <button
              key={workflow.id}
              type="button"
              onClick={() => setSelectedId(workflow.id)}
              className={`w-full rounded-md border-2 border-black px-3 py-2 text-left transition ${
                workflow.id === selectedId
                  ? 'bg-lime-200 shadow-neobrutalist'
                  : 'bg-white hover:-translate-y-1 hover:shadow-neobrutalist'
              }`}
            >
              <span className="block text-xs font-semibold uppercase text-muted-foreground">
                {new Date(workflow.created_at).toLocaleString()}
              </span>
              <span className="block text-base font-bold">{topic}</span>
              <span className="block text-xs font-semibold uppercase">Status: {workflow.status}</span>
            </button>
          );
          })
        )}
      </div>
      <div className="space-y-3">
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Waiting for events…</p>
        ) : (
          selectedEvents.map(event => (
            <div key={event.id ?? `${event.type}-${event.created_at}`}
              className="rounded-md border-2 border-black bg-sky-100 p-3 shadow-neobrutalist-sm">
              <div className="flex items-center justify-between text-xs font-semibold uppercase">
                <span>{event.type}</span>
                <span>{event.created_at ? new Date(event.created_at).toLocaleTimeString() : 'Live'}</span>
              </div>
              <pre className="mt-2 whitespace-pre-wrap break-words text-sm">
                {JSON.stringify(event.payload ?? {}, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
