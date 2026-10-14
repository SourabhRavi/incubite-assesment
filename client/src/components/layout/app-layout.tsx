import { Outlet, useLocation } from "react-router"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"

const pageTitles: Record<string, string> = {
  "/overview": "Overview",
  "/employees": "Employees",
}

const AppLayout = () => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? "PeopleOps"
  const isEmployeesPage = pathname === "/employees"

  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <SidebarProvider
      defaultOpen={true}
      // className="h-svh! min-h-0! w-full overflow-hidden bg-background"
    >
      <AppSidebar />

      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-x-hidden overflow-y-auto bg-background md:overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-3 backdrop-blur-xl supports-backdrop-filter:bg-background/70 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger
              className="shrink-0"
              aria-label="Toggle navigation sidebar"
              title="Toggle navigation sidebar"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{title}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                PeopleOps / {title}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* <span className="hidden text-xs text-muted-foreground sm:inline">
              {isDark ? "Dark mode" : "Light mode"}
            </span> */}

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

        <div
          className={
            isEmployeesPage
              ? "mx-auto w-full max-w-7xl md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden"
              : "mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          }
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppLayout
