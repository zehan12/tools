import { useRef, useEffect } from "react"
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

  // Auto-resize textarea so the ScrollArea component handles the scrolling
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [input, zoomLevel])

  const content = (
    <div className="flex flex-col h-full gap-4">
      <MarkdownToolbar textareaRef={textareaRef} value={input} onChange={setInput} />
      
      <div className={`grid ${isZenMode ? 'grid-cols-1 max-w-3xl mx-auto w-full' : 'grid-cols-1 md:grid-cols-2'} gap-6 h-[calc(100vh-18rem)] min-h-[500px] flex-1`}>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <Label htmlFor="input-markdown" className={isZenMode ? "sr-only" : ""}>
            {t('tools.markdown-viewer.raw', "Raw Markdown")}
          </Label>
          <ScrollArea className="flex-1 min-h-0 border outline-border bg-white dark:bg-[#111]">
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
        </div>
        
        {!isZenMode && (
          <div className="flex flex-col gap-2 h-full min-h-0">
            <Label>{t('tools.markdown-viewer.preview', "Preview")}</Label>
            <ScrollArea className="flex-1 bg-card border rounded-md p-4 lg:p-6 shadow-sm min-h-0">
              <article className="prose dark:prose-invert max-w-none" style={{ fontSize: `${zoomLevel}px` }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {input}
                </ReactMarkdown>
              </article>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )

  if (isFullscreen || isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden">
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
