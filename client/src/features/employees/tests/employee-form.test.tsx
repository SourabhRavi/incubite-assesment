import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import EmployeeForm from "../employee-form"

describe("EmployeeForm", () => {
  it("prevents submission when email and salary are invalid", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    render(
      <EmployeeForm
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText("Full name"), "Test Employee")
    await user.type(screen.getByLabelText("Email address"), "invalid-email")
    await user.selectOptions(
      screen.getByLabelText("Job title"),
      "Software Engineer"
    )
    await user.selectOptions(screen.getByLabelText("Country"), "India")
    await user.type(screen.getByLabelText("Annual salary"), "0")

    await user.click(screen.getByRole("button", { name: "Add employee" }))

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument()

    expect(
      screen.getByText("Enter a salary greater than zero.")
    ).toBeInTheDocument()

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits valid employee data and updates currency by country", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onCancel = vi.fn()

    render(
      <EmployeeForm
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText("Full name"), "  Ada Lovelace  ")
    await user.type(screen.getByLabelText("Email address"), "ada@example.com")
    await user.selectOptions(
      screen.getByLabelText("Job title"),
      "Software Engineer"
    )
    await user.selectOptions(screen.getByLabelText("Country"), "Canada")

    expect(screen.getByText("CAD")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Annual salary"), "123456")
    await user.click(screen.getByRole("button", { name: "Add employee" }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        jobTitle: "Software Engineer",
        country: "Canada",
        salary: 123456,
      })
    })
  })
})
