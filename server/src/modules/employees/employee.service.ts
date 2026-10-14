import { or } from "@prisma/orm-postgres/orm-client";

import { db } from "../../prisma/db.js";
import {
  COUNTRY_CURRENCY_MAP,
  type Country,
} from "../../constants/constants.js";
import type {
  CreateEmployeeInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from "./employee.validator.js";

const employeeModel = db.orm.public.Employee;

export const listEmployees = async (query: ListEmployeesQuery) => {
  const { page, limit, country, jobTitle, search } = query;

  const where = {
    ...(country ? { country } : {}),
    ...(jobTitle ? { jobTitle } : {}),
  };

  const employeesQuery = employeeModel
    .where((employee) => employee.deletedAt.isNull())
    .where(where);

  const countQuery = employeeModel
    .where((employee) => employee.deletedAt.isNull())
    .where(where);

  // Ordinary case-insensitive substring search across name and email.
  const filteredEmployees = search
    ? employeesQuery.where((employee) =>
        or(
          employee.fullName.ilike(`%${search}%`),
          employee.email.ilike(`%${search}%`),
        ),
      )
    : employeesQuery;

  const filteredCount = search
    ? countQuery
        .where((employee) =>
          or(
            employee.fullName.ilike(`%${search}%`),
            employee.email.ilike(`%${search}%`),
          ),
        )
        .aggregate((aggregate) => ({
          total: aggregate.count(),
        }))
    : countQuery.aggregate((aggregate) => ({
        total: aggregate.count(),
      }));

  const [employees, { total }] = await Promise.all([
    filteredEmployees
      .orderBy((employee) => employee.id.asc())
      .offset((page - 1) * limit)
      .limit(limit)
      .all(),

    filteredCount,
  ]);

  return {
    data: employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getEmployeeById = async (id: string) => {
  return employeeModel
    .where((employee) => employee.id.eq(id))
    .where((employee) => employee.deletedAt.isNull())
    .first();
};

export const createEmployee = async (input: CreateEmployeeInput) => {
  const country = input.country as Country;

  return employeeModel.create({
    fullName: input.fullName,
    email: input.email,
    jobTitle: input.jobTitle,
    country,
    currency: COUNTRY_CURRENCY_MAP[country],
    salary: String(input.salary),
  });
};

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput,
) => {
  const { country, salary, ...otherFields } = input;

  return employeeModel
    .where((employee) => employee.id.eq(id))
    .where((employee) => employee.deletedAt.isNull())
    .update({
      ...otherFields,
      ...(country !== undefined
        ? {
            country,
            currency: COUNTRY_CURRENCY_MAP[country],
          }
        : {}),
      ...(salary !== undefined ? { salary: String(salary) } : {}),
    });
};

export const deleteEmployee = async (id: string) => {
  return employeeModel
    .where({ id: id, deletedAt: null })
    .update({ deletedAt: new Date() });
};
