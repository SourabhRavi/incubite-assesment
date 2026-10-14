import { useQuery } from "@tanstack/react-query"

import { analyticsApi } from "@/features/analytics/analytics-api"
import type { Country } from "@/features/employees/employee-types"

export const analyticsKeys = {
  all: ["analytics"] as const,
  salarySummary: (country: Country) =>
    [...analyticsKeys.all, "salary-summary", country] as const,
  jobTitleAverages: (country: Country) =>
    [...analyticsKeys.all, "job-title-average", country] as const,
}

export const useSalarySummary = (country: Country) =>
  useQuery({
    queryKey: analyticsKeys.salarySummary(country),
    queryFn: () => analyticsApi.getSalarySummary(country),
  })

export const useJobTitleAverages = (country: Country) =>
  useQuery({
    queryKey: analyticsKeys.jobTitleAverages(country),
    queryFn: () => analyticsApi.getJobTitleAverages(country),
  })
