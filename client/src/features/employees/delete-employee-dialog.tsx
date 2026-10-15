import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteEmployee } from "@/features/employees/employee-mutations"
import type { Employee } from "@/features/employees/employee-types"
import { toast } from "sonner"

type DeleteEmployeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
}

const DeleteEmployeeDialog = ({
  open,
  onOpenChange,
  employee,
}: DeleteEmployeeDialogProps) => {
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const deleteMutation = useDeleteEmployee()

  const handleOpenChange = (nextOpen: boolean) => {
    if (deleteMutation.isPending) return

    if (nextOpen) {
      setDeleteError(null)
    }

    onOpenChange(nextOpen)
  }

  const handleDelete = async () => {
    if (!employee || deleteMutation.isPending) return

    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(employee.id)

      toast.success("Employee deleted successfully", {
        description: `${employee.fullName} was removed from active employees.`,
      })

      onOpenChange(false)
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the employee. Please try again."
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete employee?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The employee record will be
            permanently deleted.
            {employee && (
              <span className="mt-2 block font-medium text-foreground">
                {employee.fullName} ({employee.email})
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteError}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleDelete()
            }}
            disabled={!employee || deleteMutation.isPending}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Employee"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteEmployeeDialog
