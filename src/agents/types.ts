import type { ZodSchema } from 'zod';

export type AgentName =
  | 'coordinator'
  | 'research'
  | 'writing'
  | 'editing'
  | 'optimization';

export interface AgentToolInvocation {
  tool: string;
  payload: Record<string, unknown>;
  invokedAt: Date;
  retryCount: number;
}

export interface AgentExecutionContext {
  workflowId: string;
  stepId: string;
  agent: AgentName;
  metadata: Record<string, unknown>;
  notes?: string;
}

export interface AgentResult<TPayload = unknown> {
  status: 'success' | 'error' | 'pending';
  payload?: TPayload;
  error?: string;
  metrics?: AgentMetrics;
  toolInvocations: AgentToolInvocation[];
}

export interface AgentMetrics {
  durationMs: number;
  tokensConsumed?: number;
  retries?: number;
}

export interface AgentTelemetryEvent {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: AgentExecutionContext;
  data?: Record<string, unknown>;
  timestamp: Date;
}

export interface AgentWorkflowState<TState = Record<string, unknown>> {
  workflowId: string;
  state: TState;
  currentAgent: AgentName;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

export interface AgentWorkflowStep<TState = Record<string, unknown>> {
  id: string;
  agent: AgentName;
  name: string;
  description: string;
  inputSchema?: ZodSchema;
  outputSchema?: ZodSchema;
  run: (context: AgentExecutionContext, state: TState) => Promise<AgentResult<TState>>;
}

export interface AgentRuntime<TState = Record<string, unknown>> {
  name: AgentName;
  run: (context: AgentExecutionContext, state: TState) => Promise<AgentResult<TState>>;
  warmup?: () => Promise<void>;
  shutdown?: () => Promise<void>;
}

export interface AgentCoordinator<TState = Record<string, unknown>> {
  registerWorkflow: (steps: AgentWorkflowStep<TState>[]) => void;
  executeWorkflow: (
    workflowId: string,
    initialState: TState,
    metadata?: Record<string, unknown>
  ) => Promise<AgentWorkflowState<TState>>;
  getWorkflowState: (workflowId: string) => AgentWorkflowState<TState> | undefined;
  resetWorkflow: (workflowId: string) => void;
}

export type ToolRouter = (
  agent: AgentName,
  toolName: string,
  payload: Record<string, unknown>
) => Promise<unknown>;

export interface RetriableOperationOptions {
  maxAttempts?: number;
  backoffMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

export type RetriableOperation<T> = () => Promise<T>;

export interface AgentLogger {
  log: (event: AgentTelemetryEvent) => void;
  withContext: (context: AgentExecutionContext) => AgentLogger;
}

export interface AgentEventEmitter {
  emit: (event: string, payload: unknown) => void;
}
