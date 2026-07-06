import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as Diff from "diff"
import { cn } from "@/lib/utils"

export default function DiffTool() {
  const { t } = useTranslation()
  const [oldText, setOldText] = usePersist("tools-diff-old", "Hello world\nThis is a test\nGoodbye")
  const [newText, setNewText] = usePersist("tools-diff-new", "Hello world!\nThis is a test\nHello")
  const [mode, setMode] = useState<"chars" | "words" | "lines">("lines")

  const clear = () => {
    setOldText("")
    setNewText("")
  }

  let diffResult: Diff.Change[] = []
  if (mode === "chars") {
    diffResult = Diff.diffChars(oldText, newText)
  } else if (mode === "words") {
    diffResult = Diff.diffWords(oldText, newText)
  } else {
    diffResult = Diff.diffLines(oldText, newText)
  }

  return (
    <ToolLayout 
      title="Text Diff" 
      description="Compare two texts and see their differences highlighted, with support for character, word, and line-based diffing."
      onClear={clear}
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex flex-col gap-2">
          <Label>{t('tools.diff.mode', "Diff Mode")}</Label>
          <div className="w-48">
            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chars">{t('tools.diff.chars', "Characters")}</SelectItem>
                <SelectItem value="words">{t('tools.diff.words', "Words")}</SelectItem>
                <SelectItem value="lines">{t('tools.diff.lines', "Lines")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 shrink-0">
          <div className="flex flex-col gap-2 h-full">
            <Label>{t('tools.diff.original', "Original Text")}</Label>
            <Textarea
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              className="flex-1 resize-none font-mono"
            />
          </div>
          <div className="flex flex-col gap-2 h-full">
            <Label>{t('tools.diff.modified', "Modified Text")}</Label>
            <Textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1 resize-none font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-[300px]">
          <Label>{t('tools.diff.differenceView', "Difference View")}</Label>
          <div className="flex-1 border rounded-md p-4 bg-card font-mono text-sm whitespace-pre-wrap overflow-auto">
            {diffResult.map((part, index) => (
              <span 
                key={index}
                className={cn(
                  part.added ? "bg-green-500/20 text-green-700 dark:text-green-400" : 
                  part.removed ? "bg-red-500/20 text-red-700 dark:text-red-400 line-through" : 
                  "text-foreground"
                )}
              >
                {part.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
