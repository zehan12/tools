import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parse, formatHex, formatRgb, formatHsl } from "culori"

export default function ColorTool() {
  const [input, setInput, clearInput] = usePersist("tools-color-input", "#aa3bff")
  
  const [hex, setHex] = useState("")
  const [rgb, setRgb] = useState("")
  const [hsl, setHsl] = useState("")
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (!input.trim()) {
      setIsValid(true)
      setHex("")
      setRgb("")
      setHsl("")
      return
    }

    const parsed = parse(input)
    if (parsed) {
      setIsValid(true)
      setHex(formatHex(parsed) || "")
      setRgb(formatRgb(parsed) || "")
      
      const parsedHsl = parse(formatHsl(parsed) || "")
      if (parsedHsl && parsedHsl.mode === 'hsl') {
        const h = Math.round(parsedHsl.h || 0)
        const s = Math.round((parsedHsl.s || 0) * 100)
        const l = Math.round((parsedHsl.l || 0) * 100)
        const alpha = parsedHsl.alpha !== undefined && parsedHsl.alpha < 1 ? ` / ${parsedHsl.alpha}` : ""
        setHsl(`hsl(${h} ${s}% ${l}%${alpha})`)
      }
    } else {
      setIsValid(false)
    }
  }, [input])

  return (
    <ToolLayout 
      title="Color Converter" 
      description="Convert colors between different formats (HEX, RGB, HSL, etc.) with a live preview."
      onClear={clearInput}
    >
      <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto mt-8">
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="color-input">Color Input</Label>
            <Input
              id="color-input"
              placeholder="#FFFFFF, rgb(255, 255, 255), red..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={isValid ? "" : "border-destructive"}
            />
            {!isValid && <span className="text-xs text-destructive">Invalid color format</span>}
          </div>

          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">HEX</Label>
              <Input readOnly value={hex} className="font-mono bg-muted" onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">RGB</Label>
              <Input readOnly value={rgb} className="font-mono bg-muted" onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">HSL</Label>
              <Input readOnly value={hsl} className="font-mono bg-muted" onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col gap-2">
          <Label>Live Preview</Label>
          <div 
            className="flex-1 rounded-xl border shadow-inner min-h-[300px] flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: isValid ? hex : 'transparent' }}
          >
            {!isValid && <span className="text-muted-foreground">Invalid Color</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
