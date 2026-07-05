import { useState } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CopyIcon } from "lucide-react"

export default function SecretSharingTool() {
  const [secret, setSecret] = useState("")
  const [password, setPassword] = useState("")
  const [encrypted, setEncrypted] = useState("")
  
  const [decryptUrl, setDecryptUrl] = useState("")
  const [decrypted, setDecrypted] = useState("")
  const [decryptPassword, setDecryptPassword] = useState("")
  const [error, setError] = useState("")

  const generateKey = async (pass: string) => {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(pass), { name: "PBKDF2" }, false, ["deriveKey"]
    )
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode("salt"), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    )
  }

  const handleEncrypt = async () => {
    if (!secret || !password) return
    const key = await generateKey(password)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const enc = new TextEncoder()
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, enc.encode(secret)
    )
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    const base64 = btoa(String.fromCharCode(...combined))
    setEncrypted(base64)
  }

  const handleDecrypt = async () => {
    setError("")
    if (!decryptUrl || !decryptPassword) return
    try {
      const data = atob(decryptUrl)
      const bytes = new Uint8Array(data.length)
      for (let i = 0; i < data.length; i++) {
        bytes[i] = data.charCodeAt(i)
      }
      const iv = bytes.slice(0, 12)
      const ciphertext = bytes.slice(12)
      
      const key = await generateKey(decryptPassword)
      const decryptedBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv }, key, ciphertext
      )
      const dec = new TextDecoder()
      setDecrypted(dec.decode(decryptedBuf))
    } catch (e) {
      setError("Failed to decrypt. Invalid password or corrupted payload.")
    }
  }

  return (
    <ToolLayout 
      title="Secret Sharing" 
      description="Encrypt a secret with a password. Decrypts entirely in the browser."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-4">
        
        {/* Encrypt block */}
        <div className="flex flex-col gap-6 p-6 border rounded-xl bg-card/50">
          <h2 className="text-xl font-bold">Encrypt Secret</h2>
          <div className="flex flex-col gap-2">
            <Label>Secret Message</Label>
            <Textarea value={secret} onChange={(e) => setSecret(e.target.value)} className="resize-none h-32" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Password (Key)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={handleEncrypt} disabled={!secret || !password}>Encrypt</Button>
          
          {encrypted && (
            <div className="mt-4 p-4 bg-muted border rounded-md break-all font-mono relative pr-12 text-sm">
              {encrypted}
              <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(encrypted)}>
                <CopyIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Decrypt block */}
        <div className="flex flex-col gap-6 p-6 border rounded-xl bg-card/50">
          <h2 className="text-xl font-bold">Decrypt Secret</h2>
          <div className="flex flex-col gap-2">
            <Label>Encrypted Payload (Base64)</Label>
            <Textarea value={decryptUrl} onChange={(e) => setDecryptUrl(e.target.value)} className="resize-none h-32" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input type="password" value={decryptPassword} onChange={(e) => setDecryptPassword(e.target.value)} />
          </div>
          <Button onClick={handleDecrypt} disabled={!decryptUrl || !decryptPassword}>Decrypt</Button>
          
          {error && <div className="text-destructive font-semibold">{error}</div>}
          
          {decrypted && (
            <div className="mt-4 flex flex-col gap-2">
              <Label className="text-green-600 font-bold">Decrypted Message:</Label>
              <Textarea readOnly value={decrypted} className="h-32 bg-green-500/10 border-green-500/20 text-green-700" />
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  )
}
