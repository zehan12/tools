import { useState, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/common/ToolLayout'
import { UploadCloud, Copy, Image as ImageIcon, Trash2, Palette, Camera, Link as LinkIcon, Maximize, Minimize, Pipette, Undo2, Redo2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { RGB, ColorMood } from '@/utils/color'
import { rgbToHex, hexToRgb, getContrastColorRGB, extractColors, hexToHsl } from '@/utils/color'



export default function ImageColorExtractor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [palette, setPalette] = useState<RGB[]>([])
  const [dominant, setDominant] = useState<RGB | null>(null)
  
  const [historyState, setHistoryState] = useState<{ past: { palette: RGB[], dominant: RGB | null }[], current: { palette: RGB[], dominant: RGB | null } | null, future: { palette: RGB[], dominant: RGB | null }[] }>({ past: [], current: null, future: [] })
  
  const imgRef = useRef<HTMLImageElement>(null)

  const [inputMode, setInputMode] = useState<'upload' | 'url' | 'camera'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [cameraImageSrc, setCameraImageSrc] = useState<string | null>(null)
  
  const [showMagnifierTooltip, setShowMagnifierTooltip] = useState(true)
  const [hasHovered, setHasHovered] = useState(false)

  const [shapeOption, setShapeOption] = useState<'square' | 'rounded' | 'circle'>('square')
  const [colorMood, setColorMood] = useState<ColorMood>('None')
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const magnifierRef = useRef<HTMLDivElement>(null)
  const magCanvasRef = useRef<HTMLCanvasElement>(null)

  // Auto-start camera when entering camera mode
  useEffect(() => {
    if (inputMode === 'camera' && !imageSrc && !cameraImageSrc && !isCameraActive) {
      let mounted = true
      const timer = setTimeout(() => {
        if (mounted) startCamera()
      }, 100)
      return () => {
        mounted = false
        clearTimeout(timer)
      }
    }
  }, [inputMode, imageSrc, cameraImageSrc, isCameraActive])

  // Clean up camera on unmount or when mode changes
  useEffect(() => {
    if (inputMode !== 'camera') {
      stopCamera()
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
      setCountdown(null)
      setCameraImageSrc(null)
    }
    return () => {
      stopCamera()
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [inputMode])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraActive(true)
    } catch (err) {
      toast.error("Could not access camera.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const startCountdown = () => {
    setCountdown(3)
    let count = 3
    countdownIntervalRef.current = setInterval(() => {
      count -= 1
      if (count > 0) {
        setCountdown(count)
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
        setCountdown(null)
        capturePhoto()
      }
    }, 1000)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(videoRef.current, 0, 0)
        setCameraImageSrc(canvas.toDataURL('image/jpeg'))
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCameraImageSrc(null)
    startCamera()
  }

  const setNewImageSrc = (src: string | null) => {
    setImageSrc(src)
    setHistoryState({ past: [], current: null, future: [] })
  }

  const usePhoto = () => {
    if (cameraImageSrc) {
      setNewImageSrc(cameraImageSrc)
      setCameraImageSrc(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewImageSrc(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateColors = (newDominant: RGB | null, newPalette: RGB[]) => {
    setDominant(newDominant)
    setPalette(newPalette)
    setHistoryState(prev => {
      if (prev.current && JSON.stringify(prev.current.palette) === JSON.stringify(newPalette) && JSON.stringify(prev.current.dominant) === JSON.stringify(newDominant)) {
        return prev
      }
      const newPast = prev.current ? [...prev.past, prev.current].slice(-50) : prev.past
      return { past: newPast, current: { palette: newPalette, dominant: newDominant }, future: [] }
    })
  }

  const handleUndo = () => {
    if (historyState.past.length === 0) return
    const newPast = [...historyState.past]
    const previous = newPast.pop()!
    const newFuture = historyState.current ? [historyState.current, ...historyState.future] : historyState.future
    
    setDominant(previous.dominant)
    setPalette(previous.palette)
    setHistoryState({ past: newPast, current: previous, future: newFuture })
  }

  const handleRedo = () => {
    if (historyState.future.length === 0) return
    const newFuture = [...historyState.future]
    const next = newFuture.shift()!
    const newPast = historyState.current ? [...historyState.past, historyState.current] : historyState.past
    
    setDominant(next.dominant)
    setPalette(next.palette)
    setHistoryState({ past: newPast, current: next, future: newFuture })
  }

  const processImage = () => {
    if (imgRef.current && imageSrc) {
      try {
        const colors = extractColors(imgRef.current, 8, colorMood)
        if (colors.length > 0) {
          updateColors(colors[0], colors)
        } else {
          updateColors(null, [])
          toast.error(`Could not find any ${colorMood !== 'None' ? colorMood.toLowerCase() + ' ' : ''}colors in this image.`)
        }
      } catch (e) {
        toast.error("Failed to extract colors.")
      }
    }
  }

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imageSrc) {
      processImage()
    }
  }, [colorMood, imageSrc])

  const handleImageLoad = () => {
    processImage()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${text}`)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!hasHovered) {
      setHasHovered(true)
      setTimeout(() => setShowMagnifierTooltip(false), 3000)
    }

    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    const scaleX = img.naturalWidth / rect.width
    const scaleY = img.naturalHeight / rect.height
    
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top
    const natX = clientX * scaleX
    const natY = clientY * scaleY
    
    if (magnifierRef.current) {
      magnifierRef.current.style.display = 'block'
      magnifierRef.current.style.left = `${e.clientX - 75}px`
      magnifierRef.current.style.top = `${e.clientY - 75}px`
    }

    if (magCanvasRef.current) {
      const ctx = magCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, 150, 150)
        const sourceSize = 15 // 10x zoom (150/15)
        ctx.drawImage(
          img,
          natX - sourceSize / 2, natY - sourceSize / 2, sourceSize, sourceSize,
          0, 0, 150, 150
        )
      }
    }
  }

  const handleMouseLeave = () => {
    if (magnifierRef.current) {
      magnifierRef.current.style.display = 'none'
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current
    if (!img) return

    try {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      const rect = img.getBoundingClientRect()
      const scaleX = img.naturalWidth / rect.width
      const scaleY = img.naturalHeight / rect.height

      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const pixel = ctx.getImageData(x, y, 1, 1).data

      const rgb = { r: pixel[0], g: pixel[1], b: pixel[2] }
      
      const newPalette = [rgb, ...palette.filter(c => c.r !== rgb.r || c.g !== rgb.g || c.b !== rgb.b)].slice(0, 8)
      updateColors(rgb, newPalette)
      toast.success(`Picked color ${rgbToHex(rgb.r, rgb.g, rgb.b)}`)
    } catch (err) {
      toast.error("Could not pick color from this image due to CORS restrictions.")
    }
  }

  return (
    <ToolLayout
      title="Image Color Extractor"
      description="Extract dominant colors and a color palette from any image."
      maxWidth="w-full"
    >
      <div className="flex flex-col grow gap-4 h-full min-h-0">
        {!imageSrc ? (
          <div className="flex flex-col grow min-h-0">
            <div className="flex justify-start mb-2 shrink-0">
              <div className="inline-flex outline outline-border">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${inputMode === 'upload' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setInputMode('url')}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${inputMode === 'url' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
                >
                  URL
                </button>
                <button
                  onClick={() => setInputMode('camera')}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${inputMode === 'camera' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
                >
                  Camera
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 max-h-[calc(100vh-170px)] outline outline-border bg-white dark:bg-[#111]">
              {inputMode === 'upload' && (
                <div className="relative flex-1 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 mb-4 outline outline-border">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider">Click or drag image here</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">Supports PNG, JPG, WEBP</p>
                </div>
              )}

              {inputMode === 'url' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-xl flex flex-col gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 mb-2 self-center outline outline-border">
                      <LinkIcon className="w-8 h-8" />
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Paste image URL here..."
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && urlInput) {
                            setNewImageSrc(urlInput)
                          }
                        }}
                        className="w-full px-4 py-3 font-mono text-sm outline outline-border focus:outline-ring/50 transition-colors bg-white dark:bg-[#111] dark:text-gray-100"
                        spellCheck={false}
                      />
                    </div>
                    <button
                      onClick={() => urlInput && setNewImageSrc(urlInput)}
                      disabled={!urlInput}
                      className="w-full py-3 font-mono text-sm uppercase tracking-wider bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 outline outline-border hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Load Image
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2 font-mono">
                      Note: Some servers block cross-origin image requests.
                    </p>
                  </div>
                </div>
              )}

              {inputMode === 'camera' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden min-h-0">
                    {!cameraImageSrc ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline className={cn("w-full h-full object-cover scale-x-[-1]", !isCameraActive && "hidden")} />
                        {countdown !== null && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                            <span className="text-white text-[10rem] sm:text-[12rem] font-normal leading-none">{countdown}</span>
                          </div>
                        )}
                        {!isCameraActive && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400">
                            <Camera className="w-12 h-12 opacity-50" />
                            <button
                              onClick={startCamera}
                              className="px-6 py-2 font-mono text-sm uppercase tracking-wider bg-gray-800 text-white outline outline-gray-700 hover:bg-gray-700 transition-colors"
                            >
                              Enable Camera
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <img src={cameraImageSrc} alt="Captured" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {isCameraActive && !cameraImageSrc && (
                    <div className="p-4 bg-white dark:bg-[#111] border-t border-border shrink-0">
                      <button
                        onClick={startCountdown}
                        disabled={countdown !== null}
                        className="w-full py-3 font-mono text-sm uppercase tracking-wider bg-[#2563eb] text-white hover:bg-[#1d4ed8] outline outline-[#1e40af] disabled:opacity-50 transition-colors"
                      >
                        {countdown !== null ? 'Taking...' : 'Take Photo'}
                      </button>
                    </div>
                  )}
                  {cameraImageSrc && (
                    <div className="p-4 bg-white dark:bg-[#111] border-t border-border flex gap-4 shrink-0">
                      <button
                        onClick={retakePhoto}
                        className="flex-1 py-3 font-mono text-sm uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 outline outline-border transition-colors"
                      >
                        Retake
                      </button>
                      <button
                        onClick={usePhoto}
                        className="flex-1 py-3 font-mono text-sm uppercase tracking-wider bg-[#2563eb] text-white hover:bg-[#1d4ed8] outline outline-[#1e40af] transition-colors"
                      >
                        Use this photo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row grow overflow-hidden gap-6 min-h-0">
            {/* Image Preview Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
              <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 justify-end">
                <div className="h-9 bg-white/90 dark:bg-[#111]/90 backdrop-blur outline outline-border px-3 flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">Color mood</span>
                  <Select value={colorMood} onValueChange={(value) => setColorMood(value as ColorMood)}>
                    <SelectTrigger className="h-7 border-none shadow-none bg-transparent focus:ring-0 px-2 py-0 text-xs font-mono w-24">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Colorful">Colorful</SelectItem>
                      <SelectItem value="Bright">Bright</SelectItem>
                      <SelectItem value="Muted">Muted</SelectItem>
                      <SelectItem value="Deep">Deep</SelectItem>
                      <SelectItem value="Dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <TooltipProvider>
                  <div className="h-9 bg-white/90 dark:bg-[#111]/90 backdrop-blur outline outline-border flex items-center">
                    <Tooltip>
                      <TooltipTrigger 
                        onClick={handleUndo}
                        disabled={historyState.past.length === 0}
                        className="h-full px-3 border-r border-border hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <Undo2 className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Undo</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger 
                        onClick={handleRedo}
                        disabled={historyState.future.length === 0}
                        className="h-full px-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <Redo2 className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Redo</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={async () => {
                        // @ts-ignore
                        if (typeof window === 'undefined' || !window.EyeDropper) {
                          toast.error("Your browser doesn't support the native EyeDropper API. You can still click anywhere on the image to pick a color!")
                          return
                        }
                        try {
                          // @ts-ignore
                          const eyeDropper = new window.EyeDropper()
                          const result = await eyeDropper.open()
                          const rgb = hexToRgb(result.sRGBHex)
                          if (rgb) {
                            const newPalette = [rgb, ...palette.filter(c => c.r !== rgb.r || c.g !== rgb.g || c.b !== rgb.b)].slice(0, 8)
                            updateColors(rgb, newPalette)
                            toast.success(`Picked color ${result.sRGBHex}`)
                          }
                        } catch (e) {
                          // User canceled
                        }
                      }}
                      className="h-9 bg-white/90 dark:bg-[#111]/90 hover:bg-white dark:hover:bg-[#111] backdrop-blur text-gray-900 dark:text-gray-100 outline outline-border px-3 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <Pipette className="w-4 h-4" /> <span className="hidden sm:inline">Pick Color</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use eyedropper</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <label className="h-9 bg-white/90 dark:bg-[#111]/90 hover:bg-white dark:hover:bg-[#111] backdrop-blur text-gray-900 dark:text-gray-100 outline outline-border px-3 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <UploadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Change Image</span>
                </label>
                
                <button
                  onClick={() => { setNewImageSrc(null); setPalette([]); setDominant(null) }}
                  className="h-9 bg-red-500/90 hover:bg-red-500 text-white backdrop-blur outline outline-red-600 px-3 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-[#1a1a1a] overflow-auto relative">
                <div className="relative inline-block max-w-full max-h-full">
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                    onClick={handleImageClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="max-w-full max-h-[60vh] object-contain cursor-none block"
                    title=""
                    alt="Extracted preview"
                  />
                  
                  {/* Magnifier Picker Wrapper */}
                  <div 
                    ref={magnifierRef}
                    className="fixed pointer-events-none z-50"
                    style={{
                      width: 150,
                      height: 150,
                      display: 'none',
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-black shadow-2xl bg-black relative">
                      <canvas 
                        ref={magCanvasRef}
                        width={150} 
                        height={150} 
                        className="w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[15px] h-[15px] border border-white/50 relative">
                          <div className="absolute top-1/2 left-[-6px] right-[-6px] h-[1px] bg-white" />
                          <div className="absolute left-1/2 top-[-6px] bottom-[-6px] w-[1px] bg-white" />
                        </div>
                      </div>
                    </div>
                    {showMagnifierTooltip && (
                      <div className="absolute top-[85px] left-[85px] whitespace-nowrap bg-popover/80 backdrop-blur-md text-popover-foreground border border-border px-3 py-1.5 text-[11px] rounded-md z-50 shadow-md animate-in fade-in-50 zoom-in-95">
                        Click anywhere to pick a color
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Colors Area */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4 overflow-y-auto">
              <div className="outline outline-border bg-white dark:bg-[#111] p-4 flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Palette className="w-4 h-4 text-primary" /> Dominant Color
                    </h3>
                    <button
                      onClick={() => {
                        if (shapeOption === 'square') setShapeOption('rounded')
                        else if (shapeOption === 'rounded') setShapeOption('circle')
                        else setShapeOption('square')
                      }}
                      className="px-2 py-1 bg-white hover:bg-muted dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-xs font-mono uppercase tracking-wider outline outline-1 outline-border transition-colors text-muted-foreground flex items-center gap-2 capitalize"
                      title="Toggle shape"
                    >
                      {shapeOption}
                    </button>
                  </div>
                  {dominant ? (
                    <div className="flex flex-col gap-4">
                      <div
                        onClick={() => copyToClipboard(rgbToHex(dominant.r, dominant.g, dominant.b))}
                        className={cn(
                          "h-24 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm group outline outline-1 outline-border/10",
                          shapeOption === 'rounded' ? "rounded-2xl" : shapeOption === 'circle' ? "rounded-full" : "rounded-none",
                          getContrastColorRGB(dominant.r, dominant.g, dominant.b)
                        )}
                        style={{ backgroundColor: rgbToHex(dominant.r, dominant.g, dominant.b) }}
                      >
                        <span className="font-bold text-lg tracking-wide">{rgbToHex(dominant.r, dominant.g, dominant.b)}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs mt-1 flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Click to copy
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* HEX Row */}
                        <div className="flex border rounded-2xl overflow-hidden outline outline-1 outline-border/10">
                          <div className="w-20 px-4 py-3 bg-white dark:bg-[#1a1a1a] border-r flex items-center text-gray-500 font-medium text-sm tracking-wide">HEX</div>
                          <div className="flex-1 px-4 py-3 bg-white dark:bg-[#1a1a1a] flex justify-between items-center text-sm font-mono text-gray-800 dark:text-gray-200">
                            <span>{rgbToHex(dominant.r, dominant.g, dominant.b).toLowerCase()}</span>
                            <button onClick={() => copyToClipboard(rgbToHex(dominant.r, dominant.g, dominant.b).toLowerCase())} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Copy className="w-4 h-4" /></button>
                          </div>
                        </div>
                        {/* RGB Row */}
                        <div className="flex border rounded-2xl overflow-hidden outline outline-1 outline-border/10">
                          <div className="w-20 px-4 py-3 bg-white dark:bg-[#1a1a1a] border-r flex items-center text-gray-500 font-medium text-sm tracking-wide">RGB</div>
                          <div className="flex-1 px-4 py-3 bg-white dark:bg-[#1a1a1a] flex justify-between items-center text-sm font-mono text-gray-800 dark:text-gray-200">
                            <span>{`rgba(${dominant.r}, ${dominant.g}, ${dominant.b})`}</span>
                            <button onClick={() => copyToClipboard(`rgba(${dominant.r}, ${dominant.g}, ${dominant.b})`)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Copy className="w-4 h-4" /></button>
                          </div>
                        </div>
                        {/* HSL Row */}
                        <div className="flex border rounded-2xl overflow-hidden outline outline-1 outline-border/10">
                          <div className="w-20 px-4 py-3 bg-white dark:bg-[#1a1a1a] border-r flex items-center text-gray-500 font-medium text-sm tracking-wide">HSL</div>
                          <div className="flex-1 px-4 py-3 bg-white dark:bg-[#1a1a1a] flex justify-between items-center text-sm font-mono text-gray-800 dark:text-gray-200">
                            <span>{(() => {
                              const hsl = hexToHsl(rgbToHex(dominant.r, dominant.g, dominant.b));
                              return `${Math.round(hsl.h)}, ${Math.round(hsl.s)}, ${Math.round(hsl.l)}`;
                            })()}</span>
                            <button onClick={() => {
                              const hsl = hexToHsl(rgbToHex(dominant.r, dominant.g, dominant.b));
                              copyToClipboard(`${Math.round(hsl.h)}, ${Math.round(hsl.s)}, ${Math.round(hsl.l)}`);
                            }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Copy className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "h-24 bg-muted flex items-center justify-center text-sm text-muted-foreground animate-pulse outline outline-1 outline-border/10",
                      shapeOption === 'rounded' ? "rounded-2xl" : shapeOption === 'circle' ? "rounded-full" : "rounded-none"
                    )}>
                      Analyzing...
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-border my-2" />

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                    <ImageIcon className="w-4 h-4" /> Color Palette
                  </h3>
                  {palette.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {palette.map((color, i) => (
                        <div
                          key={i}
                          onClick={() => copyToClipboard(rgbToHex(color.r, color.g, color.b))}
                          className={cn(
                            "aspect-square flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.05] active:scale-[0.95] shadow-sm relative group outline outline-1 outline-border/10 overflow-hidden",
                            shapeOption === 'rounded' ? "rounded-xl" : shapeOption === 'circle' ? "rounded-full" : "rounded-none",
                            getContrastColorRGB(color.r, color.g, color.b)
                          )}
                          style={{ backgroundColor: rgbToHex(color.r, color.g, color.b) }}
                        >
                          <span className={cn(
                            "font-semibold text-[10px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]",
                            shapeOption === 'circle' && "rounded-full"
                          )}>
                            {rgbToHex(color.r, color.g, color.b)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={cn(
                          "aspect-square bg-muted animate-pulse outline outline-1 outline-border/10",
                          shapeOption === 'rounded' ? "rounded-xl" : shapeOption === 'circle' ? "rounded-full" : "rounded-none"
                        )} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

