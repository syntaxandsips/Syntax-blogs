import { z } from 'zod'

const uuidString = () => z.string().uuid()

const optionalUrl = z
  .string()
  .url()
  .max(2000)
  .optional();

const baseListFields = {
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/i, 'Slug may only contain letters, numbers, and hyphens.'),
  coverImageUrl: optionalUrl.or(z.literal('').transform(() => undefined)),
} as const;

export const createListSchema = z
  .object({
    ...baseListFields,
    isPublic: z.boolean().default(false),
  })
  .strict()

export const updateListSchema = z
  .object({
    ...baseListFields,
    isPublic: z.boolean().optional(),
  })
  .partial()
  .strict()
  .superRefine((value, ctx) => {
    const hasUpdates = Object.entries(value).some(([, fieldValue]) => fieldValue !== undefined);

    if (!hasUpdates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide at least one field to update.',
      });
    }
  })

export const listIdentifierSchema = z.object({
  listId: uuidString(),
})

export const createListItemSchema = z
  .object({
    postId: uuidString(),
    note: z.string().max(500).optional().nullable(),
    position: z.number().int().min(0).optional(),
  })
  .strict()

export const updateListItemSchema = z
  .object({
    note: z.string().max(500).optional().nullable(),
    position: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  })

export const listItemIdentifierSchema = z.object({
  listId: uuidString(),
  itemId: uuidString(),
})

export const saveListSchema = z
  .object({
    listId: uuidString(),
  })
  .strict()

export const savedListIdentifierSchema = z.object({
  savedListId: uuidString(),
})

export const createHighlightSchema = z
  .object({
    postId: uuidString(),
    highlightedText: z.string().min(1).max(5000),
    note: z.string().max(1000).optional().nullable(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .default('#FFEB3B'),
    positionStart: z.number().int().min(0),
    positionEnd: z.number().int().min(1),
    isPublic: z.boolean().default(false),
  })
  .strict()
  .refine((value) => value.positionEnd > value.positionStart, {
    message: 'positionEnd must be greater than positionStart.',
    path: ['positionEnd'],
  })

export const updateHighlightSchema = createHighlightSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  })
  .refine(
    (value) =>
      !('positionStart' in value) ||
      !('positionEnd' in value) ||
      (typeof value.positionStart === 'number' &&
        typeof value.positionEnd === 'number' &&
        value.positionEnd > value.positionStart),
    {
      message: 'positionEnd must be greater than positionStart.',
      path: ['positionEnd'],
    },
  )

export const highlightIdentifierSchema = z.object({
  highlightId: uuidString(),
})

export const recordReadingSchema = z
  .object({
    historyId: z.string().uuid().optional(),
    postId: uuidString(),
    readDurationSeconds: z.number().int().min(0).optional().nullable(),
    scrollPercentage: z.number().int().min(0).max(100).optional().nullable(),
    completed: z.boolean().default(false),
    lastPosition: z.number().int().min(0).default(0),
    readAt: z.string().datetime().optional(),
  })
  .strict()

export const readingHistoryIdentifierSchema = z.object({
  historyId: uuidString(),
})

export const createBookmarkSchema = z
  .object({
    postId: uuidString(),
  })
  .strict()

export const bookmarkIdentifierSchema = z.object({
  bookmarkId: uuidString(),
})

export const statsQuerySchema = z
  .object({
    range: z.enum(['7d', '30d', '90d', '365d']).default('30d'),
  })
  .strict()

export const paginationQuerySchema = z
  .object({
    limit: z
      .string()
      .optional()
      .transform((value) => {
        if (value === undefined) return 20
        const parsed = Number.parseInt(value, 10)
        return parsed
      })
      .refine((value) => Number.isInteger(value) && value > 0 && value <= 100, {
        message: 'limit must be an integer between 1 and 100',
      }),
    cursor: z.string().optional(),
  })
  .strict()

export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type CreateListItemInput = z.infer<typeof createListItemSchema>
export type UpdateListItemInput = z.infer<typeof updateListItemSchema>
export type SaveListInput = z.infer<typeof saveListSchema>
export type CreateHighlightInput = z.infer<typeof createHighlightSchema>
export type UpdateHighlightInput = z.infer<typeof updateHighlightSchema>
export type RecordReadingInput = z.infer<typeof recordReadingSchema>
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>

export const validateWithSchema = async <Schema extends z.ZodTypeAny>(
  schema: Schema,
  payload: unknown,
): Promise<
  | { success: true; data: z.infer<Schema> }
  | { success: false; error: z.ZodFlattenedError<z.infer<Schema>, string> }
> => {
  const parsed = await schema.safeParseAsync(payload)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  return { success: true, data: parsed.data }
}
