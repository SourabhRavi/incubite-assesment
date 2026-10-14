import type { Request, Response, NextFunction } from "express";
import * as analyticsService from "./analytics.service.js";
import { countryQuerySchema } from "./analytics.validator.js";

export const getSalarySummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = countryQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.issues,
      });
      return;
    }

    const summary = await analyticsService.getCountrySalarySummary(parsed.data);

    res.status(200).json({ data: summary });
  } catch (error: unknown) {
    next(error);
  }
};

export const getJobTitleAverages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = countryQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.issues,
      });
      return;
    }

    const result = await analyticsService.getJobTitleSalaryAverages(
      parsed.data,
    );

    res.status(200).json({ data: result });
  } catch (error: unknown) {
    next(error);
  }
};
