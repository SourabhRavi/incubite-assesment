export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
] as const

export type Country = (typeof COUNTRIES)[number]

export const COUNTRY_CURRENCIES: Record<Country, string> = {
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Germany: "EUR",
  Canada: "CAD",
}

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

export type JobTitle = (typeof JOB_TITLES)[number]

export type Employee = {
  id: string
  fullName: string
  email: string
  jobTitle: string
  country: Country
  salary: number | string
  createdAt: string
  updatedAt: string
}

export type CreateEmployeeInput = {
  fullName: string
  email: string
  jobTitle: JobTitle
  country: Country
  salary: number
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>

export type EmployeeFilters = {
  page: number
  limit: number
  country?: Country
  jobTitle?: JobTitle
  search?: string
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

export type ApiResponse<T> = {
  data: T
}
