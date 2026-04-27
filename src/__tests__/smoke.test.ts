import { describe, it, expect } from 'vitest'

describe('Vitest setup', () => {
  it('runs tests', () => {
    expect(true).toBe(true)
  })

  it('has localStorage mock', () => {
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
    localStorage.clear()
  })
})
