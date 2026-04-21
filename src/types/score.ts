import { z } from 'zod'

export const ScoreCategoryBreakdownSchema = z.object({
  category: z.string(),
  weight: z.number(),
  matched: z.number(),
  total: z.number(),
  percentage: z.number(),
  weightedScore: z.number(),
})

export const ScoreResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  breakdown: z.object({
    hardRequirements: ScoreCategoryBreakdownSchema,
    preferredSkills: ScoreCategoryBreakdownSchema,
    toolsAndTech: ScoreCategoryBreakdownSchema,
    softSkills: ScoreCategoryBreakdownSchema,
    formatting: ScoreCategoryBreakdownSchema,
  }),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  computedAt: z.string().datetime(),
})

// Inferred TypeScript types
export type ScoreCategoryBreakdown = z.infer<typeof ScoreCategoryBreakdownSchema>
export type ScoreResult = z.infer<typeof ScoreResultSchema>
