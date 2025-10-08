import { z } from 'zod'

const focusAreaLimit = 6
const linkLimit = 6
const tagLimit = 12

export const authorApplicationSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    pronouns: z
      .string()
      .max(60)
      .optional()
      .transform((value) => value?.trim() || undefined),
    focusAreas: z
      .array(z.string().min(2).max(64))
      .min(1)
      .max(focusAreaLimit),
    experienceLevel: z.string().min(2).max(120),
    currentRole: z.string().min(2).max(160),
    communityParticipation: z
      .string()
      .max(600)
      .optional()
      .transform((value) => value?.trim() || undefined),
    publishedLinks: z
      .array(z.string().url())
      .max(linkLimit)
      .optional()
      .default([]),
    socialHandles: z
      .record(z.string(), z.string().min(2).max(320))
      .optional()
      .default({}),
    writingSampleUrl: z
      .string()
      .url()
      .optional()
      .or(z.literal(''))
      .transform((value) => (value ? value : undefined)),
    pitchFocus: z.string().min(10).max(600),
    pitchAudience: z.string().min(10).max(600),
    pitchCadence: z.string().min(3).max(160),
    availability: z.string().min(3).max(200),
    consent: z.literal(true),
    editorialPolicyAcknowledged: z.literal(true),
    newsletterOptIn: z.boolean().default(false),
    captchaToken: z.string().min(10),
    existingApplicationId: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.focusAreas || value.focusAreas.length === 0) {
      ctx.addIssue({
        path: ['focusAreas'],
        code: z.ZodIssueCode.custom,
        message: 'Select at least one focus area.',
      })
    }

    if ((value.publishedLinks ?? []).length === 0 && !value.writingSampleUrl) {
      ctx.addIssue({
        path: ['publishedLinks'],
        code: z.ZodIssueCode.custom,
        message: 'Provide at least one published link or a writing sample.',
      })
    }
  })

export type AuthorApplicationInput = z.infer<typeof authorApplicationSchema>

export const editorialChecklistSchema = z.object({
  toneReviewed: z.boolean().default(false),
  accessibilityChecked: z.boolean().default(false),
  linksVerified: z.boolean().default(false),
  assetsIncluded: z.boolean().default(false),
  aiDisclosureProvided: z.boolean().default(false),
})

export const submissionMetadataSchema = z.object({
  canonicalUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
  series: z
    .string()
    .max(120)
    .optional()
    .transform((value) => value?.trim() || undefined),
  featuredImageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
})

export const communitySubmissionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(10).max(160),
  summary: z.string().min(40).max(400),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers, and hyphens.')
    .max(120)
    .optional(),
  categories: z.array(z.string().min(2).max(64)).min(1).max(5),
  tags: z.array(z.string().min(2).max(64)).max(tagLimit),
  content: z.string().min(2000, 'Draft must be at least 2,000 characters to submit.').max(120_000),
  notesToEditors: z
    .string()
    .max(2000)
    .optional()
    .transform((value) => value?.trim() || undefined),
  coAuthorIds: z.array(z.string().uuid()).optional().default([]),
  attachments: z.array(z.string().url()).optional().default([]),
  checklist: editorialChecklistSchema,
  metadata: submissionMetadataSchema,
  intent: z.enum(['autosave', 'save', 'submit']),
})

export type CommunitySubmissionInput = z.infer<typeof communitySubmissionSchema>

export const submissionTransitionSchema = z.object({
  submissionId: z.string().uuid(),
  action: z.enum(['submit', 'withdraw', 'feedback', 'approve', 'decline']),
  notes: z.string().max(2000).optional(),
})

export type SubmissionTransitionInput = z.infer<typeof submissionTransitionSchema>

export const authorApplicationReviewSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(['approve', 'decline', 'needs_more_info']),
  notes: z.string().max(2000).optional(),
})

export type AuthorApplicationReviewInput = z.infer<typeof authorApplicationReviewSchema>
