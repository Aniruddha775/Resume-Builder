import type { Resume } from '@/types/resume'
import type { KeywordSet, Keyword } from '@/types/job-description'
import type { ScoreResult, ScoreCategoryBreakdown } from '@/types/score'
import { matchKeywords } from './fuse-matcher'
import { checkFormatting } from './formatting-checker'

export const WEIGHTS = {
  hardRequirements: 0.40,
  preferredSkills:  0.20,
  toolsAndTech:     0.20,
  softSkills:       0.10,
  formatting:       0.10,
} as const

function extractResumeText(resume: Resume): string {
  const s = resume.sections
  const parts: string[] = []
  parts.push(s.contactInfo.fullName ?? '')
  if (s.summary) parts.push(s.summary)
  for (const exp of s.experience) {
    parts.push(exp.company, exp.title)
    parts.push(...exp.bullets)
  }
  for (const edu of s.education) {
    parts.push(edu.institution, edu.degree, edu.field)
  }
  for (const group of s.skills) {
    parts.push(group.category)
    parts.push(...group.items)
  }
  return parts.filter(Boolean).join(' ')
}

function sliceBreakdown(
  keywords: Keyword[],
  matchMap: Map<string, boolean>,
  weight: number,
  label: string
): ScoreCategoryBreakdown {
  if (keywords.length === 0) {
    return { category: label, weight, matched: 0, total: 0, percentage: 0, weightedScore: 0 }
  }
  const matchedCount = keywords.filter((k) => matchMap.get(k.term) === true).length
  const percentage = Math.round((matchedCount / keywords.length) * 100)
  return {
    category: label,
    weight,
    matched: matchedCount,
    total: keywords.length,
    percentage,
    weightedScore: weight * percentage,
  }
}

export function computeAtsScore(resume: Resume, keywords: KeywordSet): ScoreResult {
  const resumeText = extractResumeText(resume)

  // Single matchKeywords pass over all terms combined
  const allKeywords = [
    ...keywords.hardRequirements,
    ...keywords.preferredSkills,
    ...keywords.toolsAndTech,
    ...keywords.softSkills,
  ]
  const allTerms = allKeywords.map((k) => k.term)
  const allResults = matchKeywords(allTerms, resumeText)

  // Build a term → matched map for O(1) lookup in sliceBreakdown
  const matchMap = new Map<string, boolean>()
  for (let i = 0; i < allKeywords.length; i++) {
    // If a term appears in multiple categories, OR the results
    const existing = matchMap.get(allKeywords[i].term) ?? false
    matchMap.set(allKeywords[i].term, existing || allResults[i])
  }

  const hard      = sliceBreakdown(keywords.hardRequirements, matchMap, WEIGHTS.hardRequirements, 'Hard Requirements')
  const preferred = sliceBreakdown(keywords.preferredSkills,  matchMap, WEIGHTS.preferredSkills,  'Preferred Skills')
  const tools     = sliceBreakdown(keywords.toolsAndTech,     matchMap, WEIGHTS.toolsAndTech,     'Tools & Tech')
  const soft      = sliceBreakdown(keywords.softSkills,       matchMap, WEIGHTS.softSkills,       'Soft Skills')
  const formatting = checkFormatting(resume)

  const rawTotal = hard.weightedScore + preferred.weightedScore + tools.weightedScore + soft.weightedScore + formatting.weightedScore
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)))

  const matchedKeywords = allKeywords.filter((_, i) => allResults[i]).map((k) => k.term)
  const missingKeywords  = allKeywords.filter((_, i) => !allResults[i]).map((k) => k.term)

  return {
    totalScore,
    breakdown: { hardRequirements: hard, preferredSkills: preferred, toolsAndTech: tools, softSkills: soft, formatting },
    matchedKeywords,
    missingKeywords,
    computedAt: new Date().toISOString(),
  }
}
