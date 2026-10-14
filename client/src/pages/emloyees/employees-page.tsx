import { useState } from "react"
import { useSearchParams } from "react-router"
import {
  Eye,
  FilterX,
  MoreVertical,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react"

import EmployeeDialog from "@/features/employees/employee-dialog"
import DeleteEmployeeDialog from "@/features/employees/delete-employee-dialog"
import EmployeeDetailsDialog from "@/features/employees/employee-details-dialog"
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Input } from "@/components/ui/input.tsx"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

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

type EmployeeRowProps = {
  employee: Employee
  onView: (employee: Employee) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

const EmployeeRow = ({
  employee,
  onView,
  onEdit,
  onDelete,
}: EmployeeRowProps) => (
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

    <td className="px-5 py-4 text-right">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            aria-label={`Actions for ${employee.fullName}`}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onView(employee)}>
            <Eye className="mr-2 size-4" />
            View details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onEdit(employee)}>
            <Pencil className="mr-2 size-4" />
            Edit employee
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => onDelete(employee)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete employee
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </tr>
)

const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get("search") ?? ""

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >()
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const parsedLimit = Number(searchParams.get("limit")) || 20
  const limit = PAGE_SIZE_OPTIONS.includes(parsedLimit) ? parsedLimit : 20

  const country = searchParams.get("country") || ""
  const jobTitle = searchParams.get("jobTitle") || ""

  const filters: EmployeeFilters = {
    page,
    limit,
    ...(country ? { country: country as Country } : {}),
    ...(jobTitle ? { jobTitle: jobTitle as JobTitle } : {}),
  }

  const { data, isPending, isError, error, isFetching, refetch } =
    useEmployees(filters)

  const updateParams = (
    updates: Record<string, string>,
    options?: { replace?: boolean }
  ) => {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      } else {
        nextParams.delete(key)
      }
    })

    setSearchParams(nextParams, options)
  }

  const updateFilter = (key: "country" | "jobTitle", value: string) => {
    updateParams({
      [key]: value,
      page: "",
    })
  }

  const openViewDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const openAddDialog = () => {
    setSelectedEmployee(undefined)
    setIsEmployeeDialogOpen(true)
  }

  const pagination = data?.pagination
  const employees = data?.data ?? []

  return (
    <main className="flex min-h-0 flex-col gap-6 p-4 md:h-full md:overflow-hidden md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* <p className="text-sm text-muted-foreground/60">People management</p> */}

          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={openAddDialog}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <section className="flex min-h-0 flex-col rounded-xl border bg-card md:flex-1 md:overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative">
            <h2 className="font-semibold">Employee directory</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {pagination
                ? `${pagination.total.toLocaleString()} employees found`
                : "Browse and filter employees"}
            </p>

            {(country || jobTitle || search) && (
              <button
                type="button"
                aria-label="Clear filters"
                title="Clear filters"
                onClick={() =>
                  updateParams({
                    country: "",
                    jobTitle: "",
                    search: "",
                    page: "",
                  })
                }
                className="absolute top-0 right-0 inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FilterX className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                type="search"
                aria-label="Search employees"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) =>
                  updateParams(
                    {
                      search: event.target.value,
                      page: "",
                    },
                    { replace: true }
                  )
                }
                className="h-9 pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    updateParams({ search: "", page: "" }, { replace: true })
                  }
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
            </div>

            <NativeSelect
              aria-label="Filter by country"
              value={country}
              onChange={(event) => updateFilter("country", event.target.value)}
              className="w-full sm:w-44"
            >
              <NativeSelectOption value="">All countries</NativeSelectOption>

              {COUNTRIES.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              aria-label="Filter by job title"
              value={jobTitle}
              onChange={(event) => updateFilter("jobTitle", event.target.value)}
              className="w-full sm:w-48"
            >
              <NativeSelectOption value="">All job titles</NativeSelectOption>

              {JOB_TITLES.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>
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

        <div className="overflow-x-auto md:min-h-0 md:flex-1 md:overflow-auto">
          <table className="w-full min-w-212.5 text-left">
            <thead className="bg-background/80 text-xs tracking-wide text-muted-foreground uppercase md:sticky md:top-0 md:z-10 md:border-b md:border-border/50 md:shadow-sm md:backdrop-blur-xl">
              <tr>
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Job title</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 text-right font-medium">Salary</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isPending &&
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-b">
                    <td colSpan={5} className="px-5 py-5">
                      <div className="h-5 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}

              {!isPending && !isError && employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
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
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    onView={openViewDialog}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="page-size">Rows per page</label>

            <NativeSelect
              id="page-size"
              aria-label="Rows per page"
              value={String(limit)}
              onChange={(event) => {
                updateParams({
                  limit: event.target.value,
                  page: "",
                })
              }}
              className="w-21"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <NativeSelectOption key={size} value={String(size)}>
                  {size}
                </NativeSelectOption>
              ))}
            </NativeSelect>
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

      <EmployeeDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        employee={selectedEmployee}
      />

      <EmployeeDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
        employee={selectedEmployee}
      />

      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={selectedEmployee}
      />
    </main>
  )
}

export default EmployeesPage
