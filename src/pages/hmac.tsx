import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HmacTool() {
  const [text, setText] = usePersist("tools-hmac-text", "")
  const [secret, setSecret] = usePersist("tools-hmac-secret", "")
  const [algo, setAlgo] = usePersist("tools-hmac-algo", "SHA-256")
  const [output, setOutput] = useState("")

  useEffect(() => {
    async function computeHmac() {
      if (!text || !secret) {
        setOutput("")
        return
      }
      try {
        const enc = new TextEncoder()
        const key = await window.crypto.subtle.importKey(
          "raw",
          enc.encode(secret),
          { name: "HMAC", hash: algo },
          false,
          ["sign"]
        )
        const signature = await window.crypto.subtle.sign("HMAC", key, enc.encode(text))
        const hashArray = Array.from(new Uint8Array(signature))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        setOutput(hashHex)
      } catch (e) {
        setOutput("Error generating HMAC")
      }
    }
    computeHmac()
  }, [text, secret, algo])

  const clearAll = () => {
    setText("")
    setSecret("")
    setOutput("")
  }

  return (
    <ToolLayout 
      title="HMAC Generator" 
      description="Generate a Hash-based Message Authentication Code (HMAC) to verify message integrity and authenticity using your secret key."
      onClear={clearAll}
    >
      <div className="flex flex-col md:flex-row gap-6 grow min-h-[500px]">
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="input-text">Message String</Label>
            <Textarea
              id="input-text"
              placeholder="Enter message to hash..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="resize-none font-mono grow min-h-[8rem]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              placeholder="Enter secret key..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Hash Algorithm</Label>
            <Select value={algo} onValueChange={(val: any) => setAlgo(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHA-1">SHA-1 (Insecure)</SelectItem>
                <SelectItem value="SHA-256">SHA-256</SelectItem>
                <SelectItem value="SHA-384">SHA-384</SelectItem>
                <SelectItem value="SHA-512">SHA-512</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <Label htmlFor="hmac-output">HMAC Result (Hex)</Label>
          <Textarea
            id="hmac-output"
            readOnly
            value={output}
            className="flex-1 resize-none bg-muted font-mono break-all text-primary"
            placeholder="Result will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  )
}
