import { useState } from "react"
import { Outlet, useLocation } from "react-router"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import AppSidebar from "@/components/app-sidebar.tsx"

const pageTitles: Record<string, string> = {
  "/overview": "Overview",
  "/employees": "Employees",
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? "PeopleOps"
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid rendering a theme-dependent icon until the first client render.
  if (!mounted) {
    setMounted(true)
  }

  const isDark = theme === "dark"

  return (
    <div className="min-h-svh bg-background lg:flex">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-8">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              PeopleOps / {title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {isDark ? "Dark mode" : "Light mode"}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
