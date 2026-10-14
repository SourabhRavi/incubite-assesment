import { useMutation, useQueryClient } from "@tanstack/react-query"
import { employeeApi } from "@/features/employees/employee-api"
import { employeeKeys } from "@/features/employees/employee-queries"
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/features/employees/employee-types"

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeeApi.create(input),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: employeeKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics"],
        }),
      ])
    },
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      employeeApi.update(id, input),

    onSuccess: async (_employee, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: employeeKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics"],
        }),
      ])

      queryClient.setQueryData(employeeKeys.detail(variables.id), _employee)
    },
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeApi.remove(id),

    onSuccess: async (_result, id) => {
      queryClient.removeQueries({
        queryKey: employeeKeys.detail(id),
      })

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: employeeKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics"],
        }),
      ])
    },
  })
}
