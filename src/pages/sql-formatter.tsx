import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "sql-formatter"

export default function SqlFormatterTool() {
  const [input, setInput, clearInput] = usePersist("tools-sql-formatter", "")
  const [dialect, setDialect] = useState("postgresql")
  
  let output = ""
  try {
    if (input.trim()) {
      output = format(input, { language: dialect as any, tabWidth: 2 })
    }
  } catch (e: any) {
    output = `Error formatting SQL:\n${e.message}`
  }

  return (
    <ToolLayout 
      title="SQL Formatter" 
      description="Format and beautify SQL queries with syntax highlighting."
      onClear={clearInput}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center gap-2">
          <Label>Dialect:</Label>
          <div className="w-48">
            <Select value={dialect} onValueChange={(val: any) => setDialect(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select dialect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">Standard SQL</SelectItem>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="mariadb">MariaDB</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[400px]">
          <div className="flex flex-col gap-2 h-full">
            <Label htmlFor="input-sql">Raw SQL</Label>
            <Textarea
              id="input-sql"
              placeholder="SELECT * FROM users WHERE active = true"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 resize-none font-mono"
            />
          </div>
          <div className="flex flex-col gap-2 h-full">
            <Label htmlFor="output-sql">Formatted Output</Label>
            <Textarea
              id="output-sql"
              readOnly
              value={output}
              className={`flex-1 resize-none bg-muted font-mono whitespace-pre ${output.startsWith("Error") ? "text-destructive" : "text-blue-500"}`}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
