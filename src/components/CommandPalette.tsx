import { useState, useEffect } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { tools } from "@/tools"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tools..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Tools">
          {tools.map((tool) => (
            <CommandItem
              key={tool.slug}
              onSelect={() => {
                navigate(`/${tool.slug}`)
                setOpen(false)
              }}
            >
              <Icon aria-hidden="true" icon={tool.icon || "carbon:tool"} className="mr-2 h-4 w-4" />
              <span>{tool.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
