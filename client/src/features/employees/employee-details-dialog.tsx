import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  COUNTRY_CURRENCIES,
  type Employee,
} from "@/features/employees/employee-types"

type EmployeeDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee
}

const formatSalary = (employee: Employee) => {
  const currency = COUNTRY_CURRENCIES[employee.country]
  const amount = Number(employee.salary)

  if (!Number.isFinite(amount)) {
    return `${employee.salary} ${currency}`
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not available"
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-sm font-medium break-words">
      {value || "Not available"}
    </p>
  </div>
)

const EmployeeDetailsDialog = ({
  open,
  onOpenChange,
  employee,
}: EmployeeDetailsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Employee details</DialogTitle>
        <DialogDescription>
          View the employee's information and record timestamps.
        </DialogDescription>
      </DialogHeader>

      {employee && (
        <div className="grid grid-cols-1 gap-5 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <DetailItem label="Full name" value={employee.fullName} />
          </div>

          <div className="sm:col-span-2">
            <DetailItem label="Email" value={employee.email} />
          </div>

          <DetailItem label="Job title" value={employee.jobTitle} />
          <DetailItem label="Country" value={employee.country} />
          <DetailItem label="Salary" value={formatSalary(employee)} />
          <DetailItem label="Employee ID" value={employee.id} />
          <DetailItem
            label="Created at"
            value={formatDate(employee.createdAt)}
          />
          <DetailItem
            label="Last updated"
            value={formatDate(employee.updatedAt)}
          />
        </div>
      )}
    </DialogContent>
  </Dialog>
)

export default EmployeeDetailsDialog
