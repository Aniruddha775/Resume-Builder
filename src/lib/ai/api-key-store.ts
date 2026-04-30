// NOT a Zustand slice — API key lives in a SEPARATE localStorage key,
// not in rese-store, so it can be cleared independently.
// Key is NEVER stored server-side — sent per-request as a header.

export type AiProvider = 'openai' | 'anthropic'

export interface ApiKeyConfig {
  key: string
  provider: AiProvider
}

const STORAGE_KEY = 'rese:api-key-config'

export function saveApiKeyConfig(config: ApiKeyConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function loadApiKeyConfig(): ApiKeyConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'key' in parsed &&
      'provider' in parsed &&
      typeof (parsed as Record<string, unknown>).key === 'string' &&
      typeof (parsed as Record<string, unknown>).provider === 'string' &&
      ['openai', 'anthropic'].includes((parsed as Record<string, unknown>).provider as string)
    ) {
      return parsed as ApiKeyConfig
    }
    return null
  } catch {
    return null
  }
}

export function clearApiKeyConfig(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
