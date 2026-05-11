import type { Resume } from '@/types/resume'
import type { ScoreCategoryBreakdown } from '@/types/score'

const FORMATTING_WEIGHT = 0.10

export function checkFormatting(resume: Resume): ScoreCategoryBreakdown {
  const s = resume.sections
  const checks: boolean[] = [
    Boolean(s.contactInfo.fullName?.trim() && s.contactInfo.email?.trim()),
    s.experience.length > 0,
    s.education.length > 0,
    s.skills.length > 0,
    Boolean(s.summary && s.summary.trim().length > 20),
  ]

  const passedCount = checks.filter(Boolean).length
  const total = checks.length
  const percentage = Math.round((passedCount / total) * 100)

  return {
    category: 'Formatting',
    weight: FORMATTING_WEIGHT,
    matched: passedCount,
    total,
    percentage,
    weightedScore: FORMATTING_WEIGHT * percentage,
  }
}
