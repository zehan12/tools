import { ToolLayout } from "@/components/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"

export default function Base64EncodeTool() {
  const [input, setInput, clearInput] = usePersist("tools-base64-encode", "")
  const { t } = useTranslation()

  let output = ""
  try {
    output = btoa(input)
  } catch (e) {
    output = t('common.errorEncoding', 'Error encoding input')
  }

  return (
    <ToolLayout 
      title={t('tools.base64-encode.title', 'Base64 Encoder')} 
      description={t('tools.base64-encode.description', 'Encode strings to Base64 format quickly and easily in your browser.')}
      onClear={clearInput}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 grow min-h-[400px]">
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="input-text">{t('common.inputText', 'Input Text')}</Label>
          <Textarea
            id="input-text"
            placeholder={t('common.typeTextToEncode', 'Type text to encode...')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none font-mono"
          />
        </div>
        <div className="flex flex-col gap-2 h-full">
          <Label htmlFor="output-text">{t('common.base64Output', 'Base64 Output')}</Label>
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
