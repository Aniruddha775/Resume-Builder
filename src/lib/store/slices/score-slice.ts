import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { ScoreResult } from '@/types/score'

export interface ScoreSlice {
  score: ScoreResult | null
  setScore: (score: ScoreResult) => void
  clearScore: () => void
}

export const createScoreSlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  ScoreSlice
> = (set) => ({
  score: null,
  setScore: (score) =>
    set((state) => {
      state.score = score
    }),
  clearScore: () =>
    set((state) => {
      state.score = null
    }),
})
