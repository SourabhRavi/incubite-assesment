import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChartNoAxesCombined,
  LoaderCircle,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react"

import {
  useJobTitleAverages,
  useSalarySummary,
} from "@/features/analytics/analytics-queries"
import {
  COUNTRIES,
  COUNTRY_CURRENCIES,
  type Country,
} from "@/features/employees/employee-types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"

const formatMoney = (
  value: number | string | null | undefined,
  currency: string
) => {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return "—"
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

type MetricCardProps = {
  title: string
  value: string
  detail: string
  icon: typeof Users
  isLoading?: boolean
}

const MetricCard = ({
  title,
  value,
  detail,
  icon: Icon,
  isLoading = false,
}: MetricCardProps) => (
  <section className="rounded-xl border bg-card p-5 shadow-xs">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>

      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-[18px]" />
      </span>
    </div>

    <div className="mt-4 flex min-h-8 items-center">
      {isLoading ? (
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <p className="font-heading text-2xl font-semibold tracking-tight">
          {value}
        </p>
      )}
    </div>

    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
  </section>
)

const OverviewPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])

  const {
    data: salarySummary,
    isPending: isSummaryPending,
    isError: isSummaryError,
    error: summaryError,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useSalarySummary(selectedCountry)

  const {
    data: jobAverages,
    isPending: areJobAveragesPending,
    isError: areJobAveragesError,
    error: jobAveragesError,
    isFetching: areJobAveragesFetching,
    refetch: refetchJobAverages,
  } = useJobTitleAverages(selectedCountry)

  const isRefreshing = isSummaryFetching || areJobAveragesFetching

  const currency =
    salarySummary?.currency ??
    jobAverages?.currency ??
    COUNTRY_CURRENCIES[selectedCountry]

  const money = (value: number | string | null | undefined) =>
    formatMoney(value, currency)

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchJobAverages()])
  }

  const jobSummaries = jobAverages?.data ?? []

  const summaryErrorMessage =
    summaryError instanceof Error
      ? summaryError.message
      : "An unexpected error occurred."

  const jobAveragesErrorMessage =
    jobAveragesError instanceof Error
      ? jobAveragesError.message
      : "An unexpected error occurred."

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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Country
          </label>

          <Select
            value={selectedCountry}
            onValueChange={(value) => {
              if (value) {
                setSelectedCountry(value as Country)
              }
            }}
          >
            <SelectTrigger className="h-9 w-full min-w-48 sm:w-48">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>

            <SelectContent align="start">
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {isSummaryError && (
        <section
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="font-medium">Couldn't load salary statistics</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {summaryErrorMessage}
          </p>

          <button
            type="button"
            onClick={() => void refetchSummary()}
            className="mt-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Retry
          </button>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Employees"
          value={String(salarySummary?.employeeCount ?? 0)}
          detail={`Active employees in ${selectedCountry}`}
          icon={Users}
          isLoading={isSummaryPending}
        />

        <MetricCard
          title="Minimum salary"
          value={money(salarySummary?.minSalary)}
          detail="Annual compensation"
          icon={ArrowDown}
          isLoading={isSummaryPending}
        />

        <MetricCard
          title="Average salary"
          value={money(salarySummary?.averageSalary)}
          detail="Annual compensation"
          icon={ChartNoAxesCombined}
          isLoading={isSummaryPending}
        />

        <MetricCard
          title="Maximum salary"
          value={money(salarySummary?.maxSalary)}
          detail="Annual compensation"
          icon={Wallet}
          isLoading={isSummaryPending}
        />
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Average salary by job title
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Compensation grouped by role in {selectedCountry}.
            </p>
          </div>

          <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            Live data
          </span>
        </div>

        {areJobAveragesError ? (
          <div role="alert" className="px-5 py-10 text-center">
            <p className="font-medium">Couldn't load job-title averages</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {jobAveragesErrorMessage}
            </p>

            <button
              type="button"
              onClick={() => void refetchJobAverages()}
              className="mt-4 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        ) : areJobAveragesPending ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading salary breakdown...
          </div>
        ) : jobSummaries.length > 0 ? (
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
                  <tr
                    key={summary.jobTitle}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {summary.jobTitle}
                    </td>

                    <td className="px-5 py-3.5 text-right text-muted-foreground tabular-nums">
                      {summary.employeeCount.toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                      {money(summary.averageSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="font-medium">No employee data available</p>

            <p className="mt-1 text-sm text-muted-foreground">
              There are no active employees for {selectedCountry} yet.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
          <ArrowUp className="size-3.5" />
          Salary values are annual and displayed in{" "}
          {COUNTRY_CURRENCIES[selectedCountry]}.
        </div>
      </section>
    </div>
  )
}

export default OverviewPage
