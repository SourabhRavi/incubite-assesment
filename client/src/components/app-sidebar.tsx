import { NavLink } from "react-router"
import { ChartNoAxesCombined, Command, Users } from "lucide-react"

const navigation = [
  {
    label: "Overview",
    to: "/overview",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Employees",
    to: "/employees",
    icon: Users,
  },
]

export default function AppSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-card lg:min-h-screen lg:w-60 lg:border-r lg:border-b-0">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Command className="size-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-bold tracking-tight">
            PeopleOps
          </p>
          <p className="text-xs text-muted-foreground">Salary management</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:gap-1 lg:py-6">
        <p className="hidden px-3 pb-2 text-[11px] font-semibold tracking-widest text-muted-foreground lg:block">
          WORKSPACE
        </p>

        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden border-t p-4 lg:block">
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-background text-xs font-semibold">
            HR
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">HR Manager</p>
            <p className="truncate text-xs text-muted-foreground">
              People team
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
