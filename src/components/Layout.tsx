import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { CommandPalette } from "./CommandPalette"

export function Layout() {
  return (
    <div className="flex flex-wrap bg-gray-50 dark:bg-[#111]/10 font-mono text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar />
      <main
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
