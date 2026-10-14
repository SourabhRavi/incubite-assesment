import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  const databaseError = error as { sqlState?: unknown };

  if (databaseError?.sqlState === "23505") {
    res.status(409).json({
      error: "An employee with this email already exists",
    });
    return;
  }

  console.error("Unhandled application error:", error);

  res.status(500).json({
    error: "Internal server error",
  });
};
