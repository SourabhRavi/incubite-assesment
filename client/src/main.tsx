import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"

import "@/index.css"
import App from "@/App"
import { ThemeProvider } from "@/components/theme-provider"
import { queryClient } from "@/lib/query-client.ts"
import { Toaster } from "@/components/ui/sonner.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" closeButton />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
