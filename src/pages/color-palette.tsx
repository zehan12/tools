import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/common/ToolLayout'
import { Lock, Unlock, Copy, X, Settings2, Download, Palette, RefreshCcw, LayoutGrid, RotateCcw, Undo2, Redo2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { generatePleasingColor, hexToRgb, hexToHsl, generateShades, getContrastColor, getIconContrastClass } from '@/utils/color'

type Color = {
  id: string
  hex: string
  locked: boolean
}



export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState<Color[]>([])
  const [viewingShades, setViewingShades] = useState<string | null>(null)
  const [history, setHistory] = useState<Color[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const generateColors = useCallback(() => {
    let newColors;
    if (colors.length === 0) {
      newColors = Array.from({ length: 5 }).map(() => ({
        id: Math.random().toString(36).substring(7),
        hex: generatePleasingColor(),
        locked: false
      }))
    } else {
      newColors = colors.map(c => c.locked ? c : { ...c, hex: generatePleasingColor() })
    }
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newColors);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setColors(newColors);
  }, [colors, history, historyIndex])

  const resetPalette = useCallback(() => {
    const newColors = Array.from({ length: 5 }).map(() => ({
      id: Math.random().toString(36).substring(7),
      hex: generatePleasingColor(),
      locked: false
    }))
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newColors);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setColors(newColors);
  }, [history, historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setColors(history[historyIndex - 1]);
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setColors(history[historyIndex + 1]);
    }
  }

  useEffect(() => {
    if (history.length === 0) {
      generateColors()
    }
  }, []) // Intentionally run only once on mount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement
        const tag = target.tagName?.toLowerCase()
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault()
          if (!viewingShades) {
            generateColors()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [generateColors])

  const toggleLock = (id: string) => {
    setColors(prev => {
      const newColors = prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c)
      setHistory(h => {
        const newH = [...h];
        if (newH[historyIndex]) {
          newH[historyIndex] = newColors;
        }
        return newH;
      })
      return newColors
    })
  }

  const removeColor = (id: string) => {
    if (colors.length <= 2) {
      toast.error("You need at least 2 colors")
      return
    }
    setColors(prev => {
      const next = prev.filter(c => c.id !== id)
      setHistory(h => {
        const newH = h.slice(0, historyIndex + 1);
        return [...newH, next];
      })
      setHistoryIndex(prevIdx => prevIdx + 1)
      return next
    })
  }

  const addColor = () => {
    if (colors.length >= 10) {
      toast.error("Maximum 10 colors allowed")
      return
    }
    const newColor = {
      id: Math.random().toString(36).substring(7),
      hex: generatePleasingColor(),
      locked: false
    }
    setColors(prev => {
      const next = [...prev, newColor]
      setHistory(h => {
        const newH = h.slice(0, historyIndex + 1);
        return [...newH, next];
      })
      setHistoryIndex(prevIdx => prevIdx + 1)
      return next
    })
  }

  const removeLastColor = () => {
    if (colors.length <= 2) {
      toast.error("You need at least 2 colors")
      return
    }
    setColors(prev => {
      const next = prev.slice(0, -1)
      setHistory(h => {
        const newH = h.slice(0, historyIndex + 1);
        return [...newH, next];
      })
      setHistoryIndex(prevIdx => prevIdx + 1)
      return next
    })
  }

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    toast.success(`Copied #${hex} to clipboard`)
  }

  const exportPalette = () => {
    const paletteText = colors.map(c => `#${c.hex}`).join(', ')
    navigator.clipboard.writeText(paletteText)
    toast.success("Palette copied to clipboard!")
  }

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Press the spacebar to generate beautiful color palettes!"
    >
      <div className="flex flex-col grow rounded-lg overflow-hidden border bg-background font-sans shadow-sm min-h-[500px]">
        {/* Top bar */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <kbd className="px-2 py-1 bg-background border rounded-md shadow-sm text-xs font-mono">Spacebar</kbd> 
            <span>to generate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2 border-r pr-2">
              <Button variant="ghost" size="icon" className="w-8 h-8" disabled={historyIndex <= 0} onClick={undo} title="Undo">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" disabled={historyIndex >= history.length - 1} onClick={redo} title="Redo">
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 mr-2 border-r pr-2 h-8">
              <Button variant="ghost" size="icon" className="w-8 h-8" disabled={colors.length <= 2} onClick={removeLastColor} title="Remove Color">
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs font-medium w-4 text-center">{colors.length}</span>
              <Button variant="ghost" size="icon" className="w-8 h-8" disabled={colors.length >= 10} onClick={addColor} title="Add Color">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={resetPalette} className="h-8 gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button variant="outline" size="sm" onClick={generateColors} className="h-8 gap-2">
              <RefreshCcw className="w-4 h-4" /> Generate
            </Button>
            <Button variant="default" size="sm" onClick={exportPalette} className="h-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* Color Columns */}
        <div className="flex-1 flex flex-col md:flex-row w-full h-full relative group/board">
          {colors.map((color, index) => {
            const rgb = hexToRgb(color.hex)
            const contrastClass = getContrastColor(color.hex)
            const iconClass = getIconContrastClass(color.hex)
            
            return (
              <div 
                key={color.id} 
                className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out group min-h-[120px]"
                style={{ backgroundColor: `#${color.hex}` }}
              >
                {viewingShades === color.id ? (
                  <div className="absolute inset-0 z-20 flex flex-col cursor-crosshair">
                    {generateShades(color.hex, 25).map((shade, i) => {
                      const isOriginal = shade.toUpperCase() === color.hex.toUpperCase() || 
                                       (i > 0 && i < 24 && Math.abs(hexToHsl(shade).l - hexToHsl(color.hex).l) < 2);
                      const isDarkText = getContrastColor(shade).includes('text-black');
                      return (
                        <div 
                          key={i} 
                          className="flex-1 w-full relative group/shade flex items-center justify-center transition-colors hover:scale-x-110 z-10 hover:z-20 hover:shadow-lg"
                          style={{ backgroundColor: `#${shade}` }}
                          onClick={(e) => {
                             e.stopPropagation();
                             copyToClipboard(shade);
                          }}
                        >
                           {isOriginal && <div className="w-1.5 h-1.5 rounded-full absolute left-1/2 -translate-x-1/2 shadow-sm" style={{ backgroundColor: isDarkText ? '#000' : '#fff' }} />}
                           <span className="opacity-0 group-hover/shade:opacity-100 font-bold text-[10px] sm:text-xs tracking-wider absolute uppercase" style={{ color: isDarkText ? '#000' : '#fff' }}>
                             {shade}
                           </span>
                        </div>
                      )
                    })}
                    <button onClick={(e) => { e.stopPropagation(); setViewingShades(null) }} className="absolute top-4 right-1/2 translate-x-1/2 md:translate-x-0 md:right-4 z-30 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 backdrop-blur-sm transition-colors shadow-sm">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}

                {/* Tools - shown on hover */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden md:flex">
                  <button onClick={() => removeColor(color.id)} className={cn("p-2 rounded-lg transition-colors", iconClass)} title="Remove color"><X className="w-5 h-5" /></button>
                  <button onClick={() => setViewingShades(color.id)} className={cn("p-2 rounded-lg transition-colors", iconClass)} title="View shades"><LayoutGrid className="w-5 h-5" /></button>
                  <button onClick={() => copyToClipboard(color.hex)} className={cn("p-2 rounded-lg transition-colors", iconClass)} title="Copy hex"><Copy className="w-5 h-5" /></button>
                  <button onClick={() => toggleLock(color.id)} className={cn("p-2 rounded-lg transition-colors", iconClass)} title={color.locked ? "Unlock color" : "Lock color"}>
                    {color.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Mobile tools */}
                <div className="absolute inset-y-0 right-4 flex flex-col justify-center gap-3 md:hidden z-10">
                  <button onClick={() => setViewingShades(color.id)} className={cn("p-1.5 rounded-md bg-black/10", contrastClass)}><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => copyToClipboard(color.hex)} className={cn("p-1.5 rounded-md bg-black/10", contrastClass)}><Copy className="w-4 h-4" /></button>
                  <button onClick={() => toggleLock(color.id)} className={cn("p-1.5 rounded-md bg-black/10", contrastClass)}>{color.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
                </div>

                {/* Hex Code */}
                <div className="mt-auto mb-8 md:mb-16 text-center z-10 relative">
                  <button 
                    onClick={() => copyToClipboard(color.hex)}
                    className={cn(
                      "text-xl md:text-3xl font-bold tracking-wider uppercase transition-colors select-none",
                      contrastClass
                    )}
                  >
                    {color.hex}
                  </button>
                  {rgb && (
                    <div className={cn("text-xs md:text-sm mt-2 opacity-70 font-medium select-none", contrastClass)}>
                      RGB {rgb.r}, {rgb.g}, {rgb.b}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}
