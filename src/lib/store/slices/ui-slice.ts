import type { StateCreator } from 'zustand'
import type { AppState } from '../index'

export type PanelId = 'jd' | 'editor' | 'score'

export interface UISlice {
  ui: {
    activePanel: PanelId
    isMobile: boolean
    lastSavedToken: number
  }
  setActivePanel: (panel: PanelId) => void
  setIsMobile: (isMobile: boolean) => void
  bumpLastSaved: () => void
}

export const createUISlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  UISlice
> = (set) => ({
  ui: {
    activePanel: 'editor',
    isMobile: false,
    lastSavedToken: 0,
  },
  setActivePanel: (panel) =>
    set((state) => {
      state.ui.activePanel = panel
    }),
  setIsMobile: (isMobile) =>
    set((state) => {
      state.ui.isMobile = isMobile
    }),
  bumpLastSaved: () =>
    set((state) => {
      state.ui.lastSavedToken += 1
    }),
})
