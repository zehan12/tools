import { create } from "zustand"
import { persist } from "zustand/middleware"
import { temporal } from "zundo"

export const defaultMarkdown = `# Markdown Viewer Online — Open .md Files Free in Your Browser 👁️

Welcome to **MarkdownLivePreview.dev** — your free **online markdown viewer**. Upload any \`.md\` file, paste content, or type directly to see instant, professional rendering. No installation, no signup — this **browser markdown viewer** runs 100% client-side on Mac, Windows, and Linux.

[![Made by DigitalPro](https://img.shields.io/badge/Made%20by-DigitalPro-blue)](https://digitalpro.dev)
![Free](https://img.shields.io/badge/Free-Forever-green)
![No Install](https://img.shields.io/badge/No%20Install-Required-brightgreen)

## What This Markdown Viewer Supports

Our **free online markdown viewer** renders every major **markdown** feature:

- 📁 **Drag & drop .md file upload** — open any markdown file directly in your browser
- 👁️ **Live side-by-side view** — edit on the left, see rendered output on the right
- 📊 **GitHub-flavored markdown (GFM)** — tables, task lists, strikethrough, footnotes
- 💻 **Syntax-highlighted code** — 50+ languages
- 😄 **Emoji support** — :rocket: :tada: :white_check_mark:
- 🚀 **Free forever** — no login, no file size server limit

> **Tip**: Use the left pane to paste or upload your markdown. The right pane shows the live rendered output. Works on Mac, Windows, and Linux — no install needed.
`

export interface MarkdownState {
  input: string
  setInput: (input: string) => void
  clearInput: () => void
}

export const useMarkdownStore = create<MarkdownState>()(
  temporal(
    persist(
      (set) => ({
        input: defaultMarkdown,
        setInput: (input) => set({ input }),
        clearInput: () => set({ input: '' }),
      }),
      { name: 'tools-markdown-viewer-zundo' }
    ),
    { limit: 100 }
  )
)
