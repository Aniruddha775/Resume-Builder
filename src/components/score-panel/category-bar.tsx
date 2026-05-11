import type { ScoreCategoryBreakdown } from '@/types/score'

interface CategoryBarProps {
  breakdown: ScoreCategoryBreakdown
}

function getBarColor(percentage: number): string {
  if (percentage >= 70) return 'bg-green-500'
  if (percentage >= 40) return 'bg-yellow-400'
  return 'bg-red-400'
}

export function CategoryBar({ breakdown }: CategoryBarProps) {
  const { category, matched, total, percentage } = breakdown
  if (total === 0) return null
  const barColor = getBarColor(percentage)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{category}</span>
        <span className="text-[11px] font-medium tabular-nums text-foreground">{matched}/{total}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" title={`${category}: ${percentage}%`}>
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percentage}%` }}
          role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${category}: ${percentage}%`} />
      </div>
    </div>
  )
}
