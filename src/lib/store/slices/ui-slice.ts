import type { StateCreator } from 'zustand'
import type { AppState } from '../index'

export type PanelId = 'jd' | 'editor' | 'score'

export interface UISlice {
  ui: {
    activePanel: PanelId
    isMobile: boolean
  }
  setActivePanel: (panel: PanelId) => void
  setIsMobile: (isMobile: boolean) => void
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
  },
  setActivePanel: (panel) =>
    set((state) => {
      state.ui.activePanel = panel
    }),
  setIsMobile: (isMobile) =>
    set((state) => {
      state.ui.isMobile = isMobile
    }),
})
