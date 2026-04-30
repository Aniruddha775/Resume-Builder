import { Badge } from '@/components/ui/badge'
import type { KeywordSet } from '@/types/job-description'

// Color classes per category — blue=hard, purple=preferred, orange=tools, teal=soft
const CATEGORY_CONFIG = {
  hardRequirements: {
    label: 'Required',
    chipClass: 'border-blue-300 bg-blue-50 text-blue-700',
  },
  preferredSkills: {
    label: 'Preferred',
    chipClass: 'border-purple-300 bg-purple-50 text-purple-700',
  },
  toolsAndTech: {
    label: 'Tools & Tech',
    chipClass: 'border-orange-300 bg-orange-50 text-orange-700',
  },
  softSkills: {
    label: 'Soft Skills',
    chipClass: 'border-teal-300 bg-teal-50 text-teal-700',
  },
} as const

type CategoryKey = keyof typeof CATEGORY_CONFIG

interface KeywordChipsProps {
  keywords: KeywordSet
}

export function KeywordChips({ keywords }: KeywordChipsProps) {
  const categories: CategoryKey[] = ['hardRequirements', 'preferredSkills', 'toolsAndTech', 'softSkills']

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const items = keywords[cat]
        if (items.length === 0) return null
        const { label, chipClass } = CATEGORY_CONFIG[cat]
        return (
          <div key={cat}>
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
              {label}
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label={`${label} keywords`}>
              {items.map((kw) => (
                <Badge
                  key={kw.term}
                  variant="outline"
                  role="listitem"
                  className={`text-[10px] cursor-default ${chipClass}`}
                >
                  {kw.term}
                </Badge>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
