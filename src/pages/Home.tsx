import { tools } from "@/config/tools"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import { SEO } from "@/components/common/SEO"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Category } from "@/types/tools"

export function Home() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  
  const categories = ["All", ...Object.values(Category)]

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory
    const title = t(`tools.${tool.slug}.title`, tool.title).toLowerCase()
    const desc = t(`tools.${tool.slug}.description`, tool.description).toLowerCase()
    const q = search.toLowerCase()
    const matchesSearch = title.includes(q) || desc.includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="w-full">
      <SEO />
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-medium tracking-wider dark:text-gray-100">{t('app.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mt-2">
            {t('app.description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs flex items-center">
            <Icon icon="ph:magnifying-glass" className="absolute left-3 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t('app.searchPlaceholder', "Search tools...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <Icon icon="ph:x" className="size-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-none items-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {cat === "All" ? t('app.all', "All") : t(`categories.${cat}`, cat.charAt(0).toUpperCase() + cat.slice(1))}
                {selectedCategory === cat && cat !== "All" && (
                  <Icon icon="ph:x" className="size-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Icon icon="ph:magnifying-glass" className="size-12 mx-auto mb-4 opacity-20" />
            <p>{t('app.noResults', "No results found.")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredTools.map((tool) => (
              <Link
                key={tool.slug}
                to={`/${tool.slug}`}
                className="group block space-y-2 p-4 outline outline-border hover:outline-ring/50 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{t(`tools.${tool.slug}.title`, tool.title)}</h2>
                  <Icon aria-hidden="true" icon="ph:arrow-right" className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`tools.${tool.slug}.description`, tool.description)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 pt-4">
          <a
            href="https://github.com/zehan12/tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <Icon aria-hidden="true" icon="ph:github-logo" className="size-4" />
            {t('app.viewOnGithub')}
          </a>
          <a
            href="/llm.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <Icon aria-hidden="true" icon="ph:file-text" className="size-4" />
            llm.txt
          </a>
        </div>
      </div>
    </div>
  )
}
