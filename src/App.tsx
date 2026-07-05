import { Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { tools } from "@/tools"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"

function Home() {
  return (
    <div className="w-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-medium tracking-wider dark:text-gray-100">Developer Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mt-2">
            A collection of useful developer tools that run entirely in your
            browser. Your data never leaves your device.
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
                <h2 className="font-semibold text-foreground">{tool.title}</h2>
                <Icon icon="ph:arrow-right" className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
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
            <Icon icon="ph:github-logo" className="size-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="tools-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            {tools.map((tool) => {
              const Component = tool.component
              return (
                <Route
                  key={tool.slug}
                  path={tool.slug}
                  element={
                    <Suspense fallback={<div className="p-8 animate-pulse text-muted-foreground">Loading tool...</div>}>
                      <Component />
                    </Suspense>
                  }
                />
              )
            })}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
