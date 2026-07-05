import { Link, useLocation } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { tools, Category } from "@/tools"
import { Icon } from "@iconify/react"

export function Sidebar() {
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const categories = Object.values(Category).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    tools: tools.filter(t => t.category === category)
  })).filter(c => c.tools.length > 0)

  return (
    <aside className="sticky top-0 hidden sm:grid h-screen p-3 pr-0 basis-72 lg:basis-80">
      <div className="flex flex-col h-full bg-white dark:bg-[#111] outline outline-border px-4 py-3 overflow-hidden transition-colors">
        <div className="flex items-center justify-between shrink-0">
          <Link to="/" className="text-xl font-medium uppercase tracking-wider text-gray-900 dark:text-gray-100">
            Tools
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Icon icon={theme === 'dark' ? 'ph:sun' : 'ph:moon'} className="size-5" />
          </button>
        </div>
        <span className="text-xs tracking-wide text-gray-600 mb-4 shrink-0">
          by <a className="underline" target="_blank" href="https://zehan">zehan</a>
        </span>

        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }}
          className="group flex items-center justify-between w-full px-2 py-1.5 mb-4 text-sm text-muted-foreground bg-muted/30 outline outline-border hover:bg-muted/50 transition-colors shrink-0"
        >
          <span className="flex items-center gap-2">
            <Icon icon="ph:magnifying-glass" className="size-4" />
            Search...
          </span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 bg-muted/50 outline outline-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
        <nav className="space-y-6 mt-2 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {categories.map(category => (
            <div key={category.name} className="space-y-1">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {category.name}
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
