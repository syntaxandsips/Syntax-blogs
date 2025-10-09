import type { AgentExecutionContext, AgentLogger, AgentResult, AgentRuntime } from './types';

export interface WritingState {
  outline: string[];
  draft?: string;
  guidelines?: string;
  researchSummary?: string;
}

interface WritingAgentOptions {
  logger: AgentLogger;
  generateDraft: (outline: string[], context: Record<string, unknown>) => Promise<string>;
  reviseDraft: (draft: string, feedback: string) => Promise<string>;
}

export class WritingAgent implements AgentRuntime<WritingState> {
  public readonly name = 'writing' as const;

  constructor(private readonly options: WritingAgentOptions) {}

  async run(context: AgentExecutionContext, state: WritingState): Promise<AgentResult<WritingState>> {
    const logger = this.options.logger.withContext(context);
    const start = Date.now();

    try {
      const draft = state.draft
        ? await this.options.reviseDraft(state.draft, state.guidelines ?? '')
        : await this.options.generateDraft(state.outline, {
            researchSummary: state.researchSummary,
            guidelines: state.guidelines,
          });

      logger.log({
        level: 'info',
        message: 'Writing agent generated draft',
        timestamp: new Date(),
        data: { wordCount: draft.split(/\s+/).length },
      });

      return {
        status: 'success',
        payload: {
          ...state,
          draft,
        },
        metrics: {
          durationMs: Date.now() - start,
        },
        toolInvocations: [],
      };
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Writing agent failed: ${(error as Error).message}`,
        data: { error },
        timestamp: new Date(),
      });

      return {
        status: 'error',
        error: (error as Error).message,
        payload: state,
        metrics: {
          durationMs: Date.now() - start,
        },
        toolInvocations: [],
      };
    }
  }
}
