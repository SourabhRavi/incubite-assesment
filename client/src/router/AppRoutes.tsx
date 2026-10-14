import { Navigate, Route, Routes } from "react-router"

import AppLayout from "@/components/layout/app-layout.tsx"
import OverviewPage from "@/pages/overview/overview-page.tsx"
import EmployeesPage from "@/pages/emloyees/employees-page.tsx"
import NotFoundPage from "@/pages/not-found/not-found-page.tsx"

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
