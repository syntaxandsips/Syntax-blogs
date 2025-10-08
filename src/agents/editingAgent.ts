import type { AgentExecutionContext, AgentLogger, AgentResult, AgentRuntime } from './types';

export interface EditingState {
  draft: string;
  toneGuidelines: string;
  factCheckItems: string[];
  revisions?: string[];
}

interface EditingAgentOptions {
  logger: AgentLogger;
  enforceTone: (draft: string, tone: string) => Promise<string>;
  factCheck: (statements: string[]) => Promise<Record<string, boolean>>;
}

export class EditingAgent implements AgentRuntime<EditingState> {
  public readonly name = 'editing' as const;

  constructor(private readonly options: EditingAgentOptions) {}

  async run(context: AgentExecutionContext, state: EditingState): Promise<AgentResult<EditingState>> {
    const logger = this.options.logger.withContext(context);
    const start = Date.now();

    try {
      const toned = await this.options.enforceTone(state.draft, state.toneGuidelines);
      const factCheckResults = await this.options.factCheck(state.factCheckItems);

      const failedFacts = Object.entries(factCheckResults)
        .filter(([, ok]) => !ok)
        .map(([statement]) => statement);

      const revisions = failedFacts.length > 0
        ? [`Fact check failed for: ${failedFacts.join(', ')}`]
        : ['Tone alignment verified'];

      logger.log({
        level: 'info',
        message: 'Editing agent completed review',
        data: { failedFacts: failedFacts.length },
        timestamp: new Date(),
      });

      return {
        status: failedFacts.length > 0 ? 'pending' : 'success',
        payload: {
          ...state,
          draft: toned,
          revisions,
        },
        metrics: {
          durationMs: Date.now() - start,
        },
        toolInvocations: [],
      };
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Editing agent failed: ${(error as Error).message}`,
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
