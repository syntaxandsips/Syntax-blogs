import { z } from 'zod';

export const ResearchQuerySchema = z.object({
  query: z.string().min(3),
  limit: z.number().int().positive().max(10).default(5),
});

export const ResearchResponseSchema = z.object({
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      snippet: z.string().optional(),
    }),
  ),
  summary: z.string().optional(),
});

export const DraftUpdateSchema = z.object({
  postId: z.string().uuid(),
  draft: z.string(),
  metadata: z.record(z.string()).optional(),
});

export const SeoAnalysisSchema = z.object({
  draft: z.string(),
  focusKeyword: z.string(),
});

export const SeoAnalysisResponseSchema = z.object({
  score: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
});

export const StorageUploadSchema = z.object({
  path: z.string(),
  contentType: z.string(),
  data: z.string(),
});

export type ResearchQuery = z.infer<typeof ResearchQuerySchema>;
export type ResearchResponse = z.infer<typeof ResearchResponseSchema>;
export type DraftUpdatePayload = z.infer<typeof DraftUpdateSchema>;
export type SeoAnalysisRequest = z.infer<typeof SeoAnalysisSchema>;
export type SeoAnalysisResponse = z.infer<typeof SeoAnalysisResponseSchema>;
export type StorageUploadRequest = z.infer<typeof StorageUploadSchema>;
