import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/common/ToolLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function NotificationTesterTool() {
  const [title, setTitle] = useState("Hello from Dev Tools")
  const [body, setBody] = useState("This is a test notification to verify that notifications are working.")
  const [delay, setDelay] = useState(0)
  const [permission, setPermission] = useState(Notification.permission)

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification")
      return
    }
    const perm = await Notification.requestPermission()
    setPermission(perm)
  }

  const sendNotification = () => {
    if (permission === "granted") {
      if (delay > 0) {
        setTimeout(() => {
          new Notification(title, { body })
        }, delay * 1000)
      } else {
        new Notification(title, { body })
      }
    } else if (permission !== "denied") {
      requestPermission().then(() => {
        if (Notification.permission === "granted") {
          sendNotification()
        }
      })
    }
  }

  return (
    <ToolLayout 
      title="Notification Tester" 
      description="Test browser notifications with permission handling and delayed notifications."
    >
      <div className="flex flex-col gap-8 max-w-xl mx-auto mt-8">
        
        <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
          <div className="flex flex-col">
            <span className="font-semibold">Current Permission</span>
            <span className="text-sm text-muted-foreground">
              {permission === "granted" ? "✅ Granted" : permission === "denied" ? "❌ Denied" : "⚠️ Default (Unprompted)"}
            </span>
          </div>
          {permission !== "granted" && (
            <Button variant="outline" onClick={requestPermission}>Request Permission</Button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="body">Notification Body</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="resize-none" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="delay">Delay (seconds)</Label>
            <Input id="delay" type="number" min="0" value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
          </div>
          
          <Button onClick={sendNotification} className="w-full" disabled={permission === "denied"}>
            Send Notification {delay > 0 && `in ${delay}s`}
          </Button>
        </div>

      </div>
    </ToolLayout>
  )
}
