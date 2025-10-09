import type { AgentExecutionContext, AgentLogger, AgentResult, AgentRuntime } from './types';

export interface OptimizationState {
  draft: string;
  keywords: string[];
  metadata: Record<string, string>;
  seoScore?: number;
  recommendations?: string[];
}

interface OptimizationAgentOptions {
  logger: AgentLogger;
  analyzeSeo: (draft: string, keywords: string[]) => Promise<{ score: number; recommendations: string[] }>;
  generateMetadata: (draft: string) => Promise<Record<string, string>>;
}

export class OptimizationAgent implements AgentRuntime<OptimizationState> {
  public readonly name = 'optimization' as const;

  constructor(private readonly options: OptimizationAgentOptions) {}

  async run(context: AgentExecutionContext, state: OptimizationState): Promise<AgentResult<OptimizationState>> {
    const logger = this.options.logger.withContext(context);
    const start = Date.now();

    try {
      const [seo, metadata] = await Promise.all([
        this.options.analyzeSeo(state.draft, state.keywords),
        this.options.generateMetadata(state.draft),
      ]);

      logger.log({
        level: 'info',
        message: 'Optimization agent completed analysis',
        data: { seoScore: seo.score },
        timestamp: new Date(),
      });

      return {
        status: 'success',
        payload: {
          ...state,
          seoScore: seo.score,
          recommendations: seo.recommendations,
          metadata: { ...state.metadata, ...metadata },
        },
        metrics: {
          durationMs: Date.now() - start,
        },
        toolInvocations: [],
      };
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Optimization agent failed: ${(error as Error).message}`,
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
