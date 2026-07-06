import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

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

  return (
    <ToolLayout
      title="Markdown Viewer"
      description="Preview markdown with live rendering, syntax highlighting, and standard GitHub-flavored Markdown support."
      onClear={clearInput}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-14rem)] min-h-[500px]">
          <div className="flex flex-col gap-2 h-full min-h-0">
            <Label htmlFor="input-markdown">{t('tools.markdown-viewer.raw', "Raw Markdown")}</Label>
            <ScrollArea className="flex-1 min-h-0 border outline-border">
              <Textarea
                id="input-markdown"
                placeholder="# Type your markdown here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full min-h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 rounded-none shadow-none"
              />
            </ScrollArea>
          </div>
          <div className="flex flex-col gap-2 h-full min-h-0">
            <Label>{t('tools.markdown-viewer.preview', "Preview")}</Label>
            <ScrollArea className="flex-1 bg-card border rounded-md p-4 lg:p-6 shadow-sm min-h-0">
              <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {input}
                </ReactMarkdown>
              </article>
            </ScrollArea>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
