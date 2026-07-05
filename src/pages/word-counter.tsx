import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"

export default function WordCounterTool() {
  const [text, setText, clearText] = usePersist("tools-word-counter", "")

  const chars = text.length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0
  const noSpaces = text.replace(/\s/g, "").length

  return (
    <ToolLayout 
      title="Word Counter" 
      description="Count characters, words, sentences, and paragraphs in your text with real-time statistics."
      onClear={clearText}
    >
      <div className="flex flex-col gap-6 h-full">
        <Textarea
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 min-h-[300px] resize-none p-4 text-base"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Characters" value={chars} />
          <StatBox label="Words" value={words} />
          <StatBox label="Lines" value={lines} />
          <StatBox label="Without Spaces" value={noSpaces} />
        </div>
      </div>
    </ToolLayout>
  )
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col p-4 bg-muted rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground mb-1">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  )
}
