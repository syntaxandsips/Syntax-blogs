import type { AgentExecutionContext, AgentLogger, AgentResult, AgentRuntime } from './types';

interface ResearchAgentOptions {
  logger: AgentLogger;
  search: (query: string) => Promise<string[]>;
  summarize: (content: string[]) => Promise<string>;
}

export interface ResearchState {
  queries: string[];
  notes: string[];
  summary?: string;
}

export class ResearchAgent implements AgentRuntime<ResearchState> {
  public readonly name = 'research' as const;

  constructor(private readonly options: ResearchAgentOptions) {}

  async run(context: AgentExecutionContext, state: ResearchState): Promise<AgentResult<ResearchState>> {
    const logger = this.options.logger.withContext(context);
    const start = Date.now();

    try {
      const searchResults = await Promise.all(
        state.queries.map(async query => {
          logger.log({
            level: 'debug',
            message: `Executing research query: ${query}`,
            timestamp: new Date(),
          });
          const results = await this.options.search(query);
          return { query, results };
        }),
      );

      const deduped = Array.from(new Set(searchResults.flatMap(result => result.results)));
      const summary = await this.options.summarize(deduped);

      logger.log({
        level: 'info',
        message: `Research completed with ${deduped.length} sources`,
        timestamp: new Date(),
        data: { summaryLength: summary.length },
      });

      return {
        status: 'success',
        payload: {
          ...state,
          summary,
          notes: [...state.notes, ...deduped],
        },
        metrics: {
          durationMs: Date.now() - start,
        },
        toolInvocations: [],
      };
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Research agent failed: ${(error as Error).message}`,
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
