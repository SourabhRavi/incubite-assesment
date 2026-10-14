import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChartNoAxesCombined,
  Users,
  Wallet,
} from "lucide-react"

const countries = [
  { name: "India", currency: "INR" },
  { name: "United States", currency: "USD" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Germany", currency: "EUR" },
  { name: "Canada", currency: "CAD" },
] as const

type Country = (typeof countries)[number]

type EmployeeSample = {
  jobTitle: string
  country: string
  salary: number
  currency: string
}

const sampleEmployees: EmployeeSample[] = [
  {
    jobTitle: "Frontend Developer",
    country: "India",
    salary: 1850000,
    currency: "INR",
  },
  {
    jobTitle: "Full Stack Developer",
    country: "India",
    salary: 2100000,
    currency: "INR",
  },
  {
    jobTitle: "Software Engineer",
    country: "India",
    salary: 1650000,
    currency: "INR",
  },
  {
    jobTitle: "Backend Developer",
    country: "India",
    salary: 1950000,
    currency: "INR",
  },
  {
    jobTitle: "Product Manager",
    country: "United States",
    salary: 142000,
    currency: "USD",
  },
  {
    jobTitle: "Backend Developer",
    country: "United Kingdom",
    salary: 78500,
    currency: "GBP",
  },
  {
    jobTitle: "Software Engineer",
    country: "Germany",
    salary: 82000,
    currency: "EUR",
  },
  {
    jobTitle: "Data Analyst",
    country: "Canada",
    salary: 91500,
    currency: "CAD",
  },
]

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string
  value: string
  detail: string
  icon: typeof Users
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </section>
  )
}

export default function OverviewPage() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])

  const employees = sampleEmployees.filter(
    (employee) => employee.country === selectedCountry.name
  )

  const salaries = employees.map((employee) => employee.salary)
  const average =
    salaries.length > 0
      ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length
      : null

  const min = salaries.length > 0 ? Math.min(...salaries) : null
  const max = salaries.length > 0 ? Math.max(...salaries) : null

  const jobSummaries = Object.values(
    employees.reduce<
      Record<string, { jobTitle: string; count: number; total: number }>
    >((groups, employee) => {
      const current = groups[employee.jobTitle] ?? {
        jobTitle: employee.jobTitle,
        count: 0,
        total: 0,
      }

      current.count += 1
      current.total += employee.salary
      groups[employee.jobTitle] = current

      return groups
    }, {})
  ).sort((a, b) => a.jobTitle.localeCompare(b.jobTitle))

  const money = (value: number | null) =>
    value === null ? "—" : formatMoney(value, selectedCountry.currency)

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            People overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your workforce and salary distribution.
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
          Country
          <select
            value={selectedCountry.name}
            onChange={(event) => {
              const country = countries.find(
                (item) => item.name === event.target.value
              )
              if (country) setSelectedCountry(country)
            }}
            className="h-9 min-w-48 rounded-lg border bg-background px-3 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Employees"
          value={String(employees.length)}
          detail={`Sample records in ${selectedCountry.name}`}
          icon={Users}
        />
        <MetricCard
          title="Minimum salary"
          value={money(min)}
          detail="Annual compensation"
          icon={ArrowDown}
        />
        <MetricCard
          title="Average salary"
          value={money(average)}
          detail="Annual compensation"
          icon={ChartNoAxesCombined}
        />
        <MetricCard
          title="Maximum salary"
          value={money(max)}
          detail="Annual compensation"
          icon={Wallet}
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Average salary by job title
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compensation grouped by role in {selectedCountry.name}.
            </p>
          </div>
          <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            Sample data
          </span>
        </div>

        {jobSummaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-muted/35 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Job title</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Employees
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Average salary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobSummaries.map((summary) => (
                  <tr key={summary.jobTitle} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-medium">
                      {summary.jobTitle}
                    </td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">
                      {summary.count}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                      {formatMoney(
                        summary.total / summary.count,
                        selectedCountry.currency
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No sample employee records for this country.
          </div>
        )}

        <div className="flex items-center gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
          <ArrowUp className="size-3.5" />
          Salary values are annual and displayed in the selected country’s
          currency.
        </div>
      </section>
    </div>
  )
}
