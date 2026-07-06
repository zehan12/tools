import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Send, Clock, Activity, Ban, AlignLeft, LayoutList, Paperclip, Trash2, CheckSquare, Square, ChevronDown, Loader2, MoreHorizontal, ChevronRight } from "lucide-react"
import { getStatusMessage } from "http-status-message"

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-500 font-semibold",
  HEAD: "text-emerald-400 font-semibold",
  POST: "text-yellow-500 font-semibold",
  PUT: "text-orange-500 font-semibold",
  PATCH: "text-amber-500 font-semibold",
  DELETE: "text-red-500 font-semibold",
  OPTIONS: "text-blue-400 font-semibold"
}

import { ScrollArea } from "@/components/ui/scroll-area"

// Simple JSON Syntax Highlighter
const syntaxHighlight = (jsonStr: string) => {
  if (jsonStr === "Error parsing response body" || jsonStr.startsWith("Network Error") || (!jsonStr.trim().startsWith("{") && !jsonStr.trim().startsWith("["))) {
    return <span className="text-foreground">{jsonStr}</span>;
  }
  
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
  
  const tokens = [];
  let lastIndex = 0;
  
  let match;
  while ((match = regex.exec(jsonStr)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(<span key={`text-${lastIndex}`} className="text-foreground">{jsonStr.substring(lastIndex, match.index)}</span>);
    }
    
    let cls = "text-orange-500 dark:text-orange-400"; // number
    if (/^"/.test(match[0])) {
      if (/:$/.test(match[0])) {
        cls = "text-purple-600 dark:text-purple-400"; // key
      } else {
        cls = "text-green-600 dark:text-green-400"; // string
      }
    } else if (/true|false/.test(match[0])) {
      cls = "text-yellow-600 dark:text-yellow-400"; // boolean
    } else if (/null/.test(match[0])) {
      cls = "text-gray-500"; // null
    }
    
    tokens.push(<span key={`token-${match.index}`} className={cls}>{match[0]}</span>);
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < jsonStr.length) {
    tokens.push(<span key={`text-${lastIndex}`} className="text-foreground">{jsonStr.substring(lastIndex)}</span>);
  }
  
  return <>{tokens}</>;
};

type KVParam = { id: string; key: string; value: string; enabled: boolean };

const KeyValueEditor = ({ items, onChange }: { items: KVParam[]; onChange: (items: KVParam[]) => void }) => {
  const handleUpdate = (id: string, field: keyof KVParam, value: any) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    if (newItems[newItems.length - 1].key || newItems[newItems.length - 1].value) {
      newItems.push({ id: Math.random().toString(36).substring(2, 9), key: "", value: "", enabled: true });
    }
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    if (items.length === 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col w-full text-xs font-mono">
      <div className="flex border-b border-border/50 text-muted-foreground pb-2 mb-2 px-1">
        <div className="w-8 flex justify-center"></div>
        <div className="flex-1 font-medium">Key</div>
        <div className="flex-1 font-medium border-l border-border/50 pl-3">Value</div>
        <div className="w-8"></div>
      </div>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center mb-1 group rounded-md hover:bg-muted/30 border border-transparent focus-within:border-border/50 focus-within:bg-muted/10 transition-colors">
          <div className="w-8 flex justify-center cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleUpdate(item.id, 'enabled', !item.enabled)}>
            {item.enabled ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1">
            <Input 
              value={item.key} 
              onChange={(e) => handleUpdate(item.id, 'key', e.target.value)} 
              placeholder="Key"
              className="h-7 bg-transparent border-0 shadow-none focus-visible:ring-0 text-xs px-2 font-mono"
            />
          </div>
          <div className="flex-1 border-l border-border/50">
            <Input 
              value={item.value} 
              onChange={(e) => handleUpdate(item.id, 'value', e.target.value)} 
              placeholder="Value"
              className="h-7 bg-transparent border-0 shadow-none focus-visible:ring-0 text-xs px-3 font-mono"
            />
          </div>
          <div className="w-8 flex justify-center">
            {index < items.length - 1 && (
              <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RestClientTool() {
  const { t } = useTranslation()
  const [method, setMethod] = usePersist("tools-rest-method", "GET")
  const [url, setUrl] = usePersist("tools-rest-url", "https://jsonplaceholder.typicode.com/todos/1")
  const [queryParams, setQueryParams] = usePersist<KVParam[]>("tools-rest-query-params", [{ id: "1", key: "", value: "", enabled: true }])
  const [headerParams, setHeaderParams] = usePersist<KVParam[]>("tools-rest-header-params", [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }])
  const [authType, setAuthType] = usePersist<"none" | "bearer">("tools-rest-auth-type", "none")
  const [bearerToken, setBearerToken] = usePersist("tools-rest-bearer-token", "")
  const [body, setBody] = usePersist("tools-rest-body", "")
  const [formParams, setFormParams] = usePersist<KVParam[]>("tools-rest-form-params", [{ id: "1", key: "", value: "", enabled: true }])

  const [bodyType, setBodyType] = useState<"none" | "text" | "form">("text")

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const handleBodyScroll = () => {
    if (bodyTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = bodyTextareaRef.current.scrollTop
    }
  }

  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<{
    status: number
    statusText: string
    timeMs: number
    data: string
    headers: Record<string, string>
  } | null>(null)

  const [showHeaders, setShowHeaders] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleClear = () => {
    setUrl("")
    setQueryParams([{ id: "1", key: "", value: "", enabled: true }])
    setHeaderParams([{ id: "1", key: "Content-Type", value: "application/json", enabled: true }])
    setFormParams([{ id: "1", key: "", value: "", enabled: true }])
    setAuthType("none")
    setBearerToken("")
    setBody("")
    setResponse(null)
  }

  const handleFormatBody = () => {
    if (activeTab === "Body" && bodyType === "text") {
      try {
        const parsed = JSON.parse(body)
        setBody(JSON.stringify(parsed, null, 2))
        toast.success("JSON Formatted")
      } catch (err) {
        toast.error("Invalid JSON")
      }
    }
  }

  const handleSend = async () => {
    if (!url) {
      toast.error("URL is required")
      return
    }

    const activeHeaders: Record<string, string> = {}
    headerParams.filter(p => p.enabled && p.key).forEach(p => {
      activeHeaders[p.key] = p.value
    })
    
    if (authType === "bearer" && bearerToken) {
      activeHeaders["Authorization"] = `Bearer ${bearerToken}`
    }

    let finalUrl = url
    const activeParams = queryParams.filter(p => p.enabled && p.key)
    if (activeParams.length > 0) {
      try {
        const urlObj = new URL(url.includes("://") ? url : `http://${url}`)
        activeParams.forEach(p => {
           if (!urlObj.searchParams.has(p.key)) {
             urlObj.searchParams.append(p.key, p.value)
           }
        })
        finalUrl = urlObj.toString()
      } catch (e) {
        // invalid URL
      }
    }

    setIsLoading(true)
    setResponse(null)
    const startTime = performance.now()

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: activeHeaders,
      }
      
      if (method !== "GET" && method !== "HEAD" && bodyType !== "none") {
        if (bodyType === "text" && body.trim()) {
          fetchOptions.body = body
        } else if (bodyType === "form") {
          const urlSearchParams = new URLSearchParams()
          formParams.filter(p => p.enabled && p.key).forEach(p => {
            urlSearchParams.append(p.key, p.value)
          })
          fetchOptions.body = urlSearchParams
          if (!activeHeaders["Content-Type"] && !activeHeaders["content-type"]) {
            activeHeaders["Content-Type"] = "application/x-www-form-urlencoded"
          }
        }
      }

      const res = await fetch(finalUrl, fetchOptions)
      const endTime = performance.now()

      let dataText = ""
      const contentType = res.headers.get("content-type") || ""
      
      try {
        if (contentType.includes("application/json")) {
          const jsonObj = await res.json()
          dataText = JSON.stringify(jsonObj, null, 2)
        } else {
          dataText = await res.text()
        }
      } catch (err) {
        dataText = "Error parsing response body"
      }

      const resHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        resHeaders[key] = value
      })

      let fallbackText = ""
      try {
        const msgObj = getStatusMessage(res.status, 'short') as { message?: string }
        fallbackText = msgObj?.message || ""
      } catch (e) {
        // fallback ignored
      }

      setResponse({
        status: res.status,
        statusText: res.statusText || fallbackText || "",
        timeMs: Math.round(endTime - startTime),
        data: dataText,
        headers: resHeaders,
      })
      
      toast.success(`Request finished in ${Math.round(endTime - startTime)}ms`)
    } catch (err: any) {
      const endTime = performance.now()
      setResponse({
        status: 0,
        statusText: "Network Error or CORS failure",
        timeMs: Math.round(endTime - startTime),
        data: err.toString(),
        headers: {},
      })
      toast.error("Request failed")
    } finally {
      setIsLoading(false)
    }
  }

  const [activeTab, setActiveTab] = useState<"Params" | "Headers" | "Auth" | "Body">("Body")

  return (
    <ToolLayout 
      title="HTTP / REST Client" 
      description="A lightweight, in-browser tester for API endpoints."
      onClear={handleClear}
    >
      {/* Container matching screenshot */}
      <div className="flex flex-col grow rounded-lg overflow-hidden border bg-background text-foreground font-sans shadow-sm min-h-[600px] max-h-[80vh]">
        
        {/* Top Bar */}
        <div className="flex items-center gap-2 p-3 bg-background border-b">
          <div className="flex items-center flex-1 bg-muted rounded-md px-2 py-1 focus-within:ring-1 focus-within:ring-emerald-500/50 border border-transparent focus-within:border-emerald-500/30 transition-colors">
            <Select value={method} onValueChange={(val) => { if (val) setMethod(val) }}>
              <SelectTrigger className={`border-0 bg-transparent shadow-none px-2 focus:ring-0 h-8 w-fit ${METHOD_COLORS[method] || "text-emerald-500"} hover:bg-black/5 dark:hover:bg-white/5`}>
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent className="bg-muted border-border">
                {HTTP_METHODS.map((m) => (
                  <SelectItem key={m} value={m} className={`${METHOD_COLORS[m] || ""} hover:bg-black/5 dark:hover:bg-white/10`}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/v1/users"
              className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 font-mono text-sm px-2 text-primary placeholder:text-muted-foreground"
            />
          </div>
          <Button 
            onClick={handleSend} 
            disabled={isLoading} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-none h-9 px-6 rounded-md font-medium ml-2 transition-colors min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </span>
            ) : "Send"}
          </Button>
        </div>

        {/* Panes */}
        <div className="flex flex-col xl:flex-row grow overflow-hidden">
          
          {/* Left Pane */}
          <div className="flex flex-col w-full xl:w-1/2 border-r">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-2 pt-2 border-b overflow-x-auto scrollbar-hide bg-muted/30">
              {["Params", "Headers", "Auth", "Body"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${
                    activeTab === tab 
                      ? "text-foreground bg-background border-x border-t border-b-0 -mb-[1px]" 
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="flex-1 border-b" />
            </div>
            
            {/* Tab Content */}
            <ScrollArea className="flex-1 p-4 bg-background h-full">
              {activeTab === "Params" && (
                <KeyValueEditor items={queryParams} onChange={setQueryParams} />
              )}
              {activeTab === "Headers" && (
                <KeyValueEditor items={headerParams} onChange={setHeaderParams} />
              )}
              {activeTab === "Auth" && (
                <div className="flex flex-col gap-4 max-w-md">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Type</Label>
                    <Select value={authType} onValueChange={(v: any) => setAuthType(v)}>
                      <SelectTrigger className="w-[200px] h-8 text-xs bg-muted/50 focus:ring-1 focus:ring-emerald-500/50">
                        <SelectValue placeholder="Select Auth Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Auth</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {authType === "bearer" && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Token</Label>
                      <Input 
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        placeholder="Enter token..." 
                        className="h-8 text-xs font-mono focus-visible:ring-emerald-500/50 bg-muted/20"
                      />
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-md border border-border/50">
                    {authType === "none" && "This request does not use any authorization."}
                    {authType === "bearer" && "The authorization header will be automatically generated when you send the request."}
                  </div>
                </div>
              )}
              {activeTab === "Body" && (
                <div className="flex flex-col h-full relative">
                  
                  {/* Postman-like Body Type Selector Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs mb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input type="radio" name="bodyType" value="none" checked={method === "GET" || method === "HEAD" || bodyType === "none"} onChange={() => setBodyType("none")} disabled={method === "GET" || method === "HEAD"} className="w-3 h-3 text-blue-500 focus:ring-blue-500 bg-transparent border-muted-foreground/50 cursor-pointer" />
                      <span className={method === "GET" || method === "HEAD" || bodyType === "none" ? "text-foreground" : ""}>none</span>
                    </label>
                    
                    <label className="flex items-center gap-1.5 cursor-not-allowed text-muted-foreground/50">
                      <input type="radio" disabled className="w-3 h-3 bg-transparent border-muted-foreground/30" />
                      <span>form-data</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input type="radio" name="bodyType" value="form" checked={method !== "GET" && method !== "HEAD" && bodyType === "form"} onChange={() => setBodyType("form")} disabled={method === "GET" || method === "HEAD"} className="w-3 h-3 text-blue-500 focus:ring-blue-500 bg-transparent border-muted-foreground/50 cursor-pointer" />
                      <span className={bodyType === "form" && method !== "GET" && method !== "HEAD" ? "text-foreground" : ""}>x-www-form-urlencoded</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input type="radio" name="bodyType" value="text" checked={method !== "GET" && method !== "HEAD" && bodyType === "text"} onChange={() => setBodyType("text")} disabled={method === "GET" || method === "HEAD"} className="w-3 h-3 text-blue-500 focus:ring-blue-500 bg-transparent border-muted-foreground/50 cursor-pointer" />
                      <span className={bodyType === "text" && method !== "GET" && method !== "HEAD" ? "text-foreground" : ""}>raw</span>
                    </label>

                    {bodyType === "text" && method !== "GET" && method !== "HEAD" && (
                      <div className="flex items-center gap-0.5 text-blue-500 font-medium cursor-pointer">
                        JSON <ChevronDown className="w-3 h-3" />
                      </div>
                    )}

                    <label className="flex items-center gap-1.5 cursor-not-allowed text-muted-foreground/50">
                      <input type="radio" disabled className="w-3 h-3 bg-transparent border-muted-foreground/30" />
                      <span>binary</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-not-allowed text-muted-foreground/50">
                      <input type="radio" disabled className="w-3 h-3 bg-transparent border-muted-foreground/30" />
                      <span>GraphQL</span>
                    </label>

                    <div className="flex-1" />

                    {bodyType === "text" && method !== "GET" && method !== "HEAD" && (
                      <button onClick={handleFormatBody} className="text-blue-500 hover:text-blue-400 transition-colors font-medium mr-1">
                        Beautify
                      </button>
                    )}
                  </div>

                  {method === "GET" || method === "HEAD" || bodyType === "none" ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground pb-12 mt-12 border-t border-border/50">
                      <div className="w-16 h-16 rounded-full bg-muted/10 border-2 border-muted flex items-center justify-center mb-4 mt-8">
                        <Ban className="w-8 h-8 text-muted-foreground/60 stroke-[1.5]" />
                      </div>
                      <span className="text-sm font-medium">No body</span>
                    </div>
                  ) : bodyType === "form" ? (
                    <div className="flex-1 mt-2 border-t border-border/50 pt-3">
                      <KeyValueEditor items={formParams} onChange={setFormParams} />
                    </div>
                  ) : (
                    <div className="flex-1 flex border border-border/50 rounded-sm mt-2 relative group overflow-hidden bg-background max-h-[500px]">
                      <div 
                        ref={lineNumbersRef}
                        className="flex flex-col text-muted-foreground/50 select-none text-right border-r border-border/50 pr-2 pt-2 pb-12 bg-muted/10 font-mono text-[13px] w-[35px] h-full leading-[20px] overflow-hidden"
                      >
                        {(body || "\n").split('\n').map((_, i) => (
                          <span key={i}>{i + 1}</span>
                        ))}
                      </div>
                      <Textarea
                        ref={bodyTextareaRef}
                        onScroll={handleBodyScroll}
                        wrap="off"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder=""
                        className="w-full min-h-[300px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 font-mono text-[13px] text-foreground shadow-none p-2 leading-[20px]"
                        spellCheck={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Pane */}
          <div className="flex flex-col w-full xl:w-1/2 bg-background">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-2 border-b bg-muted/30">
              <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-transparent">
                Request <span className={METHOD_COLORS[method]?.split(' ')[0] || ""}>{method}</span>
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-foreground bg-background border-x border-t rounded-t-md transition-colors -mb-[1px]">
                Response {response ? <span className={
                  response.status >= 200 && response.status < 300 ? 'text-emerald-500' : 
                  response.status === 0 ? 'text-destructive' : 'text-amber-500'
                }>{response.status} {response.statusText}</span> : ""}
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              <ScrollArea className="flex-1 p-4 bg-background h-full">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs font-mono py-12 gap-3 mt-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Sending Request...</span>
                    <span className="opacity-50">Awaiting response from server</span>
                  </div>
                ) : response ? (
                  <div className="flex flex-col gap-4">
                    <div 
                      className="text-xs font-mono text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => setShowHeaders(!showHeaders)}
                    >
                      <span className="text-muted-foreground">{showHeaders ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</span>
                      HTTP/1.1 
                      <span className={`font-bold ${
                        response.status >= 200 && response.status < 300 ? 'text-emerald-500' : 
                        response.status === 0 ? 'text-destructive' : 'text-amber-500'
                      }`}>
                        {response.status || "ERR"} {response.statusText}
                      </span>
                      <span>({Object.keys(response.headers).length} headers)</span>
                      <span className="text-muted-foreground ml-2">{response.timeMs} ms</span>
                    </div>

                    {showHeaders && (
                      <div className="text-xs font-mono text-muted-foreground bg-muted/20 p-4 rounded-md border border-border/50">
                        <table className="w-full text-left border-collapse">
                          <tbody>
                            {Object.entries(response.headers).map(([key, value]) => (
                              <tr key={key} className="border-b border-border/30 last:border-0">
                                <td className="py-1.5 pr-4 text-blue-500 dark:text-blue-400 font-medium align-top w-1/3 break-all">{key}</td>
                                <td className="py-1.5 align-top text-foreground break-all">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Fake Line Numbers + Code Block */}
                    <ScrollArea className="mt-2 w-full pb-4">
                      <div className="flex font-mono text-xs w-max min-w-full relative">
                        <div className="flex flex-col text-muted-foreground/50 select-none text-right border-r border-border/50 pr-3 sticky left-0 bg-background z-10">
                          {(response.data || "\n").split('\n').map((_, i) => (
                            <span key={i} className="leading-6">{i + 1}</span>
                          ))}
                        </div>
                        <div className="flex-1 whitespace-pre pl-3 leading-6 pr-4">
                          {syntaxHighlight(response.data)}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono py-12">
                    No response data
                  </div>
                )}
              </ScrollArea>
              
              {response && (
                 <div className="border-t border-border/50 bg-muted/10 p-1.5 px-4 flex justify-between items-center text-xs font-mono text-muted-foreground shrink-0 relative">
                    <span>{response.data.trim().startsWith('{') || response.data.trim().startsWith('[') ? 'JSON' : 'TEXT'} | {new Blob([response.data]).size} B | {response.timeMs} ms</span>
                    <button onClick={() => setShowOptions(!showOptions)} className="hover:bg-muted p-1 rounded text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {showOptions && (
                      <div className="absolute right-4 bottom-10 bg-popover border border-border shadow-lg rounded-md flex flex-col py-1 w-40 z-50 text-popover-foreground">
                        <button className="text-left px-3 py-1.5 hover:bg-muted text-xs" onClick={() => { navigator.clipboard.writeText(JSON.stringify(response)); toast.success("Copied all"); setShowOptions(false) }}>Copy all</button>
                        <button className="text-left px-3 py-1.5 hover:bg-muted text-xs" onClick={() => { navigator.clipboard.writeText(JSON.stringify(response.headers, null, 2)); toast.success("Copied headers"); setShowOptions(false) }}>Copy headers</button>
                        <button className="text-left px-3 py-1.5 hover:bg-muted text-xs" onClick={() => { navigator.clipboard.writeText(response.data); toast.success("Copied body"); setShowOptions(false) }}>Copy body</button>
                        <div className="h-[1px] bg-border my-1" />
                        <button className="text-left px-3 py-1.5 hover:bg-muted text-xs text-destructive" onClick={() => { setResponse(null); setShowOptions(false) }}>Clear</button>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
