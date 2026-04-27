import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render, screen } from '@testing-library/react'
import { useSavedFlash, SavedIndicator } from '@/components/editor/saved-indicator'

describe('useSavedFlash', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets visible true on trigger, false after 2000ms', () => {
    const { result } = renderHook(() => useSavedFlash(2000))
    expect(result.current.visible).toBe(false)
    act(() => {
      result.current.trigger()
    })
    expect(result.current.visible).toBe(true)
    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(result.current.visible).toBe(true)
    act(() => {
      vi.advanceTimersByTime(2)
    })
    expect(result.current.visible).toBe(false)
  })

  it('resets the timer on re-trigger', () => {
    const { result } = renderHook(() => useSavedFlash(2000))
    act(() => {
      result.current.trigger()
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      result.current.trigger()
    })
    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(result.current.visible).toBe(true)
    act(() => {
      vi.advanceTimersByTime(2)
    })
    expect(result.current.visible).toBe(false)
  })

  it('clears pending timer on unmount', () => {
    const { result, unmount } = renderHook(() => useSavedFlash(2000))
    act(() => {
      result.current.trigger()
    })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('SavedIndicator', () => {
  it('renders null when visible=false', () => {
    const { container } = render(<SavedIndicator visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders Saved text with role=status when visible=true', () => {
    render(<SavedIndicator visible={true} />)
    expect(screen.getByRole('status')).toHaveTextContent(/Saved/)
  })
})
