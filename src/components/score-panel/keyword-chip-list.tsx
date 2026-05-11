import { Badge } from '@/components/ui/badge'

interface KeywordChipListProps {
  matched: string[]
  missing: string[]
}

export function KeywordChipList({ matched, missing }: KeywordChipListProps) {
  const hasMatched = matched.length > 0
  const hasMissing = missing.length > 0
  if (!hasMatched && !hasMissing) return null
  return (
    <div className="space-y-3">
      {hasMatched && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Matched</p>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Matched keywords">
            {matched.map((term) => (
              <Badge key={term} variant="outline" role="listitem"
                className="text-[10px] cursor-default border-green-300 bg-green-50 text-green-700">{term}</Badge>
            ))}
          </div>
        </div>
      )}
      {hasMissing && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Missing</p>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Missing keywords">
            {missing.map((term) => (
              <Badge key={term} variant="outline" role="listitem"
                className="text-[10px] cursor-default border-red-300 bg-red-50 text-red-700">{term}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
