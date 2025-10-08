import { setTimeout as delay } from 'node:timers/promises';

import type {
  AgentEventEmitter,
  AgentExecutionContext,
  AgentLogger,
  AgentTelemetryEvent,
  RetriableOperation,
  RetriableOperationOptions,
} from './types';

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_BACKOFF_MS = 500;

export async function withRetries<T>(
  operation: RetriableOperation<T>,
  options: RetriableOperationOptions = {},
): Promise<T> {
  const { maxAttempts = DEFAULT_RETRY_ATTEMPTS, backoffMs = DEFAULT_BACKOFF_MS, onRetry } = options;
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      lastError = error;

      if (attempt >= maxAttempts) {
        throw error;
      }

      onRetry?.(attempt, error);
      const jitter = Math.random() * 100;
      await delay(backoffMs * attempt + jitter);
    }
  }

  throw lastError ?? new Error('Unknown retry error');
}

export function createAgentLogger(
  emitter: AgentEventEmitter,
): AgentLogger {
  const baseContext: AgentExecutionContext | undefined = undefined;

  const log = (event: AgentTelemetryEvent) => {
    emitter.emit('agent:log', event);
  };

  const buildLogger = (context?: AgentExecutionContext): AgentLogger => ({
    log: (event: AgentTelemetryEvent) => {
      log({ ...event, context: context ?? event.context });
    },
    withContext: (newContext: AgentExecutionContext) => buildLogger(newContext),
  });

  return buildLogger(baseContext);
}
