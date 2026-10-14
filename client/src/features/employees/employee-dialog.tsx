import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import EmployeeForm from "@/features/employees/employee-form"
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "@/features/employees/employee-mutations"

import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from "@/features/employees/employee-types"

type EmployeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
}

const EmployeeDialog = ({
  open,
  onOpenChange,
  employee,
}: EmployeeDialogProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()

  const isEditing = Boolean(employee)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return
    }

    if (nextOpen) {
      setSubmitError(null)
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (
    input: CreateEmployeeInput | UpdateEmployeeInput
  ) => {
    setSubmitError(null)

    try {
      if (employee) {
        await updateMutation.mutateAsync({
          id: employee.id,
          input: input as UpdateEmployeeInput,
        })
      } else {
        await createMutation.mutateAsync(input as CreateEmployeeInput)
      }

      onOpenChange(false)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit employee" : "Add employee"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the employee's information below."
              : "Enter the employee's details to add them to your directory."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {submitError}
          </div>
        )}

        <EmployeeForm
          key={`${isEditing ? "edit" : "create"}-${employee?.id ?? "new"}`}
          employee={employee}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeDialog
