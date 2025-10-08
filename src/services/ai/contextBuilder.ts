interface ContextBuilderOptions {
  metadata: Record<string, unknown>;
  guidelines?: string;
  additionalNotes?: string[];
}

export function buildAgentContext({ metadata, guidelines, additionalNotes = [] }: ContextBuilderOptions) {
  return {
    metadata,
    guidelines,
    notes: additionalNotes.filter(Boolean),
  };
}
