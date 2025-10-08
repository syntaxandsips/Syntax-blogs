import EventEmitter from 'node:events';

export type WorkflowEventMap = {
  'workflow:created': { workflowId: string };
  'workflow:updated': { workflowId: string; status: string };
  'workflow:event': { workflowId: string; type: string; payload: unknown };
};

export type WorkflowEventName = keyof WorkflowEventMap;

class WorkflowEventBus extends EventEmitter {
  emit<EventName extends WorkflowEventName>(event: EventName, payload: WorkflowEventMap[EventName]): boolean {
    return super.emit(event, payload);
  }

  on<EventName extends WorkflowEventName>(event: EventName, listener: (payload: WorkflowEventMap[EventName]) => void): this {
    return super.on(event, listener);
  }

  off<EventName extends WorkflowEventName>(event: EventName, listener: (payload: WorkflowEventMap[EventName]) => void): this {
    return super.off(event, listener);
  }
}

export const eventBus = new WorkflowEventBus();
