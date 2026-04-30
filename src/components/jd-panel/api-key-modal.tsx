'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  loadApiKeyConfig,
  saveApiKeyConfig,
  clearApiKeyConfig,
  type AiProvider,
} from '@/lib/ai/api-key-store'

interface ApiKeyModalProps {
  open: boolean
  onClose: () => void
}

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [provider, setProvider] = useState<AiProvider>('openai')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const config = loadApiKeyConfig()
      if (config) {
        setKey(config.key)
        setProvider(config.provider)
      } else {
        setKey('')
        setProvider('openai')
      }
      setError(null)
    }
  }, [open])

  const handleSave = () => {
    const trimmed = key.trim()
    if (!trimmed) {
      setError('API key is required.')
      return
    }
    saveApiKeyConfig({ key: trimmed, provider })
    onClose()
  }

  const handleRemove = () => {
    clearApiKeyConfig()
    setKey('')
    setProvider('openai')
    onClose()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-background rounded-lg p-6 w-full max-w-sm shadow-xl border border-border">
        <h2 id="api-key-dialog-title" className="text-sm font-semibold mb-4 text-foreground">
          Configure AI Provider
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="api-provider" className="text-[12px]">Provider</Label>
            <select
              id="api-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="openai">OpenAI (GPT-4o mini)</option>
              <option value="anthropic">Anthropic (Claude Haiku)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="api-key-input" className="text-[12px]">API Key</Label>
            <Input
              id="api-key-input"
              type="password"
              placeholder="sk-…"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(null) }}
              className="mt-1"
              autoComplete="off"
            />
            {error && (
              <p className="mt-1 text-[11px] text-destructive" role="alert">{error}</p>
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Stored in your browser only. Never sent to our servers.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="ml-auto text-destructive hover:text-destructive"
            >
              Remove Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
