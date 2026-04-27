import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore } from '@/lib/store'
import { SAMPLE_RESUME } from '@/data/sample-resume'

// Define mock at module level before imports
const saveResumeMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/storage/adapter', () => ({
  createStorageAdapter: () => ({ saveResume: saveResumeMock }),
}))

// Import after mock is set up
const { useAutosave, AUTOSAVE_INTERVAL_MS } = await import('@/hooks/use-autosave')

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    saveResumeMock.mockClear()
    useAppStore.setState({
      resume: null,
      jobDescription: null,
      keywords: null,
      score: null,
      ui: { activePanel: 'editor', isMobile: false },
    })
  })
  afterEach(() => { vi.useRealTimers() })

  it('exports AUTOSAVE_INTERVAL_MS = 10000', () => {
    expect(AUTOSAVE_INTERVAL_MS).toBe(10_000)
  })

  it('calls saveResume once per interval when resume is non-null', async () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    renderHook(() => useAutosave())
    await act(async () => { vi.advanceTimersByTime(10_000) })
    expect(saveResumeMock).toHaveBeenCalledTimes(1)
  })

  it('does NOT call saveResume when resume is null', async () => {
    renderHook(() => useAutosave())
    await act(async () => { vi.advanceTimersByTime(10_000) })
    expect(saveResumeMock).not.toHaveBeenCalled()
  })

  it('invokes onSaved callback after each successful save', async () => {
    useAppStore.getState().setResume(SAMPLE_RESUME)
    const onSaved = vi.fn()
    renderHook(() => useAutosave(onSaved))
    await act(async () => {
      vi.advanceTimersByTime(10_000)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(onSaved).toHaveBeenCalledTimes(1)
  })

  it('cleans up the interval on unmount', () => {
    const { unmount } = renderHook(() => useAutosave())
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
