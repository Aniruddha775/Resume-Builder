import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createResumeSlice, type ResumeSlice } from './slices/resume-slice'
import {
  createJobDescriptionSlice,
  type JobDescriptionSlice,
} from './slices/job-description-slice'
import {
  createKeywordsSlice,
  type KeywordsSlice,
} from './slices/keywords-slice'
import { createScoreSlice, type ScoreSlice } from './slices/score-slice'
import { createUISlice, type UISlice } from './slices/ui-slice'

export type AppState = ResumeSlice &
  JobDescriptionSlice &
  KeywordsSlice &
  ScoreSlice &
  UISlice

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createResumeSlice(...a),
        ...createJobDescriptionSlice(...a),
        ...createKeywordsSlice(...a),
        ...createScoreSlice(...a),
        ...createUISlice(...a),
      })),
      {
        name: 'rese-store',
        version: 1,
        partialize: (state) => ({
          // resume lives in LocalStorageAdapter — single source of truth
          jobDescription: state.jobDescription,
          keywords: state.keywords,
          // score is derived, not persisted
          // ui state is not persisted
        }),
      }
    ),
    { name: 'Rese Store' }
  )
)
