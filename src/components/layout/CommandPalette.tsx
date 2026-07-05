import { useState, useEffect } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Icon } from "@iconify/react"
import { useNavigate } from "react-router-dom"
import { tools } from "@/config/tools"
import { useTranslation } from "react-i18next"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

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
      <CommandInput placeholder={t('app.searchPlaceholder')} />
      <CommandList>
        <CommandEmpty>{t('app.noResults')}</CommandEmpty>
        <CommandGroup heading={t('app.searchTools')}>
          {tools.map((tool) => (
            <CommandItem
              key={tool.slug}
              onSelect={() => {
                navigate(`/${tool.slug}`)
                setOpen(false)
              }}
            >
              <Icon aria-hidden="true" icon={tool.icon || "carbon:tool"} className="me-2 h-4 w-4" />
              <span>{t(`tools.${tool.slug}.title`, tool.title)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
