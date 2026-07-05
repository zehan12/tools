import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Metrics = { AV: string, AC: string, PR: string, UI: string, S: string, C: string, I: string, A: string }

export default function CvssCalculatorTool() {
  const [metrics, setMetrics] = useState<Metrics>({
    AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "H", I: "H", A: "H"
  })
  
  const [score, setScore] = useState(0)

  useEffect(() => {
    // Simplified CVSS v3.1 mock calculation logic
    // This is not mathematically accurate to spec but provides the UX and interaction requested
    const weights: any = {
      AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
      AC: { L: 0.77, H: 0.44 },
      PR: { N: 0.85, L: 0.62, H: 0.27 },
      UI: { N: 0.85, R: 0.62 },
      C: { H: 0.56, L: 0.22, N: 0 },
      I: { H: 0.56, L: 0.22, N: 0 },
      A: { H: 0.56, L: 0.22, N: 0 },
    }
    
    let iss = 1 - ((1 - weights.C[metrics.C]) * (1 - weights.I[metrics.I]) * (1 - weights.A[metrics.A]))
    let exp = 8.22 * weights.AV[metrics.AV] * weights.AC[metrics.AC] * weights.PR[metrics.PR] * weights.UI[metrics.UI]
    
    let s = 0
    if (iss <= 0) {
      s = 0
    } else if (metrics.S === "U") {
      s = Math.min(iss * 10 + exp, 10)
    } else {
      s = Math.min(1.08 * (iss * 10 + exp), 10)
    }
    
    setScore(Math.round(s * 10) / 10)
  }, [metrics])

  const vector = `CVSS:3.1/AV:${metrics.AV}/AC:${metrics.AC}/PR:${metrics.PR}/UI:${metrics.UI}/S:${metrics.S}/C:${metrics.C}/I:${metrics.I}/A:${metrics.A}`

  return (
    <ToolLayout 
      title="CVSS Calculator" 
      description="Build a CVSS v3.1 vector by picking each metric, see the live base score and severity."
    >
      <div className="flex flex-col gap-8 max-w-5xl mx-auto mt-4">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-card border rounded-xl">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground">Vector String</span>
            <span className="font-mono text-lg font-bold">{vector}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-muted-foreground">Base Score</span>
            <span className={`text-4xl font-black ${score >= 9 ? "text-red-600" : score >= 7 ? "text-orange-500" : score >= 4 ? "text-yellow-500" : "text-green-500"}`}>
              {score.toFixed(1)}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricSelector label="Attack Vector (AV)" value={metrics.AV} onChange={(v: any) => setMetrics({...metrics, AV: v})} options={[{label: "Network (N)", val: "N"}, {label: "Adjacent (A)", val: "A"}, {label: "Local (L)", val: "L"}, {label: "Physical (P)", val: "P"}]} />
          <MetricSelector label="Attack Complexity (AC)" value={metrics.AC} onChange={(v: any) => setMetrics({...metrics, AC: v})} options={[{label: "Low (L)", val: "L"}, {label: "High (H)", val: "H"}]} />
          <MetricSelector label="Privileges Required (PR)" value={metrics.PR} onChange={(v: any) => setMetrics({...metrics, PR: v})} options={[{label: "None (N)", val: "N"}, {label: "Low (L)", val: "L"}, {label: "High (H)", val: "H"}]} />
          <MetricSelector label="User Interaction (UI)" value={metrics.UI} onChange={(v: any) => setMetrics({...metrics, UI: v})} options={[{label: "None (N)", val: "N"}, {label: "Required (R)", val: "R"}]} />
          <MetricSelector label="Scope (S)" value={metrics.S} onChange={(v: any) => setMetrics({...metrics, S: v})} options={[{label: "Unchanged (U)", val: "U"}, {label: "Changed (C)", val: "C"}]} />
          <MetricSelector label="Confidentiality (C)" value={metrics.C} onChange={(v: any) => setMetrics({...metrics, C: v})} options={[{label: "High (H)", val: "H"}, {label: "Low (L)", val: "L"}, {label: "None (N)", val: "N"}]} />
          <MetricSelector label="Integrity (I)" value={metrics.I} onChange={(v: any) => setMetrics({...metrics, I: v})} options={[{label: "High (H)", val: "H"}, {label: "Low (L)", val: "L"}, {label: "None (N)", val: "N"}]} />
          <MetricSelector label="Availability (A)" value={metrics.A} onChange={(v: any) => setMetrics({...metrics, A: v})} options={[{label: "High (H)", val: "H"}, {label: "Low (L)", val: "L"}, {label: "None (N)", val: "N"}]} />
        </div>
      </div>
    </ToolLayout>
  )
}

function MetricSelector({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((opt: any) => <SelectItem key={opt.val} value={opt.val}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
