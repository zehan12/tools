import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function Base64DecoderTool() {
  const { t } = useTranslation()
  const [input, setInput, clearInput] = usePersist("tools-base64-decode", "")

  let output = ""
  try {
    output = input ? atob(input) : ""
  } catch (e) {
    output = t('tools.base64.error', "Error decoding input: Invalid Base64")
  }

  return (
    <ToolLayout 
      title="Base64 Decoder" 
      description="Decode Base64 encoded strings quickly and easily in your browser."
      onClear={clearInput}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grow min-h-[400px]">
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="input-text">{t('tools.base64.inputLabel', "Base64 Input")}</Label>
          <Textarea
            id="input-text"
            placeholder={t('tools.base64.inputPlaceholder', "Paste Base64 to decode...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none font-mono"
          />
        </div>
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="output-text">{t('tools.base64.outputLabel', "Decoded Output")}</Label>
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
