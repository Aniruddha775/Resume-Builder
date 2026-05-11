'use client'

import { useAppStore } from '@/lib/store'
import { ScoreRing } from './score-ring'
import { CategoryBar } from './category-bar'
import { KeywordChipList } from './keyword-chip-list'

export function ScorePanel() {
  const score = useAppStore((s) => s.score)
  const keywords = useAppStore((s) => s.keywords)

  if (!score && !keywords) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Paste a job description to see your ATS score
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Click &quot;Extract Keywords&quot; in the Job Description panel
          </p>
        </div>
      </div>
    )
  }

  if (!score && keywords) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">Computing score…</p>
      </div>
    )
  }

  if (!score) return null

  const { totalScore, breakdown, matchedKeywords, missingKeywords } = score
  const categories = [
    breakdown.hardRequirements,
    breakdown.preferredSkills,
    breakdown.toolsAndTech,
    breakdown.softSkills,
  ]

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto">
      <div className="flex flex-col items-center gap-1 pt-2">
        <ScoreRing score={totalScore} size={120} />
        <p className="text-[11px] text-muted-foreground mt-1">ATS Score</p>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Breakdown</p>
        {categories.map((cat) => <CategoryBar key={cat.category} breakdown={cat} />)}
        <CategoryBar breakdown={breakdown.formatting} />
      </div>

      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Keywords</p>
        <KeywordChipList matched={matchedKeywords} missing={missingKeywords} />
      </div>
    </div>
  )
}
