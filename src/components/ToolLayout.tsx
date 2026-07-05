import type { ReactNode } from "react"

interface ToolLayoutProps {
  title: string
  description: string
  children: ReactNode
  onClear?: () => void
  maxWidth?: string
}

export function ToolLayout({ title, description, children, onClear, maxWidth = "w-full" }: ToolLayoutProps) {
  return (
    <div className={`${maxWidth} flex flex-col grow gap-6 justify-between`}>
      <section className="space-y-6 grow flex flex-col">
        <div>
          <h1 className="text-xl font-medium tracking-wider truncate">
            {title}
          </h1>
          <div className="text-gray-600 dark:text-gray-400 max-w-xl mt-2">
            <p>{description}</p>
          </div>
        </div>
        {children}
      </section>

      {onClear && (
        <div>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
            </svg>
            Clear saved data
          </button>
        </div>
      )}
    </div>
  )
}
