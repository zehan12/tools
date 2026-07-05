import { Link, useLocation } from "react-router-dom"
import { useTheme } from "@/providers/theme-provider"
import { tools, Category } from "@/tools"
import { Icon } from "@iconify/react"
import { useTranslation } from "react-i18next"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

export function Sidebar() {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()

  const categories = Object.values(Category).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    tools: tools.filter(t => t.category === category)
  })).filter(c => c.tools.length > 0)

  return (
    <aside className="sticky top-0 hidden sm:grid h-screen p-3 pe-0 basis-72 lg:basis-80">
      <div className="flex flex-col h-full bg-white dark:bg-[#111] outline outline-border px-4 py-3 overflow-hidden transition-colors">
        <div className="flex items-center justify-between shrink-0">
          <Link to="/" className="text-xl font-medium uppercase tracking-wider text-gray-900 dark:text-gray-100">
            Tools
          </Link>
          <div className="flex items-center gap-1">
            <Select value={i18n.resolvedLanguage || 'en'} onValueChange={(val) => i18n.changeLanguage(val as string)}>
              <SelectTrigger 
                className="h-8 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-0 shadow-none px-2 w-fit" 
                size="sm"
                aria-label={t('sidebar.languageToggle')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span className="uppercase text-xs font-bold">{lang.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={t('sidebar.themeToggle')}
            >
              <Icon icon={theme === 'dark' ? 'ph:sun' : 'ph:moon'} className="size-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs tracking-wide text-gray-600 mb-4 mt-2 shrink-0">
          <span>{t('sidebar.by')} <a className="underline hover:text-gray-900 dark:hover:text-gray-100 transition-colors" target="_blank" href="https://zehan">zehan</a></span>
          <span>•</span>
          <a className="underline hover:text-gray-900 dark:hover:text-gray-100 transition-colors" target="_blank" href="/llm.txt">llm.txt</a>
        </div>

        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }}
          className="group flex items-center justify-between w-full px-2 py-1.5 mb-4 text-sm text-muted-foreground bg-muted/30 outline outline-border hover:bg-muted/50 transition-colors shrink-0"
          aria-label={t('app.searchTools')}
        >
          <span className="flex items-center gap-2">
            <Icon icon="ph:magnifying-glass" className="size-4" />
            {t('app.searchPlaceholder')}
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 bg-muted/50 outline outline-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
        <nav className="space-y-6 mt-2 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {categories.map(category => (
            <div key={category.name} className="space-y-1">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t(`categories.${category.name}`, category.name)}
              </h3>
              <div className="-mx-2 space-y-0.5">
                {category.tools.map(tool => {
                  const isActive = location.pathname === `/${tool.slug}`
                  return (
                    <Link
                      key={tool.slug}
                      to={`/${tool.slug}`}
                      className={`block px-2 py-1 text-sm transition-colors ${isActive ? 'text-foreground bg-muted/50 outline outline-border' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    >
                      {tool.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
