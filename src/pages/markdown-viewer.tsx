import { useRef, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { MarkdownToolbar } from "@/components/tools/markdown-viewer/MarkdownToolbar"
import { useMarkdownViewerStore } from "@/store/markdown-viewer"

const defaultMarkdown = `# Welcome to Markdown Viewer!

This is a live markdown previewer built with React.

## Features
- **Live Preview**: See your changes instantly
- **GitHub Flavored Markdown**: Tables, strikethrough, task lists, and more
- **Raw HTML Support**: Mix HTML elements right into your markdown

### Table Example
| Syntax | Description |
| --- | ----------- |
| Header | Title |
| Paragraph | Text |

### Code Example
\`\`\`javascript
function greet() {
  console.log("Hello, world!");
}
\`\`\`

> "Markdown is a lightweight markup language with plain-text-formatting syntax."
`

export default function MarkdownViewerTool() {
  const { t } = useTranslation()
  const [input, setInput, clearInput] = usePersist("tools-markdown-viewer", defaultMarkdown)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { isZenMode, isFullscreen, zoomLevel } = useMarkdownViewerStore()

  const [renderedCharCount, setRenderedCharCount] = useState(0)
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [input, zoomLevel])

  useEffect(() => {
    if (articleRef.current) {
      setRenderedCharCount(articleRef.current.textContent?.length || 0)
    }
  }, [input])

  const content = (
    <div className={`flex flex-col gap-4 ${isFullscreen || isZenMode ? 'h-full' : 'h-[calc(100vh-13rem)]'}`}>
      <MarkdownToolbar textareaRef={textareaRef} value={input} onChange={setInput} />
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0`}>
        {/* Editor Pane */}
        <div className="flex flex-col h-full min-h-0 border rounded-md overflow-hidden bg-white dark:bg-[#111]">
          <div className="bg-muted px-4 py-2 text-sm font-medium border-b border-border flex justify-between items-center">
            <span>{t('tools.markdown-viewer.raw', "Editor")}</span>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <Textarea
              ref={textareaRef}
              id="input-markdown"
              placeholder="# Type your markdown here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ fontSize: `${zoomLevel}px`, lineHeight: 1.5 }}
              className="w-full min-h-full resize-none font-mono border-0 focus-visible:ring-0 rounded-none shadow-none overflow-hidden p-4"
            />
          </ScrollArea>
          <div className="bg-muted/50 px-4 py-1 text-xs text-muted-foreground border-t border-border flex justify-between">
            <span>{input.length.toLocaleString()} characters</span>
            <span>{input.split(/\\s+/).filter(w => w.length > 0).length.toLocaleString()} words</span>
          </div>
        </div>
        
        {/* Preview Pane */}
        <div className="flex flex-col h-full min-h-0 border rounded-md overflow-hidden bg-card">
          <div className="bg-muted px-4 py-2 text-sm font-medium border-b border-border flex justify-between items-center">
            <span>{t('tools.markdown-viewer.preview', "Preview")}</span>
          </div>
          <ScrollArea className="flex-1 min-h-0 p-4 lg:p-6 shadow-inner">
            <article ref={articleRef} className="prose dark:prose-invert max-w-none" style={{ fontSize: `${zoomLevel}px` }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {input}
              </ReactMarkdown>
            </article>
          </ScrollArea>
          <div className="bg-muted/50 px-4 py-1 text-xs text-muted-foreground border-t border-border flex justify-between">
            <span>{renderedCharCount.toLocaleString()} rendered chars</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (isFullscreen || isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-4 overflow-hidden">
        {content}
      </div>
    )
  }

  return (
    <ToolLayout 
      title="Markdown Viewer" 
      description="Preview markdown with live rendering, syntax highlighting, and standard GitHub-flavored Markdown support."
      onClear={clearInput}
    >
      {content}
    </ToolLayout>
  )
}
