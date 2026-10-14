import { api } from "@/lib/api"
import type {
  ApiResponse,
  CreateEmployeeInput,
  Employee,
  EmployeeFilters,
  PaginatedEmployees,
  UpdateEmployeeInput,
} from "@/features/employees/employee-types"

export const employeeApi = {
  list: async (filters: EmployeeFilters): Promise<PaginatedEmployees> => {
    const response = await api.get<PaginatedEmployees>("/employees", {
      params: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        country: filters.country || undefined,
        jobTitle: filters.jobTitle || undefined,
      },
    })

    return response.data
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await api.get<ApiResponse<Employee>>(
      `/employees/${encodeURIComponent(id)}`
    )

    return response.data.data
  },

  create: async (input: CreateEmployeeInput): Promise<Employee> => {
    const response = await api.post<ApiResponse<Employee>>("/employees", input)

    return response.data.data
  },

  update: async (id: string, input: UpdateEmployeeInput): Promise<Employee> => {
    const response = await api.patch<ApiResponse<Employee>>(
      `/employees/${encodeURIComponent(id)}`,
      input
    )

    return response.data.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/employees/${encodeURIComponent(id)}`)
  },
}
