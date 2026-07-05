import { useState } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { usePersist } from "@/hooks/use-persist"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ky from "ky"

export default function DnsRecordsTool() {
  const [domain, setDomain] = usePersist("tools-dns-domain", "zehan")
  const [type, setType] = usePersist("tools-dns-type", "A")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")

  const fetchDns = async () => {
    if (!domain.trim()) return
    setLoading(true)
    setError("")
    setResults(null)
    try {
      // Use Google DNS over HTTPS API
      const res: any = await ky.get(`https://dns.google/resolve?name=${domain}&type=${type}`).json()
      if (res.Status === 0) {
        setResults(res.Answer || [])
      } else {
        setError(`DNS lookup failed with status: ${res.Status}`)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolLayout
      title="DNS Records"
      description="Look up DNS records for any domain using Google's public DNS service."
    >
      <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="domain">Domain Name</Label>
            <Input id="domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchDns()} />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-32">
            <Label>Record Type</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "SRV", "CAA"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchDns} disabled={loading} className="w-full md:w-auto">
            {loading ? "Looking up..." : "Lookup"}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border-destructive/20 border rounded-md">
            {error}
          </div>
        )}

        {results !== null && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 font-medium text-sm text-muted-foreground border-b border-border">Name</th>
                  <th className="p-3 font-medium text-sm text-muted-foreground border-b border-border">TTL</th>
                  <th className="p-3 font-medium text-sm text-muted-foreground border-b border-border">Data</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No records found</td></tr>
                ) : (
                  results.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono text-sm">{r.name}</td>
                      <td className="p-3 font-mono text-sm">{r.TTL}</td>
                      <td className="p-3 font-mono text-sm break-all">{r.data}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
