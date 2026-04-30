'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { extractKeywords } from '@/lib/ai/extract-keywords'
import type { ExtractionErrorCode } from '@/lib/ai/extract-keywords'
import { loadApiKeyConfig } from '@/lib/ai/api-key-store'
import { JdTextarea } from './jd-textarea'
import { KeywordChips } from './keyword-chips'
import { ApiKeyModal } from './api-key-modal'
import { Button } from '@/components/ui/button'
import { Loader2, Key } from 'lucide-react'

type ExtractionStatus = 'idle' | 'extracting' | 'done' | 'error'

const ERROR_MESSAGES: Record<ExtractionErrorCode, string> = {
  NO_API_KEY:     'Add an API key to extract keywords.',
  INVALID_KEY:    'Invalid API key. Check your key and try again.',
  RATE_LIMITED:   'Rate limit reached. Wait a moment and try again.',
  PROVIDER_ERROR: 'Provider error. Try again or check provider status.',
  NETWORK_ERROR:  'Network error. Check your connection.',
  JD_TOO_SHORT:   'Job description is too short (50 character minimum). Paste the full posting.',
}

export function JdInputPanel() {
  const jobDescription = useAppStore((s) => s.jobDescription)
  const keywords = useAppStore((s) => s.keywords)
  const setJobDescription = useAppStore((s) => s.setJobDescription)
  const setKeywords = useAppStore((s) => s.setKeywords)
  const clearJobDescription = useAppStore((s) => s.clearJobDescription)
  const clearKeywords = useAppStore((s) => s.clearKeywords)
  const clearScore = useAppStore((s) => s.clearScore)

  const [status, setStatus] = useState<ExtractionStatus>('idle')
  const [errorCode, setErrorCode] = useState<ExtractionErrorCode | null>(null)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    setHasApiKey(loadApiKeyConfig() !== null)
  }, [showApiKeyModal])

  const rawText = jobDescription?.rawText ?? ''

  const handleTextChange = useCallback(
    (text: string) => {
      setJobDescription({
        id: jobDescription?.id ?? crypto.randomUUID(),
        rawText: text,
        pastedAt: jobDescription?.pastedAt ?? new Date().toISOString(),
        extractedKeywords: null,
      })
    },
    [jobDescription, setJobDescription]
  )

  const handleClear = useCallback(() => {
    clearJobDescription()
    clearKeywords()
    clearScore()
    setStatus('idle')
    setErrorCode(null)
  }, [clearJobDescription, clearKeywords, clearScore])

  const handleExtract = useCallback(async () => {
    const config = loadApiKeyConfig()
    if (!config) {
      setShowApiKeyModal(true)
      return
    }
    setStatus('extracting')
    setErrorCode(null)

    const result = await extractKeywords(rawText, config.key, config.provider)

    if ('error' in result) {
      setStatus('error')
      setErrorCode(result.error ?? null)
      return
    }

    setKeywords(result.keywords)
    setStatus('done')
  }, [rawText, setKeywords, setStatus, setErrorCode])

  return (
    <div className="flex flex-col h-full p-4 gap-3 overflow-y-auto">
      <JdTextarea
        value={rawText}
        onChange={handleTextChange}
        onClear={handleClear}
      />

      {/* Extract + API Key buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleExtract}
          disabled={status === 'extracting' || rawText.length < 50}
          size="sm"
          className="flex-1"
        >
          {status === 'extracting' ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" aria-hidden="true" />
              <span aria-live="polite" aria-label="Extracting keywords, please wait">
                Extracting…
              </span>
            </>
          ) : (
            'Extract Keywords'
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowApiKeyModal(true)}
          aria-label="Configure AI provider API key"
        >
          <Key className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>

      {/* No API key prompt */}
      {!hasApiKey && rawText.length >= 50 && status === 'idle' && (
        <p className="text-[11px] text-muted-foreground" aria-live="polite">
          Configure an API key to extract keywords.{' '}
          <Button
            variant="link"
            size="sm"
            className="inline p-0 h-auto"
            onClick={() => setShowApiKeyModal(true)}
          >
            Configure
          </Button>
        </p>
      )}

      {/* Error message */}
      {status === 'error' && errorCode && (
        <p
          className="text-[11px] text-destructive"
          role="alert"
          aria-live="assertive"
        >
          {ERROR_MESSAGES[errorCode]}
        </p>
      )}

      {/* Extracted keyword chips */}
      {keywords && (
        <div className="mt-1">
          <KeywordChips keywords={keywords} />
        </div>
      )}

      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  )
}
