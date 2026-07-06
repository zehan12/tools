import { useTheme } from "@/providers/theme-provider"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { SEO } from "@/components/common/SEO"
import { ToolLayout } from "@/components/common/ToolLayout"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize, Undo2 } from "lucide-react"
import { useState } from "react"

export default function WhiteboardTool() {
  const { theme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const content = (
    <div className={isFullscreen ? "fixed inset-0 z-[100] flex flex-col bg-background" : "flex flex-col grow h-[calc(100vh-14rem)] w-full rounded-lg overflow-hidden border border-border shadow-sm relative"}>
      {isFullscreen && <SEO title="Whiteboard" description="A virtual whiteboard for sketching hand-drawn like diagrams." />}

      <div className="flex-1 w-full h-full relative">
        <style>{`
          .excalidraw .layer-ui__wrapper .sidebar-trigger,
          .excalidraw .ToolIcon__library {
            display: none !important;
          }
        `}</style>
        <Excalidraw theme={theme === 'dark' ? 'dark' : 'light'} />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute bottom-6 right-20 z-[101] shadow-lg flex items-center gap-1.5 rounded-full px-3 h-8 text-xs border-border/50 bg-background/50 backdrop-blur-md hover:bg-background/70 transition-all text-foreground"
        >
          {isFullscreen ? <Undo2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
      </div>
    </div>
  )

  if (isFullscreen) {
    return content
  }

  return (
    <ToolLayout
      title="Whiteboard"
      description="A virtual whiteboard for sketching hand-drawn like diagrams."
    >
      {content}
    </ToolLayout>
  )
}
