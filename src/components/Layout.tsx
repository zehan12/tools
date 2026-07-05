import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { CommandPalette } from "./CommandPalette"
import { useTranslation } from "react-i18next"

export function Layout() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap bg-gray-50 dark:bg-[#111]/10 font-mono text-gray-900 dark:text-gray-100 transition-colors">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black outline outline-border"
      >
        {t('app.skipToContent')}
      </a>
      <Sidebar />
      <main
        id="main-content"
        className="basis-0 grow-999 min-h-screen p-3 flex flex-col"
        style={{ minInlineSize: "60%" }}
      >
        <div className="bg-white dark:bg-[#111] outline outline-border dark:outline flex-grow px-4 py-3 transition-colors flex flex-col">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
