import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('returns initial value on first render', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 500))
    expect(result.current).toBe('a')
  })

  it('debounces rapid updates to the last value after delay', () => {
    const { result, rerender } = renderHook(
      ({ v, d }) => useDebouncedValue(v, d),
      { initialProps: { v: 'a', d: 500 } },
    )
    rerender({ v: 'b', d: 500 })
    rerender({ v: 'c', d: 500 })
    expect(result.current).toBe('a')  // not yet debounced
    act(() => { vi.advanceTimersByTime(499) })
    expect(result.current).toBe('a')  // one ms short
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('c')  // fully debounced
  })

  it('cleans up pending timeouts on unmount', () => {
    const { unmount } = renderHook(() => useDebouncedValue('x', 1000))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
