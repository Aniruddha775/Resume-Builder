import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { KeywordSet } from '@/types/job-description'

export interface KeywordsSlice {
  keywords: KeywordSet | null
  setKeywords: (keywords: KeywordSet) => void
  clearKeywords: () => void
}

export const createKeywordsSlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  KeywordsSlice
> = (set) => ({
  keywords: null,
  setKeywords: (keywords) =>
    set((state) => {
      state.keywords = keywords
    }),
  clearKeywords: () =>
    set((state) => {
      state.keywords = null
    }),
})
