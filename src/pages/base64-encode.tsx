import { ToolLayout } from "@/components/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function Base64EncodeTool() {
  const [input, setInput, clearInput] = usePersist("tools-base64-encode", "")

  let output = ""
  try {
    output = btoa(input)
  } catch (e) {
    output = "Error encoding input"
  }

  return (
    <ToolLayout 
      title="Base64 Encoder" 
      description="Encode strings to Base64 format quickly and easily in your browser."
      onClear={clearInput}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grow min-h-[400px]">
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="input-text">Input Text</Label>
          <Textarea
            id="input-text"
            placeholder="Type text to encode..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none font-mono"
          />
        </div>
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="output-text">Base64 Output</Label>
          <Textarea
            id="output-text"
            readOnly
            value={output}
            className="flex-1 resize-none bg-muted font-mono"
          />
        </div>
      </div>
    </ToolLayout>
  )
}
