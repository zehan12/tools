import { useState } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function JsonFormatterTool() {
  const [input, setInput, clearInput] = usePersist("tools-json-formatter", "")
  const [indent, setIndent] = useState<number>(2)

  let output = ""
  try {
    if (input.trim()) {
      const parsed = JSON.parse(input)
      output = JSON.stringify(parsed, null, indent)
    }
  } catch (e: any) {
    output = `Invalid JSON:\n${e.message}`
  }

  return (
    <ToolLayout 
      title="JSON Formatter" 
      description="Format and prettify your JSON data instantly in your browser."
      onClear={clearInput}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center gap-2">
          <Label>Indent:</Label>
          <Button variant={indent === 2 ? "default" : "outline"} size="sm" onClick={() => setIndent(2)}>2 Spaces</Button>
          <Button variant={indent === 4 ? "default" : "outline"} size="sm" onClick={() => setIndent(4)}>4 Spaces</Button>
          <Button variant={indent === 0 ? "default" : "outline"} size="sm" onClick={() => setIndent(0)}>Minify</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[400px]">
          <div className="flex flex-col gap-2 h-full">
            <Label htmlFor="input-json">Raw JSON</Label>
            <Textarea
              id="input-json"
              placeholder='{"hello": "world"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 resize-none font-mono"
            />
          </div>
          <div className="flex flex-col gap-2 h-full">
            <Label htmlFor="output-json">Formatted Output</Label>
            <Textarea
              id="output-json"
              readOnly
              value={output}
              className={`flex-1 resize-none bg-muted font-mono whitespace-pre ${output.startsWith("Invalid") ? "text-destructive" : ""}`}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
