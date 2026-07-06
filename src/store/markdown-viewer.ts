import { create } from 'zustand'

export type ViewMode = 'split' | 'editor' | 'preview'

interface MarkdownViewerState {
  viewMode: ViewMode
  isFullscreen: boolean
  zoomLevel: number
  setViewMode: (mode: ViewMode) => void
  toggleFullscreen: () => void
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void
}

export const useMarkdownViewerStore = create<MarkdownViewerState>((set) => ({
  viewMode: 'split',
  isFullscreen: false,
  zoomLevel: 14, // default font size in px
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setZoomLevel: (zoom) => set((state) => ({
    zoomLevel: typeof zoom === 'function' ? zoom(state.zoomLevel) : zoom
  }))
}))
