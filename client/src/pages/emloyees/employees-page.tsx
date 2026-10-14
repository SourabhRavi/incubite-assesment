import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"

import { useEmployees } from "@/features/employees/employee-queries"
import {
  COUNTRIES,
  COUNTRY_CURRENCIES,
  JOB_TITLES,
} from "@/features/employees/employee-types"
import type {
  Country,
  Employee,
  EmployeeFilters,
  JobTitle,
} from "@/features/employees/employee-types"
import EmployeeDialog from "@/features/employees/employee-dialog.tsx"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const SEARCH_DEBOUNCE_MS = 300

const formatSalary = (salary: number | string, currency?: string) => {
  const amount = Number(salary)

  if (!Number.isFinite(amount)) {
    return String(salary)
  }

  return new Intl.NumberFormat("en-IN", {
    style: currency ? "currency" : "decimal",
    ...(currency ? { currency } : {}),
    maximumFractionDigits: 2,
  }).format(amount)
}

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

type EmployeeSearchProps = {
  initialValue: string
  onSearch: (value: string) => void
}

const EmployeeSearch = ({ initialValue, onSearch }: EmployeeSearchProps) => {
  const [value, setValue] = useState(initialValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  const handleChange = (nextValue: string) => {
    setValue(nextValue)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(nextValue.trim())
    }, SEARCH_DEBOUNCE_MS)
  }

  return (
    <input
      type="search"
      aria-label="Search employees by name or email"
      placeholder="Search by name or email..."
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
    />
  )
}

const EmployeeRow = ({ employee }: { employee: Employee }) => (
  <tr className="border-b last:border-0 hover:bg-muted/40">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {getInitials(employee.fullName)}
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium">{employee.fullName}</p>
          <p className="truncate text-sm text-muted-foreground">
            {employee.email}
          </p>
        </div>
      </div>
    </td>

    <td className="px-5 py-4">
      <span className="text-sm">{employee.jobTitle}</span>
    </td>

    <td className="px-5 py-4 text-sm">{employee.country}</td>

    <td className="px-5 py-4 text-right text-sm font-medium tabular-nums">
      {formatSalary(employee.salary, COUNTRY_CURRENCIES[employee.country])}
    </td>
  </tr>
)

const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const parsedLimit = Number(searchParams.get("limit")) || 20
  const limit = PAGE_SIZE_OPTIONS.includes(parsedLimit) ? parsedLimit : 20

  const country = searchParams.get("country") || ""
  const jobTitle = searchParams.get("jobTitle") || ""
  const search = searchParams.get("search") || ""

  const filters: EmployeeFilters = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(country ? { country: country as Country } : {}),
    ...(jobTitle ? { jobTitle: jobTitle as JobTitle } : {}),
  }

  const { data, isPending, isError, error, isFetching, refetch } =
    useEmployees(filters)

  const updateParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      } else {
        nextParams.delete(key)
      }
    })

    setSearchParams(nextParams)
  }

  const updateSearch = (nextSearch: string) => {
    const currentSearch = searchParams.get("search") || ""

    if (nextSearch === currentSearch) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)

    if (nextSearch) {
      nextParams.set("search", nextSearch)
    } else {
      nextParams.delete("search")
    }

    nextParams.delete("page")
    setSearchParams(nextParams)
  }

  const updateFilter = (key: "country" | "jobTitle", value: string) => {
    updateParams({
      [key]: value,
      page: "",
    })
  }

  const clearFilters = () => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      nextParams.delete("search")
      nextParams.delete("country")
      nextParams.delete("jobTitle")
      nextParams.delete("page")

      return nextParams
    })
  }

  const pagination = data?.pagination
  const employees = data?.data ?? []
  const hasFilters = Boolean(search || country || jobTitle)

  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">People management</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Employees
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your employee directory and salary information.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4">
          <div>
            <h2 className="font-semibold">Employee directory</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pagination
                ? `${pagination.total.toLocaleString()} employees found`
                : "Browse and filter employees"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_200px_220px_auto]">
            <EmployeeSearch
              key={search}
              initialValue={search}
              onSearch={updateSearch}
            />

            <select
              aria-label="Filter by country"
              value={country}
              onChange={(event) => updateFilter("country", event.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All countries</option>
              {COUNTRIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by job title"
              value={jobTitle}
              onChange={(event) => updateFilter("jobTitle", event.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All job titles</option>
              {JOB_TITLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {isError && (
          <div
            role="alert"
            className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          >
            <p className="font-medium">Couldn't load employees</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred."}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Job title</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 text-right font-medium">Salary</th>
              </tr>
            </thead>

            <tbody>
              {isPending &&
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-b">
                    <td colSpan={4} className="px-5 py-5">
                      <div className="h-5 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}

              {!isPending && !isError && employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <p className="font-medium">No employees found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing or clearing your filters.
                    </p>
                  </td>
                </tr>
              )}

              {!isPending &&
                !isError &&
                employees.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} />
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="page-size">Rows per page</label>

            <select
              id="page-size"
              value={limit}
              onChange={(event) =>
                updateParams({
                  limit: event.target.value,
                  page: "",
                })
              }
              className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-sm text-muted-foreground">
              Page {pagination?.page ?? page} of {pagination?.totalPages ?? 0}
            </p>

            <button
              type="button"
              disabled={!pagination?.hasPreviousPage || isFetching}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!pagination?.hasNextPage || isFetching}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
      <EmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </main>
  )
}

export default EmployeesPage
