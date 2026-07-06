import { create } from 'zustand'

interface MarkdownViewerState {
  isZenMode: boolean
  isFullscreen: boolean
  zoomLevel: number
  toggleZenMode: () => void
  toggleFullscreen: () => void
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void
}

export const useMarkdownViewerStore = create<MarkdownViewerState>((set) => ({
  isZenMode: false,
  isFullscreen: false,
  zoomLevel: 14, // default font size in px
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setZoomLevel: (zoom) => set((state) => ({
    zoomLevel: typeof zoom === 'function' ? zoom(state.zoomLevel) : zoom
  }))
}))
