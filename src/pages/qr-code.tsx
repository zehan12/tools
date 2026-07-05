import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import QRCode from "qrcode"

export default function QrCodeTool() {
  const [text, setText, clearText] = usePersist("tools-qrcode-text", "https://zehankhan.vercel.app")
  const [dataUrl, setDataUrl] = useState("")

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl("")
      return
    }
    QRCode.toDataURL(text, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } }, (err, url) => {
      if (!err) setDataUrl(url)
    })
  }, [text])

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes from text, URLs, or any data directly in your browser."
      onClear={clearText}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <Label htmlFor="qr-input">Content</Label>
          <Textarea
            id="qr-input"
            placeholder="Enter text or URL..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-64 resize-none"
          />
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <Label>Preview</Label>
          <div className="flex flex-col gap-4 flex-1 items-center justify-center outline outline-border bg-white dark:bg-[#111] p-8 transition-colors">
            {dataUrl ? (
              <>
                <img src={dataUrl} alt="QR Code" className="w-64 h-64 bg-white outline outline-border p-2 rounded-md" />
                <a
                  href={dataUrl}
                  download="qrcode.png"
                  className="mt-4 px-4 py-2 w-64 outline outline-border hover:outline-ring/50 bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 text-sm font-medium uppercase tracking-wider transition-colors text-center"
                >
                  Download PNG
                </a>
              </>
            ) : (
              <div className="text-gray-400 dark:text-gray-600 text-sm uppercase tracking-wider">Type something to generate QR Code</div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
