import { useMemo, useState } from "react"
import { Search, UserRoundPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
]

const JOB_TITLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "QA Engineer",
  "DevOps Engineer",
  "Data Analyst",
  "Product Manager",
  "Engineering Manager",
  "UI/UX Designer",
]

type Employee = {
  id: string
  fullName: string
  email: string
  jobTitle: string
  country: string
  salary: number
  currency: string
}

const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    fullName: "Aarav Sharma",
    email: "aarav.sharma@citadel.dev",
    jobTitle: "Frontend Developer",
    country: "India",
    salary: 1850000,
    currency: "INR",
  },
  {
    id: "emp-002",
    fullName: "Mia Johnson",
    email: "mia.johnson@citadel.dev",
    jobTitle: "Product Manager",
    country: "United States",
    salary: 142000,
    currency: "USD",
  },
  {
    id: "emp-003",
    fullName: "Oliver Smith",
    email: "oliver.smith@citadel.dev",
    jobTitle: "Backend Developer",
    country: "United Kingdom",
    salary: 78500,
    currency: "GBP",
  },
  {
    id: "emp-004",
    fullName: "Sofia Müller",
    email: "sofia.muller@citadel.dev",
    jobTitle: "Software Engineer",
    country: "Germany",
    salary: 82000,
    currency: "EUR",
  },
  {
    id: "emp-005",
    fullName: "Noah Martin",
    email: "noah.martin@citadel.dev",
    jobTitle: "Data Analyst",
    country: "Canada",
    salary: 91500,
    currency: "CAD",
  },
  {
    id: "emp-006",
    fullName: "Ananya Verma",
    email: "ananya.verma@citadel.dev",
    jobTitle: "Full Stack Developer",
    country: "India",
    salary: 2100000,
    currency: "INR",
  },
  {
    id: "emp-007",
    fullName: "Kabir Mehta",
    email: "kabir.mehta@citadel.dev",
    jobTitle: "Software Engineer",
    country: "India",
    salary: 1650000,
    currency: "INR",
  },
]

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [country, setCountry] = useState("all")
  const [jobTitle, setJobTitle] = useState("all")
  const [page, setPage] = useState(1)

  const pageSize = 5

  const employees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return SAMPLE_EMPLOYEES.filter((employee) => {
      const matchesSearch =
        !normalizedSearch ||
        `${employee.fullName} ${employee.email}`
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesCountry = country === "all" || employee.country === country

      const matchesJobTitle =
        jobTitle === "all" || employee.jobTitle === jobTitle

      return matchesSearch && matchesCountry && matchesJobTitle
    })
  }, [search, country, jobTitle])

  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const visibleEmployees = employees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  function clearFilters() {
    setSearch("")
    setCountry("all")
    setJobTitle("all")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Employee directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search and review employee records and compensation.
          </p>
        </div>

        <Button
          onClick={() =>
            window.alert("Employee creation will be added in the next step.")
          }
        >
          <UserRoundPlus data-icon="inline-start" />
          Add employee
        </Button>
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 xl:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search name or email..."
              className="pl-9"
              aria-label="Search employees"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="employee-country">
              Filter by country
            </label>
            <select
              id="employee-country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value)
                setPage(1)
              }}
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All countries</option>
              {COUNTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="employee-job-title">
              Filter by job title
            </label>
            <select
              id="employee-job-title"
              value={jobTitle}
              onChange={(event) => {
                setJobTitle(event.target.value)
                setPage(1)
              }}
              className="h-9 max-w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All job titles</option>
              {JOB_TITLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {(search || country !== "all" || jobTitle !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/35 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Job title</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 text-right font-medium">Salary</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {visibleEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{employee.fullName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {employee.email}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">{employee.jobTitle}</td>
                  <td className="px-5 py-3.5">{employee.country}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                    {formatMoney(employee.salary, employee.currency)}
                  </td>
                </tr>
              ))}

              {visibleEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <Users className="mx-auto size-8 text-muted-foreground/60" />
                    <p className="mt-3 text-sm font-medium">
                      No employees found
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try another search or change your filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {employees.length === 0
              ? "No results"
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  employees.length
                )} of ${employees.length} employees`}
            {" · Sample data"}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>

            <span className="min-w-20 text-center text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
