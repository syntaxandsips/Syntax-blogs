import { NextResponse } from 'next/server';

import { eventBus } from '@/services/ai/eventBus';
import { listWorkflowEvents } from '@/services/ai/workflowService';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const { id } = params;
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
