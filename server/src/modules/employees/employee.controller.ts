import type { Request, Response, NextFunction } from "express";
import * as employeeService from "./employee.service.js";
import {
  createEmployeeSchema,
  employeeIdSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from "./employee.validator.js";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = listEmployeesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.issues,
      });
      return;
    }

    const result = await employeeService.listEmployees(parsed.data);

    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsedId = employeeIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid employee UUIDv7" });
      return;
    }

    const employee = await employeeService.getEmployeeById(parsedId.data);

    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    res.status(200).json({ data: employee });
  } catch (error: unknown) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = createEmployeeSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsed.error.issues,
      });
      return;
    }

    const employee = await employeeService.createEmployee(parsed.data);

    res.status(201).json({ data: employee });
  } catch (error: unknown) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsedId = employeeIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid employee UUIDv7" });
      return;
    }

    const parsedBody = updateEmployeeSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        error: "Validation failed",
        details: parsedBody.error.issues,
      });
      return;
    }

    const employee = await employeeService.updateEmployee(
      parsedId.data,
      parsedBody.data,
    );

    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    res.status(200).json({ data: employee });
  } catch (error: unknown) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsedId = employeeIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      res.status(400).json({ error: "Invalid employee UUIDv7" });
      return;
    }

    const employee = await employeeService.deleteEmployee(parsedId.data);

    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    res.status(200).json({
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error: unknown) {
    next(error);
  }
};
