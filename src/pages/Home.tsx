import { tools } from "@/tools"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import { SEO } from "@/components/common/SEO"
import { useTranslation } from "react-i18next"

export function Home() {
  const { t } = useTranslation()
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

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {tools.map((tool) => (
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

        <div className="flex pt-4">
          <a
            href="https://github.com/scmmishra/tools.zehan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <Icon aria-hidden="true" icon="ph:github-logo" className="size-4" />
            {t('app.viewOnGithub')}
          </a>
        </div>
      </div>
    </div>
  )
}
