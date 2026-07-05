import { useState, useEffect, useRef } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { usePersist } from "@/hooks/use-persist"

// Base64URL encoding/decoding helpers
const b64uEncode = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch(e) { return "" }
}

const b64uDecode = (str: string) => {
  try {
    let padded = str.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) padded += '=';
    return decodeURIComponent(escape(atob(padded)));
  } catch (e) {
    return ""
  }
}

async function signHS256(message: string, secret: string) {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    const bytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    return "";
  }
}

export default function JwtDecoderTool() {
  const [mode, setMode] = usePersist<"decode" | "encode">("tools-jwt-mode", "decode")
  const [token, setToken, clearToken] = usePersist("tools-jwt-token", "")
  const [secret, setSecret] = usePersist("tools-jwt-secret", "your-256-bit-secret")

  const [headerStr, setHeaderStr] = useState("")
  const [payloadStr, setPayloadStr] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  
  const highlightRef = useRef<HTMLDivElement>(null)

  // Initialize from persisted token on mount
  useEffect(() => {
    if (token && !headerStr) {
      const parts = token.split('.')
      if (parts.length >= 2) {
        const h = b64uDecode(parts[0])
        try { setHeaderStr(JSON.stringify(JSON.parse(h), null, 2)) } catch (e) { setHeaderStr(h) }
        
        const p = b64uDecode(parts[1])
        try { setPayloadStr(JSON.stringify(JSON.parse(p), null, 2)) } catch (e) { setPayloadStr(p) }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Validate signature when token or secret changes
  useEffect(() => {
    async function check() {
      if (!token) return setIsValid(null);
      
      const cleanToken = token.replace(/\s+/g, '');
      const parts = cleanToken.split('.')
      if (parts.length !== 3) return setIsValid(false);
      
      try {
        const header = JSON.parse(b64uDecode(parts[0]))
        if (header.alg === "HS256") {
          const sig = await signHS256(`${parts[0]}.${parts[1]}`, secret)
          setIsValid(sig === parts[2])
        } else {
          setIsValid(null) // Unknown alg
        }
      } catch(e) {
        setIsValid(false)
      }
    }
    check()
  }, [token, secret])

  const updateToken = async (hStr: string, pStr: string, sStr: string) => {
    try {
      JSON.parse(hStr)
      JSON.parse(pStr)
    } catch(e) {
      return // Wait for valid JSON to encode
    }

    const encodedH = b64uEncode(hStr)
    const encodedP = b64uEncode(pStr)
    
    let sig = ""
    try {
      const header = JSON.parse(hStr)
      if (header.alg === "HS256") {
        sig = await signHS256(`${encodedH}.${encodedP}`, sStr)
      }
    } catch(e) {
      // ignore
    }
    setToken(`${encodedH}.${encodedP}.${sig}`)
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // JWTs should not contain spaces, newlines, or tabs. Strip them out.
    const val = e.target.value.replace(/\s+/g, '')
    setToken(val)
    if (mode === 'decode') {
      const parts = val.split('.')
      if (parts.length >= 2) {
        const h = b64uDecode(parts[0])
        try { setHeaderStr(JSON.stringify(JSON.parse(h), null, 2)) } catch (e) { setHeaderStr(h) }
        
        const p = b64uDecode(parts[1])
        try { setPayloadStr(JSON.stringify(JSON.parse(p), null, 2)) } catch (e) { setPayloadStr(p) }
      } else {
        setHeaderStr("")
        setPayloadStr("")
      }
    }
  }

  const handleHeaderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setHeaderStr(val)
    updateToken(val, payloadStr, secret)
  }

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setPayloadStr(val)
    updateToken(headerStr, val, secret)
  }

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSecret(val)
    if (mode === 'encode') {
      updateToken(headerStr, payloadStr, val)
    }
  }

  const handleModeChange = (newMode: "decode" | "encode") => {
    if (newMode !== mode) {
      setMode(newMode)
      clearToken()
      setSecret("your-256-bit-secret")
      setHeaderStr("")
      setPayloadStr("")
      setIsValid(null)
    }
  }

  return (
    <ToolLayout 
      title="JWT Decoder / Encoder"
      description={mode === 'decode' ? "Decode and inspect JSON Web Tokens (JWT) to view their header, payload, and signature." : "Edit the JSON header and payload to automatically sign and encode HS256 tokens."}
      onClear={() => {
        clearToken()
        setSecret("your-256-bit-secret")
        setHeaderStr("")
        setPayloadStr("")
      }}
      maxWidth="w-full"
    >
      <div className="flex justify-start mb-2">
        <div className="inline-flex outline outline-border">
          <button
            onClick={() => handleModeChange('decode')}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${mode === 'decode' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
          >
            Decode
          </button>
          <button
            onClick={() => handleModeChange('encode')}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${mode === 'encode' ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'}`}
          >
            Encode
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 grow min-h-0">
        
        {/* JWT String */}
        <div className={`flex flex-col gap-2 flex-1 lg:w-1/2 ${mode === 'encode' ? 'order-2' : 'order-1'} min-h-0`}>
          <div className="space-y-1 flex-none">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">JSON Web Token (JWT)</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {mode === 'decode' ? "Paste a JWT to decode it into its parts" : "Your generated and encoded JWT string"}
            </p>
          </div>
          <div className="relative flex-1 min-h-[200px] outline outline-border focus-within:outline-ring/50 transition-colors bg-white dark:bg-[#111]">
            <div 
              ref={highlightRef}
              className={`absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm leading-relaxed overflow-hidden break-all whitespace-pre-wrap pointer-events-none ${mode === 'encode' ? 'opacity-70' : ''}`}
              aria-hidden="true"
            >
              {!token ? (
                <span className="text-gray-400 dark:text-gray-600">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
              ) : (
                (() => {
                  const parts = token.split('.');
                  return (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400">{parts[0]}</span>
                      {parts.length > 1 && <span className="text-gray-900 dark:text-gray-100">.</span>}
                      {parts.length > 1 && <span className="text-blue-600 dark:text-blue-400">{parts[1]}</span>}
                      {parts.length > 2 && <span className="text-gray-900 dark:text-gray-100">.</span>}
                      {parts.length > 2 && <span className="text-red-600 dark:text-red-400">{parts.slice(2).join('.')}</span>}
                    </>
                  )
                })()
              )}
            </div>
            <textarea
              spellCheck={false}
              readOnly={mode === 'encode'}
              value={token}
              onChange={handleTokenChange}
              onScroll={(e) => {
                if (highlightRef.current) {
                  highlightRef.current.scrollTop = e.currentTarget.scrollTop;
                  highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
              className={`absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm leading-relaxed text-transparent bg-transparent caret-black dark:caret-white resize-none break-all outline-none ${mode === 'encode' ? 'cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Decoded Data */}
        <div className={`flex flex-col gap-4 flex-1 lg:w-1/2 ${mode === 'encode' ? 'order-1' : 'order-2'} min-h-0`}>
          
          {/* Header */}
          <div className="flex flex-col gap-2 flex-none">
            <div className="space-y-1 flex-none">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Header</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {mode === 'decode' ? "Decoded JSON header" : "Edit JSON to update the encoded JWT"}
              </p>
            </div>
            <div className="relative h-24">
              <textarea
                spellCheck={false}
                readOnly={mode === 'decode'}
                value={headerStr}
                onChange={handleHeaderChange}
                className={`absolute inset-0 w-full h-full px-4 py-2 font-mono text-sm leading-relaxed outline outline-border focus:outline-ring/50 transition-colors bg-white dark:bg-[#111] dark:text-gray-100 resize-none whitespace-pre ${mode === 'decode' ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Payload */}
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="space-y-1 flex-none">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payload</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {mode === 'decode' ? "Decoded JSON payload" : "Edit JSON to update the encoded JWT"}
              </p>
            </div>
            <div className="relative flex-1 min-h-[100px]">
              <textarea
                spellCheck={false}
                readOnly={mode === 'decode'}
                value={payloadStr}
                onChange={handlePayloadChange}
                className={`absolute inset-0 w-full h-full px-4 py-2 font-mono text-sm leading-relaxed outline outline-border focus:outline-ring/50 transition-colors bg-white dark:bg-[#111] dark:text-gray-100 resize-none whitespace-pre ${mode === 'decode' ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Signature */}
          <div className="flex flex-col gap-2 flex-none">
            <div className="flex items-start justify-between flex-none">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Signature</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Secret for HS256 signature</p>
              </div>
              {isValid === true && (
                <span className="px-2 py-0.5 bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium outline outline-green-200 dark:outline-green-800">
                  Signature Verified
                </span>
              )}
              {isValid === false && (
                <span className="px-2 py-0.5 bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium outline outline-red-200 dark:outline-red-800">
                  Invalid Signature
                </span>
              )}
            </div>
            <div className="relative h-10">
              <input
                type="text"
                value={secret}
                onChange={handleSecretChange}
                className="absolute inset-0 w-full h-full px-4 py-1.5 font-mono text-sm outline outline-border focus:outline-ring/50 transition-colors bg-white dark:bg-[#111] dark:text-gray-100"
                placeholder="your-256-bit-secret"
                spellCheck={false}
              />
            </div>
          </div>

        </div>
      </div>
    </ToolLayout>
  )
}
