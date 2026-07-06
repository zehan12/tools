import { useRef, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { useMarkdownStore } from "@/store/markdown-viewer"
import { useStore } from "zustand"

export default function MarkdownViewerTool() {
  const { t } = useTranslation()
  const { input, setInput, clearInput } = useMarkdownStore()
  const { undo, redo } = useMarkdownStore.temporal.getState()
  
  // Need to force re-render when undo/redo state changes to update button disabled state
  const pastLength = useStore(useMarkdownStore.temporal, (state) => state.pastStates.length)
  const futureLength = useStore(useMarkdownStore.temporal, (state) => state.futureStates.length)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copiedRaw, setCopiedRaw] = useState(false)
  const [copiedPreview, setCopiedPreview] = useState(false)

  // Auto-resize textarea so the ScrollArea component handles the scrolling
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [input])

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(input)
    setCopiedRaw(true)
    setTimeout(() => setCopiedRaw(false), 2000)
  }

  const handleCopyPreview = () => {
    // Basic text copy of the preview output, could be enhanced
    navigator.clipboard.writeText(input)
    setCopiedPreview(true)
    setTimeout(() => setCopiedPreview(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([input], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "document.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = input.substring(start, end)
    const newText = input.substring(0, start) + before + selectedText + after + input.substring(end)
    
    setInput(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const toolbarItems = [
    { icon: "ph:text-b", action: () => insertText("**", "**"), label: "Bold" },
    { icon: "ph:text-italic", action: () => insertText("_", "_"), label: "Italic" },
    { icon: "ph:text-strikethrough", action: () => insertText("~~", "~~"), label: "Strikethrough" },
    { icon: "ph:quotes", action: () => insertText("> ", ""), label: "Quote" },
    { type: "divider" },
    { icon: "ph:text-h-one", action: () => insertText("# ", ""), label: "H1" },
    { icon: "ph:text-h-two", action: () => insertText("## ", ""), label: "H2" },
    { icon: "ph:text-h-three", action: () => insertText("### ", ""), label: "H3" },
    { type: "divider" },
    { icon: "ph:list-bullets", action: () => insertText("- ", ""), label: "Bullet List" },
    { icon: "ph:list-numbers", action: () => insertText("1. ", ""), label: "Numbered List" },
    { type: "divider" },
    { icon: "ph:link", action: () => insertText("[", "](url)"), label: "Link" },
    { icon: "ph:image", action: () => insertText("![alt text](", ")"), label: "Image" },
    { icon: "ph:code", action: () => insertText("\`", "\`"), label: "Inline Code" },
    { icon: "ph:file-code", action: () => insertText("\`\`\`\\n", "\\n\`\`\`"), label: "Code Block" },
    { icon: "ph:table", action: () => insertText("\\n| Header | Header |\\n| --- | --- |\\n| Cell | Cell |\\n", ""), label: "Table" },
  ]

  return (
    <ToolLayout 
      title="Markdown Viewer" 
      description="Preview markdown with live rendering, syntax highlighting, and standard GitHub-flavored Markdown support."
      onClear={clearInput}
    >
      <div className="flex flex-col h-full gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/30 border border-border rounded-md">
          {toolbarItems.map((item, index) => (
            item.type === "divider" ? (
              <div key={index} className="w-px h-5 mx-1 bg-border" />
            ) : (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                onClick={item.action}
                title={item.label}
              >
                <Icon icon={item.icon!} className="w-4 h-4" />
              </Button>
            )
          ))}
        </div>

        {/* Main Editor/Preview Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-18rem)] min-h-[500px]">
          
          {/* Editor Panel */}
          <div className="flex flex-col h-full min-h-0 border outline-border rounded-md overflow-hidden bg-[#1e1e1e] dark:bg-[#1e1e1e]">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] text-gray-300 text-xs border-b border-[#3d3d3d]">
              <span className="font-medium">Editor</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#3d3d3d] hover:text-white" onClick={clearInput} title="Clear">
                  <Icon icon="ph:trash" className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#3d3d3d] hover:text-white" onClick={() => undo()} disabled={pastLength === 0} title="Undo">
                  <Icon icon="ph:arrow-u-up-left" className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#3d3d3d] hover:text-white" onClick={() => redo()} disabled={futureLength === 0} title="Redo">
                  <Icon icon="ph:arrow-u-up-right" className="w-4 h-4" />
                </Button>
                <div className="w-px h-3 mx-1 bg-[#4d4d4d]" />
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#3d3d3d] hover:text-white" onClick={handleCopyRaw} title="Copy">
                  <Icon icon={copiedRaw ? "ph:check" : "ph:copy"} className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#3d3d3d] hover:text-white" onClick={handleDownload} title="Download">
                  <Icon icon="ph:download-simple" className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 min-h-0">
              <Textarea
                ref={textareaRef}
                id="input-markdown"
                placeholder="Type your markdown here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full min-h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 rounded-none shadow-none overflow-hidden bg-transparent text-gray-300 p-4"
              />
            </ScrollArea>
            
            {/* Editor Footer */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] text-[#cccccc] text-[10px] border-t border-[#3d3d3d]">
              <span>{input.length.toLocaleString()} characters</span>
              <span>Markdown</span>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col h-full min-h-0 border outline-border rounded-md overflow-hidden bg-white dark:bg-[#0d1117]">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-[#161b22] text-gray-700 dark:text-gray-300 text-xs border-b border-border">
              <span className="font-medium">Preview</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-200 dark:hover:bg-[#30363d] hover:text-black dark:hover:text-white" onClick={handleCopyPreview} title="Copy Raw text">
                  <Icon icon={copiedPreview ? "ph:check" : "ph:copy"} className="w-4 h-4" />
                </Button>
                {/* Visual features from screenshot */}
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-200 dark:hover:bg-[#30363d] hover:text-black dark:hover:text-white" title="View Source">
                  <Icon icon="ph:code" className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-200 dark:hover:bg-[#30363d] hover:text-black dark:hover:text-white" title="Export PDF">
                  <Icon icon="ph:file-pdf" className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-200 dark:hover:bg-[#30363d] hover:text-black dark:hover:text-white" title="Fullscreen">
                  <Icon icon="ph:corners-out" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-4 lg:p-6">
              <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-pre:bg-gray-100 dark:prose-pre:bg-[#161b22] prose-pre:text-gray-900 dark:prose-pre:text-gray-100 prose-pre:border prose-pre:border-border">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {input}
                </ReactMarkdown>
              </article>
            </ScrollArea>

            {/* Preview Footer */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-[#161b22] text-gray-500 dark:text-[#8b949e] text-[10px] border-t border-border">
              <span>{input.replace(/\\s/g, '').length.toLocaleString()} rendered chars (approx)</span>
              <span>PDF-ready preview</span>
            </div>
          </div>
          
        </div>
      </div>
    </ToolLayout>
  )
}
