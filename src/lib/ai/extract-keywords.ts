import type { KeywordSet, Keyword, KeywordCategory } from '@/types/job-description'
import type { AiProvider } from './api-key-store'

export type ExtractionErrorCode =
  | 'NO_API_KEY'
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'JD_TOO_SHORT'

export interface ExtractionSuccess {
  keywords: KeywordSet
  error?: never
}
export interface ExtractionFailure {
  keywords?: never
  error: ExtractionErrorCode
}
export type ExtractionOutcome = ExtractionSuccess | ExtractionFailure

// Maps flat string array from LLM to typed Keyword[]
function toKeywords(terms: string[], category: KeywordCategory): Keyword[] {
  return (terms ?? []).map((term) => ({
    term: term.trim(),
    category,
    matched: false,
  }))
}

export async function extractKeywords(
  jobDescription: string,
  apiKey: string,
  provider: AiProvider = 'openai'
): Promise<ExtractionOutcome> {
  try {
    const res = await fetch('/api/extract-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-ai-provider': provider,
      },
      body: JSON.stringify({ jobDescription }),
    })

    const data = (await res.json()) as {
      hardRequirements?: string[]
      preferredSkills?: string[]
      toolsAndTech?: string[]
      softSkills?: string[]
      error?: string
    }

    if (!res.ok) {
      const errCode = data.error as ExtractionErrorCode | undefined
      return { error: errCode ?? 'PROVIDER_ERROR' }
    }

    const keywords: KeywordSet = {
      hardRequirements: toKeywords(data.hardRequirements ?? [], 'hard'),
      preferredSkills: toKeywords(data.preferredSkills ?? [], 'preferred'),
      toolsAndTech: toKeywords(data.toolsAndTech ?? [], 'tools'),
      softSkills: toKeywords(data.softSkills ?? [], 'soft'),
    }

    return { keywords }
  } catch {
    return { error: 'NETWORK_ERROR' }
  }
}
