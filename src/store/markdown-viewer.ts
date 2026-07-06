import { create } from 'zustand'

interface MarkdownViewerState {
  isZenMode: boolean
  isFullscreen: boolean
  toggleZenMode: () => void
  toggleFullscreen: () => void
}

export const useMarkdownViewerStore = create<MarkdownViewerState>((set) => ({
  isZenMode: false,
  isFullscreen: false,
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen }))
}))
