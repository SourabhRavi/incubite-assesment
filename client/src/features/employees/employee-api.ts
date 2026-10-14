import { api } from "@/lib/api"

export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
] as const

export const JOB_TITLES = [
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
] as const

export type Country = (typeof COUNTRIES)[number]
export type JobTitle = (typeof JOB_TITLES)[number]

export type Employee = {
  id: string
  fullName: string
  email: string
  jobTitle: string
  country: string
  salary: number | string
  currency?: string
  createdAt: string
  updatedAt: string
}

export type EmployeeFilters = {
  page: number
  limit: number
  country?: string
  jobTitle?: string
}

export type EmployeePagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type PaginatedEmployees = {
  data: Employee[]
  pagination: EmployeePagination
}

export const employeeApi = {
  list: async (filters: EmployeeFilters): Promise<PaginatedEmployees> => {
    const response = await api.get<PaginatedEmployees>("/employees", {
      params: {
        page: filters.page,
        limit: filters.limit,
        ...(filters.country ? { country: filters.country } : {}),
        ...(filters.jobTitle ? { jobTitle: filters.jobTitle } : {}),
      },
    })

    return response.data
  },
}
