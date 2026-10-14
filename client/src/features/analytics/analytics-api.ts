import { api } from "@/lib/api"
import type { ApiResponse, Country } from "@/features/employees/employee-types"

export type SalaryValue = number | string | null

export type SalarySummary = {
  country: Country
  currency: string
  employeeCount: number
  minSalary: SalaryValue
  maxSalary: SalaryValue
  averageSalary: SalaryValue
}

export type JobTitleSalaryAverage = {
  jobTitle: string
  employeeCount: number
  averageSalary: SalaryValue
}

export type JobTitleAverages = {
  country: Country
  currency: string
  data: JobTitleSalaryAverage[]
}

export const analyticsApi = {
  getSalarySummary: async (country: Country): Promise<SalarySummary> => {
    const response = await api.get<ApiResponse<SalarySummary>>(
      "/analytics/salary-summary",
      { params: { country } }
    )

    return response.data.data
  },

  getJobTitleAverages: async (country: Country): Promise<JobTitleAverages> => {
    const response = await api.get<ApiResponse<JobTitleAverages>>(
      "/analytics/job-title-average",
      { params: { country } }
    )

    return response.data.data
  },
}
