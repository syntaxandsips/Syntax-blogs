import { SpanStatusCode, trace } from '@opentelemetry/api'

type SpanAttributes = Record<string, unknown>

type SpanCallback<T> = () => Promise<T> | T

const tracer = trace.getTracer('syntax-blogs')

export const withSpan = async <T>(
  name: string,
  attributes: SpanAttributes,
  callback: SpanCallback<T>,
): Promise<T> => {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await callback()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'unknown error',
      })
      throw error
    } finally {
      span.end()
    }
  })
}
