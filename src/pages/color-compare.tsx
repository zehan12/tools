import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parse, formatHex, differenceCiede2000 } from "culori"

export default function ColorCompareTool() {
  const [color1, setColor1] = usePersist("tools-color-compare-1", "#aa3bff")
  const [color2, setColor2] = usePersist("tools-color-compare-2", "#ff3b3b")
  
  const [hex1, setHex1] = useState("")
  const [hex2, setHex2] = useState("")
  const [diff, setDiff] = useState<number | null>(null)

  useEffect(() => {
    const p1 = parse(color1)
    const p2 = parse(color2)
    
    if (p1 && p2) {
      setHex1(formatHex(p1) || "")
      setHex2(formatHex(p2) || "")
      setDiff(differenceCiede2000()(p1, p2))
    } else {
      setHex1("")
      setHex2("")
      setDiff(null)
    }
  }, [color1, color2])

  const clear = () => {
    setColor1("")
    setColor2("")
  }

  return (
    <ToolLayout 
      title="Color Compare" 
      description="Compare two colors side by side with live swatches and normalized output."
      onClear={clear}
    >
      <div className="flex flex-col gap-8 max-w-4xl mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <Label htmlFor="color-1">Color 1</Label>
            <Input id="color-1" value={color1} onChange={(e) => setColor1(e.target.value)} placeholder="#FFFFFF, red..." />
            <div 
              className="h-48 rounded-xl border shadow-inner transition-colors"
              style={{ backgroundColor: hex1 || 'transparent' }}
            >
              {!hex1 && <div className="h-full flex items-center justify-center text-muted-foreground">Invalid Color</div>}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <Label htmlFor="color-2">Color 2</Label>
            <Input id="color-2" value={color2} onChange={(e) => setColor2(e.target.value)} placeholder="#000000, blue..." />
            <div 
              className="h-48 rounded-xl border shadow-inner transition-colors"
              style={{ backgroundColor: hex2 || 'transparent' }}
            >
              {!hex2 && <div className="h-full flex items-center justify-center text-muted-foreground">Invalid Color</div>}
            </div>
          </div>
        </div>

        {diff !== null && (
          <div className="p-6 bg-card border rounded-xl flex flex-col items-center justify-center gap-2">
            <h3 className="text-lg font-medium text-muted-foreground">CIEDE2000 Difference</h3>
            <div className="text-5xl font-black">{diff.toFixed(4)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {diff < 1 ? "Visually indistinguishable" : diff < 2 ? "Hardly perceptible" : diff < 10 ? "Perceptible at a glance" : "Colors are more similar than opposite"}
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
