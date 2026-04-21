import { z } from 'zod'

export const KeywordCategorySchema = z.enum(['hard', 'preferred', 'tools', 'soft'])

export const KeywordSchema = z.object({
  term: z.string(),
  category: KeywordCategorySchema,
  matched: z.boolean(),
  matchedIn: z.string().optional(),
})

export const KeywordSetSchema = z.object({
  hardRequirements: z.array(KeywordSchema),
  preferredSkills: z.array(KeywordSchema),
  toolsAndTech: z.array(KeywordSchema),
  softSkills: z.array(KeywordSchema),
})

export const JobDescriptionSchema = z.object({
  id: z.string().uuid(),
  rawText: z.string(),
  pastedAt: z.string().datetime(),
  extractedKeywords: KeywordSetSchema.nullable(), // null until LLM extracts
})

// Inferred TypeScript types
export type KeywordCategory = z.infer<typeof KeywordCategorySchema>
export type Keyword = z.infer<typeof KeywordSchema>
export type KeywordSet = z.infer<typeof KeywordSetSchema>
export type JobDescription = z.infer<typeof JobDescriptionSchema>
