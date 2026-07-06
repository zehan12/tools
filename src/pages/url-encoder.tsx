import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"

export default function UrlEncoderTool() {
  const { t } = useTranslation()
  const [input, setInput, clearInput] = usePersist("tools-url-encode", "")
  const [mode, setMode, clearMode] = usePersist<"encode" | "decode">("tools-url-mode", "encode")

  let output = ""
  try {
    if (mode === "encode") {
      output = encodeURIComponent(input)
    } else {
      output = decodeURIComponent(input)
    }
  } catch (e) {
    output = t('tools.url.error', "Error: Invalid URI component")
  }

  const handleClear = () => {
    clearInput()
  }

  const toggleMode = () => {
    setMode(mode === "encode" ? "decode" : "encode")
    setInput(output && output !== t('tools.url.error', "Error: Invalid URI component") ? output : "")
  }

  return (
    <ToolLayout 
      title="URL Encoder / Decoder" 
      description="Quickly encode or decode URI components and query parameters."
      onClear={handleClear}
    >
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={mode === "encode" ? "default" : "outline"} 
            onClick={() => setMode("encode")}
            className="flex-1 sm:flex-none"
          >
            Encode
          </Button>
          <Button 
            variant={mode === "decode" ? "default" : "outline"} 
            onClick={() => setMode("decode")}
            className="flex-1 sm:flex-none"
          >
            Decode
          </Button>
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleMode} 
            className="hidden sm:flex text-muted-foreground"
            title="Swap and Toggle Mode"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Swap
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grow min-h-[400px]">
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="input-text">
            {mode === "encode" ? "String to Encode" : "URL to Decode"}
          </Label>
          <Textarea
            id="input-text"
            placeholder={mode === "encode" ? "Paste string here..." : "Paste encoded URL here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none font-mono"
          />
        </div>
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="output-text">
            {mode === "encode" ? "Encoded Output" : "Decoded Output"}
          </Label>
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
