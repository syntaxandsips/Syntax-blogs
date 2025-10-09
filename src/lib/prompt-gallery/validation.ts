import { z } from 'zod'
const monetizationEnum = z.enum(['free', 'tip-enabled', 'premium'])
const mediaEnum = z.enum(['image', 'video', 'text', 'audio', '3d', 'workflow'])
const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced'])
const visibilityEnum = z.enum(['public', 'unlisted', 'draft'])

export const promptAssetSchema = z.object({
  file_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  asset_type: z.enum(['image', 'video', 'file']).default('image'),
  display_order: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const createPromptSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().max(280).optional(),
  promptText: z.string().min(10),
  negativePrompt: z.string().max(2000).optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  mediaType: mediaEnum,
  monetizationType: monetizationEnum,
  difficulty: difficultyEnum,
  language: z.string().min(2).max(10).default('en'),
  license: z.string().min(2).max(80).default('CC0'),
  visibility: visibilityEnum.default('public'),
  price: z.number().min(0).max(500).nullable().optional(),
  primaryModelId: z.string().uuid(),
  secondaryModelIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().min(2).max(40)).max(12).optional(),
  assets: z.array(promptAssetSchema).max(6).optional(),
})

export type CreatePromptInput = z.infer<typeof createPromptSchema>

