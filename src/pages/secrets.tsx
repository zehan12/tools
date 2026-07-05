import { useState } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CopyIcon, RefreshCwIcon } from "lucide-react"

export default function SecretsTool() {
  const [length, setLength] = useState<number>(32)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [secret, setSecret] = useState("")

  const generateSecret = () => {
    let charset = ""
    if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (useNumbers) charset += "0123456789"
    if (useSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-="
    
    if (!charset) {
      setSecret("Please select at least one character set.")
      return
    }

    let result = ""
    const randomValues = new Uint32Array(length)
    window.crypto.getRandomValues(randomValues)
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length]
    }
    setSecret(result)
  }

  return (
    <ToolLayout 
      title="Secret Generator" 
      description="Generate cryptographically secure secrets and passwords with configurable length and special characters."
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="p-6 bg-muted rounded-xl border relative group">
          <div className="text-2xl font-mono text-center break-all select-all min-h-[2.5rem]">
            {secret || "Click generate to start"}
          </div>
          {secret && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => navigator.clipboard.writeText(secret)}
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-6 p-6 border rounded-xl">
          <div className="flex flex-col gap-2">
            <Label>Length: {length}</Label>
            <input 
              type="range" 
              min="8" max="128" 
              value={length} 
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="uppercase" checked={useUppercase} onCheckedChange={(c) => setUseUppercase(c as boolean)} />
              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="lowercase" checked={useLowercase} onCheckedChange={(c) => setUseLowercase(c as boolean)} />
              <Label htmlFor="lowercase">Lowercase (a-z)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="numbers" checked={useNumbers} onCheckedChange={(c) => setUseNumbers(c as boolean)} />
              <Label htmlFor="numbers">Numbers (0-9)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="symbols" checked={useSymbols} onCheckedChange={(c) => setUseSymbols(c as boolean)} />
              <Label htmlFor="symbols">Symbols (!@#$)</Label>
            </div>
          </div>
          
          <Button onClick={generateSecret} className="mt-4 w-full flex gap-2">
            <RefreshCwIcon className="w-4 h-4" /> Generate Secret
          </Button>
        </div>
      </div>
    </ToolLayout>
  )
}
