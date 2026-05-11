'use client'

interface ScoreRingProps {
  score: number  // 0-100
  size?: number  // default 120
}

function getColor(score: number): string {
  if (score >= 70) return '#22c55e'   // green-500
  if (score >= 40) return '#f59e0b'   // amber-400
  return '#ef4444'                    // red-500
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const strokeWidth = 10
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, score))
  const dashOffset = circumference * (1 - clampedScore / 100)
  const color = getColor(clampedScore)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`ATS Score: ${clampedScore} out of 100`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-muted-foreground/20" />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums leading-none" style={{ color }} aria-hidden="true">{clampedScore}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5" aria-hidden="true">/100</span>
      </div>
    </div>
  )
}
