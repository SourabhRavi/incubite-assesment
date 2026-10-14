import { z } from "zod";

import {
  COUNTRIES,
  EMPLOYEE_LIMITS,
  JOB_TITLES,
} from "../../constants/constants.js";

const employeeFieldsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(EMPLOYEE_LIMITS.FULL_NAME_MIN_LENGTH)
    .max(EMPLOYEE_LIMITS.FULL_NAME_MAX_LENGTH),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email())
    .pipe(z.string().max(EMPLOYEE_LIMITS.EMAIL_MAX_LENGTH)),

  jobTitle: z.enum(JOB_TITLES),

  country: z.enum(COUNTRIES),

  salary: z.number().nonnegative(),
});

export const createEmployeeSchema = employeeFieldsSchema;

export const updateEmployeeSchema = employeeFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for an update",
  });

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(EMPLOYEE_LIMITS.DEFAULT_PAGE),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(EMPLOYEE_LIMITS.MAX_PAGE_SIZE)
    .default(EMPLOYEE_LIMITS.DEFAULT_PAGE_SIZE),

  country: z.enum(COUNTRIES).optional(),

  jobTitle: z.enum(JOB_TITLES).optional(),

  search: z.string().trim().max(30).optional(),
});

export const employeeIdSchema = z.uuidv7();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
