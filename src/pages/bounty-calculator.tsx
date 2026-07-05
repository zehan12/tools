import { useState } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BountyCalculatorTool() {
  const [baseBounty, setBaseBounty] = useState(10000)
  const [cvss, setCvss] = useState(9.8)
  
  // A simple interpolation based on typical bug bounty platforms
  // Critical (9.0-10.0) -> 100% of base
  // High (7.0-8.9) -> 50% of base
  // Medium (4.0-6.9) -> 20% of base
  // Low (0.1-3.9) -> 5% of base
  let multiplier = 0
  if (cvss >= 9.0) multiplier = 1
  else if (cvss >= 7.0) multiplier = 0.5
  else if (cvss >= 4.0) multiplier = 0.2
  else if (cvss >= 0.1) multiplier = 0.05
  
  // Interpolate slightly based on exact score within severity band
  let bandBase = 0
  let bandRange = 1
  if (cvss >= 9.0) { bandBase = 0.8; bandRange = 10 - 9.0 }
  else if (cvss >= 7.0) { bandBase = 0.4; bandRange = 8.9 - 7.0 }
  else if (cvss >= 4.0) { bandBase = 0.1; bandRange = 6.9 - 4.0 }
  
  const scorePct = cvss >= 9.0 ? ((cvss - 9.0) / bandRange) * 0.2 + 0.8 : 
                   cvss >= 7.0 ? ((cvss - 7.0) / bandRange) * 0.1 + 0.4 :
                   cvss >= 4.0 ? ((cvss - 4.0) / bandRange) * 0.1 + 0.1 : 0.05
                   
  const payout = Math.round(baseBounty * scorePct)

  return (
    <ToolLayout 
      title="Bounty Calculator" 
      description="Suggest a bug bounty payout from a CVSS score using severity-based interpolation."
    >
      <div className="flex flex-col gap-8 max-w-2xl mx-auto mt-8">
        
        <div className="flex flex-col md:flex-row gap-6 p-6 border rounded-xl bg-card">
          <div className="flex flex-col gap-2 flex-1">
            <Label>Max Bounty (Critical)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input type="number" min="0" value={baseBounty} onChange={(e) => setBaseBounty(Number(e.target.value))} className="pl-7" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <Label>CVSS Score (0 - 10.0)</Label>
            <Input type="number" min="0" max="10" step="0.1" value={cvss} onChange={(e) => setCvss(Number(e.target.value))} />
          </div>
        </div>

        <div className="p-8 border border-primary/20 bg-primary/5 rounded-xl text-center flex flex-col gap-4">
          <div className="text-lg font-semibold text-muted-foreground">Suggested Payout</div>
          <div className="text-6xl font-black text-primary">
            ${payout.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Based on severity multiplier of {(scorePct * 100).toFixed(1)}% for score {cvss}
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
