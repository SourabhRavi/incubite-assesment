import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { api } from "@/lib/api"
import EmployeesPage from "@/pages/emloyees/employees-page.tsx"

import type { PaginatedEmployees } from "@/features/employees/employee-types"

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const emptyEmployees: PaginatedEmployees = {
  data: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

const renderEmployeesPage = (initialEntry = "/employees") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/employees" element={<EmployeesPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const advanceTimers = async (milliseconds: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds)
  })
}

describe("EmployeesPage search", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()

    vi.mocked(api.get).mockResolvedValue({
      data: emptyEmployees,
    } as never)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("debounces search requests and sends the search term to the API", async () => {
    renderEmployeesPage()

    await advanceTimers(300)
    vi.mocked(api.get).mockClear()

    const searchInput = screen.getByRole("searchbox", {
      name: "Search employees",
    })

    fireEvent.change(searchInput, {
      target: { value: "A" },
    })

    await advanceTimers(100)

    fireEvent.change(searchInput, {
      target: { value: "Ad" },
    })

    await advanceTimers(100)

    fireEvent.change(searchInput, {
      target: { value: "Ada" },
    })

    await advanceTimers(299)

    expect(api.get).not.toHaveBeenCalled()

    await advanceTimers(1)

    expect(api.get).toHaveBeenCalledWith("/employees", {
      params: expect.objectContaining({
        search: "Ada",
        page: 1,
        limit: 20,
      }),
    })
  })

  it("clears search while preserving other filters and resetting pagination", async () => {
    renderEmployeesPage(
      "/employees?search=Ada&country=India&jobTitle=Software%20Engineer&page=3&limit=50"
    )

    await advanceTimers(300)
    vi.mocked(api.get).mockClear()

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear search",
      })
    )

    expect(api.get).toHaveBeenCalledWith("/employees", {
      params: expect.objectContaining({
        search: undefined,
        country: "India",
        jobTitle: "Software Engineer",
        page: 1,
        limit: 50,
      }),
    })
  })
})
