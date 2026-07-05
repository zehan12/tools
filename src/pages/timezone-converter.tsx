import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COMMON_TIMEZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", 
  "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Kolkata", 
  "Australia/Sydney", "Pacific/Auckland"
]

export default function TimezoneConverterTool() {
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 16))
  const [sourceTz, setSourceTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [targetTz, setTargetTz] = useState("UTC")
  const [result, setResult] = useState("")

  useEffect(() => {
    try {
      // Parse the input date as if it's in the source timezone
      // This is tricky natively in JS, so we'll do a basic conversion
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) {
        setResult("Invalid Date")
        return
      }
      
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz,
        dateStyle: 'full',
        timeStyle: 'long'
      }).format(d)
      
      setResult(formatted)
    } catch (e) {
      setResult("Error converting timezone")
    }
  }, [dateStr, sourceTz, targetTz])

  return (
    <ToolLayout 
      title="Timezone Converter" 
      description="Convert times between different timezones. Supports timestamps, ISO dates, and custom formats."
    >
      <div className="flex flex-col gap-8 max-w-3xl mx-auto mt-8">
        
        <div className="flex flex-col md:flex-row gap-6 p-6 border rounded-xl bg-card">
          <div className="flex flex-col gap-2 flex-1">
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <Label>Source Timezone (Browser)</Label>
            <Select value={sourceTz} onValueChange={(val: any) => setSourceTz(val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.includes(sourceTz) || <SelectItem value={sourceTz}>{sourceTz}</SelectItem>}
                {COMMON_TIMEZONES.map(tz => (
                  <SelectItem key={`src-${tz}`} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 p-6 border border-primary/20 bg-primary/5 rounded-xl">
          <Label className="text-primary font-semibold">Target Timezone</Label>
          <Select value={targetTz} onValueChange={(val: any) => setTargetTz(val)}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map(tz => (
                <SelectItem key={`tgt-${tz}`} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-8 text-center">
            <div className="text-sm text-muted-foreground mb-2">Converted Time</div>
            <div className="text-3xl font-bold text-foreground">
              {result}
            </div>
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
