import { describe, it, expect, beforeEach } from 'vitest'

// Mock localStorage with a simple in-memory store
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })
// Ensure window is defined (jsdom provides it, but make typeof check pass)
Object.defineProperty(global, 'window', { value: global, writable: true })

// Import AFTER mocks are in place
import { saveApiKeyConfig, loadApiKeyConfig, clearApiKeyConfig } from '@/lib/ai/api-key-store'

describe('api-key-store', () => {
  beforeEach(() => localStorageMock.clear())

  it('returns null when no key is saved', () => {
    expect(loadApiKeyConfig()).toBeNull()
  })

  it('round-trips openai config correctly', () => {
    saveApiKeyConfig({ key: 'sk-test123', provider: 'openai' })
    const result = loadApiKeyConfig()
    expect(result).toEqual({ key: 'sk-test123', provider: 'openai' })
  })

  it('round-trips anthropic config correctly', () => {
    saveApiKeyConfig({ key: 'sk-ant-test456', provider: 'anthropic' })
    const result = loadApiKeyConfig()
    expect(result).toEqual({ key: 'sk-ant-test456', provider: 'anthropic' })
  })

  it('returns null for corrupted localStorage data', () => {
    localStorage.setItem('rese:api-key-config', 'not valid json{{{')
    expect(loadApiKeyConfig()).toBeNull()
  })

  it('returns null for valid JSON but wrong shape', () => {
    localStorage.setItem('rese:api-key-config', JSON.stringify({ key: 123, provider: 'openai' }))
    expect(loadApiKeyConfig()).toBeNull()
  })

  it('returns null for unknown provider value', () => {
    localStorage.setItem('rese:api-key-config', JSON.stringify({ key: 'sk-x', provider: 'google' }))
    expect(loadApiKeyConfig()).toBeNull()
  })

  it('clears config from localStorage', () => {
    saveApiKeyConfig({ key: 'sk-test', provider: 'openai' })
    clearApiKeyConfig()
    expect(loadApiKeyConfig()).toBeNull()
    expect(localStorage.getItem('rese:api-key-config')).toBeNull()
  })
})
