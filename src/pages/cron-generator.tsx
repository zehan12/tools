import { useTranslation } from "react-i18next"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import cronstrue from "cronstrue"
import { toast } from "sonner"
import { Clock, Copy } from "lucide-react"

const PRESETS = [
  { label: "Every Minute", value: "* * * * *" },
  { label: "Every 5 Minutes", value: "*/5 * * * *" },
  { label: "Every Hour", value: "0 * * * *" },
  { label: "Every Day at Midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9AM", value: "0 9 * * 1" },
  { label: "Every Weekday (Mon-Fri)", value: "0 0 * * 1-5" },
  { label: "First day of Month", value: "0 0 1 * *" },
]

export default function CronGeneratorTool() {
  const { t } = useTranslation()
  const [cron, setCron, clearCron] = usePersist("tools-cron-expression", "* * * * *")

  let explanation = ""
  let isError = false
  try {
    explanation = cronstrue.toString(cron, { throwExceptionOnParseError: true })
  } catch (e: any) {
    explanation = e.toString()
    isError = true
  }

  const parts = cron.split(" ").filter(Boolean)
  const isComplete = parts.length === 5 || parts.length === 6

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cron)
      toast.success("Copied to clipboard")
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  return (
    <ToolLayout 
      title="Cron Expression Generator" 
      description="Visually build, decode, and explain Cron schedules in plain English."
      onClear={clearCron}
    >
      <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cron-input" className="text-lg font-semibold">Cron Expression</Label>
          <div className="relative">
            <Input
              id="cron-input"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              className="text-2xl font-mono py-6 text-center tracking-widest pr-12"
              placeholder="* * * * *"
            />
            <Tooltip>
              <TooltipTrigger
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Copy cron expression"
              >
                <Copy className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy cron expression</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2 font-mono">
            <span>minute</span>
            <span>hour</span>
            <span>day (month)</span>
            <span>month</span>
            <span>day (week)</span>
          </div>
        </div>

        <div className={`p-8 rounded-xl border ${isError ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/5 border-primary/20 text-primary'} flex flex-col items-center justify-center text-center gap-4 transition-colors`}>
          <Clock className={`w-12 h-12 ${isError ? 'opacity-50' : ''}`} />
          <h2 className="text-2xl font-medium">
            {explanation}
          </h2>
          {!isComplete && !isError && (
            <p className="text-sm opacity-70">
              Incomplete expression (needs 5 parts)
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <Label className="text-lg font-semibold">Popular Presets</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => setCron(preset.value)}
                className="font-mono text-xs hover:bg-primary/10 transition-colors"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
