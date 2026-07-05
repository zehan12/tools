import { Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { tools } from "@/tools"
import { RootProvider } from "@/providers/RootProvider"
import { Home } from "@/pages/Home"

function App() {
  return (
    <RootProvider>
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
    </RootProvider>
  )
}

export default App
