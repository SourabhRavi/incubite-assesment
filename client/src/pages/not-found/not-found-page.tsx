import { ArrowLeft, Command } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Command className="size-6" />
        </span>

        <p className="mt-6 font-heading text-sm font-semibold tracking-widest text-primary">
          ERROR 404
        </p>

        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This page doesn't exist or may have been moved. Let's get you back to
          your workspace.
        </p>

        <Button className="mt-6">
          <Link to="/overview">
            <ArrowLeft data-icon="inline-start" />
            Back to overview
          </Link>
        </Button>
      </div>
    </main>
  )
}
