import { NextResponse } from 'next/server';

function extractWorkflowId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const index = segments.indexOf('workflows');
  if (index === -1 || index + 1 >= segments.length) {
    return null;
  }
  return decodeURIComponent(segments[index + 1] ?? '');
}

import { eventBus } from '@/services/ai/eventBus';
import { listWorkflowEvents } from '@/services/ai/workflowService';

export async function GET(request: Request) {
  const id = extractWorkflowId(new URL(request.url).pathname);

  if (!id || Array.isArray(id)) {
    return NextResponse.json({ error: 'Missing workflow id' }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const push = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const initial = await listWorkflowEvents(id);
      push({ type: 'history', events: initial });

      const updateListener = (payload: { workflowId: string; status: string }) => {
        if (payload.workflowId === id) {
          push({ type: 'status', status: payload.status });
        }
      };

      const eventListener = (payload: { workflowId: string; type: string; payload: unknown }) => {
        if (payload.workflowId === id) {
          push({
            type: payload.type,
            payload: payload.payload,
            created_at: new Date().toISOString(),
          });
        }
      };

      eventBus.on('workflow:updated', updateListener);
      eventBus.on('workflow:event', eventListener);

      const abort = () => {
        eventBus.off('workflow:updated', updateListener);
        eventBus.off('workflow:event', eventListener);
        controller.close();
      };

      request.signal.addEventListener('abort', abort);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
