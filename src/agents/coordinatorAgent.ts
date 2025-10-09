import { nanoid } from 'nanoid';

import type {
  AgentCoordinator,
  AgentExecutionContext,
  AgentLogger,
  AgentResult,
  AgentWorkflowState,
  AgentWorkflowStep,
  ToolRouter,
} from './types';
import { withRetries } from './utils';

interface CoordinatorOptions<TState> {
  logger: AgentLogger;
  router: ToolRouter;
  onStateUpdate?: (state: AgentWorkflowState<TState>) => void;
}

export class CoordinatorAgent<TState extends Record<string, unknown>> implements AgentCoordinator<TState> {
  private readonly steps = new Map<string, AgentWorkflowStep<TState>>();
  private readonly workflows = new Map<string, AgentWorkflowState<TState>>();

  constructor(private readonly options: CoordinatorOptions<TState>) {}

  registerWorkflow(steps: AgentWorkflowStep<TState>[]): void {
    steps.forEach(step => {
      if (this.steps.has(step.id)) {
        throw new Error(`Duplicate workflow step id detected: ${step.id}`);
      }

      this.steps.set(step.id, step);
    });
  }

  async executeWorkflow(
    workflowId: string,
    initialState: TState,
    metadata: Record<string, unknown> = {},
  ): Promise<AgentWorkflowState<TState>> {
    const state: AgentWorkflowState<TState> = {
      workflowId,
      state: initialState,
      currentAgent: 'coordinator',
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
    };
    this.workflows.set(workflowId, state);

    const steps = [...this.steps.values()];

    for (const step of steps) {
      const context: AgentExecutionContext = {
        workflowId,
        stepId: step.id,
        agent: step.agent,
        metadata,
      };

      const logger = this.options.logger.withContext(context);
      logger.log({
        level: 'info',
        message: `Starting workflow step ${step.id}`,
        timestamp: new Date(),
      });

      try {
        const result = await this.runWithRouting(step, context, state.state, logger);
        state.state = {
          ...state.state,
          ...(result.payload as TState),
        };

        if (result.status !== 'success') {
          logger.log({
            level: 'warn',
            message: `Workflow step ${step.id} returned status ${result.status}`,
            timestamp: new Date(),
          });
          if (result.status === 'error') {
            break;
          }
        }

        state.currentAgent = step.agent;
        state.updatedAt = new Date();
        this.options.onStateUpdate?.(state);
      } catch (error) {
        logger.log({
          level: 'error',
          message: `Workflow step ${step.id} failed: ${(error as Error).message}`,
          data: { error },
          timestamp: new Date(),
        });
        throw error;
      }
    }

    state.completed = true;
    state.updatedAt = new Date();
    this.options.onStateUpdate?.(state);
    return state;
  }

  getWorkflowState(workflowId: string): AgentWorkflowState<TState> | undefined {
    return this.workflows.get(workflowId);
  }

  resetWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
  }

  private async runWithRouting(
    step: AgentWorkflowStep<TState>,
    context: AgentExecutionContext,
    state: TState,
    logger: AgentLogger,
  ): Promise<AgentResult<TState>> {
    return withRetries(async () => {
      const result = await step.run(context, state);

      if (result.toolInvocations.length > 0) {
        await Promise.all(
          result.toolInvocations.map(async invocation => {
            logger.log({
              level: 'debug',
              message: `Routing tool ${invocation.tool} for agent ${context.agent}`,
              data: { invocation },
              timestamp: new Date(),
            });
            await this.options.router(context.agent, invocation.tool, invocation.payload);
          }),
        );
      }

      return result;
    }, {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        logger.log({
          level: 'warn',
          message: `Retrying workflow step ${step.id} (attempt ${attempt}) due to ${(error as Error).message}`,
          data: { attempt },
          timestamp: new Date(),
        });
      },
    });
  }
}

export function createDefaultWorkflowState(): Record<string, unknown> {
  return {
    workflowId: nanoid(),
    startedAt: new Date().toISOString(),
    agents: [],
  };
}
