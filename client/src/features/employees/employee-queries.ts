import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { employeeApi } from "@/features/employees/employee-api"
import type { EmployeeFilters } from "@/features/employees/employee-types"

export const employeeKeys = {
  all: ["employees"] as const,

  lists: () => [...employeeKeys.all, "list"] as const,

  list: (filters: EmployeeFilters) =>
    [...employeeKeys.lists(), filters] as const,

  details: () => [...employeeKeys.all, "detail"] as const,

  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export const useEmployees = (filters: EmployeeFilters) =>
  useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeApi.list(filters),
    placeholderData: keepPreviousData,
  })

export const useEmployee = (id: string) =>
  useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeApi.getById(id),
    enabled: Boolean(id),
  })
