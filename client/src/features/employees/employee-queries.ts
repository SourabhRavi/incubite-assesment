import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  employeeApi,
  type EmployeeFilters,
} from "@/features/employees/employee-api"

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: EmployeeFilters) =>
    [...employeeKeys.lists(), filters] as const,
}

export const useEmployees = (filters: EmployeeFilters) =>
  useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeApi.list(filters),
    placeholderData: keepPreviousData,
  })
