import { useState } from "react"
import { ToolLayout } from "@/components/ToolLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function IndiaIncomeTaxTool() {
  const [income, setIncome] = useState(1200000)
  
  // New Tax Regime (FY 2025-26) calculations
  // Slabs:
  // 0 - 3L : 0%
  // 3L - 7L : 5%
  // 7L - 10L : 10%
  // 10L - 12L : 15%
  // 12L - 15L : 20%
  // > 15L : 30%
  
  const standardDeduction = 50000
  const taxableIncome = Math.max(0, income - standardDeduction)
  
  let tax = 0
  
  if (taxableIncome > 1500000) {
    tax += (taxableIncome - 1500000) * 0.30
    tax += 300000 * 0.20 // 12-15
    tax += 200000 * 0.15 // 10-12
    tax += 300000 * 0.10 // 7-10
    tax += 400000 * 0.05 // 3-7
  } else if (taxableIncome > 1200000) {
    tax += (taxableIncome - 1200000) * 0.20
    tax += 200000 * 0.15 // 10-12
    tax += 300000 * 0.10 // 7-10
    tax += 400000 * 0.05 // 3-7
  } else if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.15
    tax += 300000 * 0.10 // 7-10
    tax += 400000 * 0.05 // 3-7
  } else if (taxableIncome > 700000) {
    tax += (taxableIncome - 700000) * 0.10
    tax += 400000 * 0.05 // 3-7
  } else if (taxableIncome > 300000) {
    tax += (taxableIncome - 300000) * 0.05
  }
  
  // Rebate u/s 87A up to 7L
  if (taxableIncome <= 700000) {
    tax = 0
  }
  
  // Marginal Relief is complex, we skip it for simplicity here, just doing basic cess
  const cess = tax * 0.04
  const totalTax = tax + cess
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0
  const inHand = income - totalTax

  return (
    <ToolLayout 
      title="Income Tax Calculator (India)" 
      description="Calculate income tax for India's new tax regime (FY 2025-26)."
    >
      <div className="flex flex-col gap-8 max-w-3xl mx-auto mt-4">
        
        <div className="flex flex-col gap-4 p-6 border rounded-xl bg-card">
          <Label>Gross Annual Income (₹)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
            <Input 
              type="number" 
              min="0" 
              value={income} 
              onChange={(e) => setIncome(Number(e.target.value))} 
              className="pl-8 text-lg font-bold" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-xl bg-card flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Standard Deduction</span>
            <span className="text-2xl font-bold text-red-500">- ₹{standardDeduction.toLocaleString()}</span>
          </div>
          <div className="p-6 border rounded-xl bg-card flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Taxable Income</span>
            <span className="text-2xl font-bold">₹{taxableIncome.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-8 border border-primary/20 bg-primary/5 rounded-xl flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-primary/10">
            <span className="font-semibold text-muted-foreground">Income Tax</span>
            <span className="font-bold font-mono">₹{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-primary/10">
            <span className="font-semibold text-muted-foreground">Health & Education Cess (4%)</span>
            <span className="font-bold font-mono">₹{cess.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-primary/10">
            <span className="font-bold text-lg">Total Tax Payable</span>
            <span className="font-black text-2xl text-destructive">₹{totalTax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">In-Hand Salary</span>
            <span className="font-black text-3xl text-green-600">₹{inHand.toLocaleString()}</span>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Effective Tax Rate: {effectiveRate.toFixed(2)}%
          </div>
        </div>

      </div>
    </ToolLayout>
  )
}
