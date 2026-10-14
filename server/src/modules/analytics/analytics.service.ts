import { db } from "../../prisma/db.js";
import { COUNTRY_CURRENCY_MAP } from "../../constants/constants.js";
import type { CountryQuery } from "./analytics.validator.js";

const employeeModel = db.orm.public.Employee;

export const getCountrySalarySummary = async (query: CountryQuery) => {
  const { country } = query;

  const summary = await employeeModel
    .where((employee) => employee.country.eq(country))
    .where((employee) => employee.deletedAt.isNull())
    .aggregate((aggregate) => ({
      employeeCount: aggregate.count(),
      minSalary: aggregate.min("salary"),
      maxSalary: aggregate.max("salary"),
      averageSalary: aggregate.avgDecimal("salary"),
    }));

  return {
    country,
    currency: COUNTRY_CURRENCY_MAP[country],
    employeeCount: summary.employeeCount,
    minSalary: summary.minSalary,
    maxSalary: summary.maxSalary,
    averageSalary: summary.averageSalary,
  };
};

export const getJobTitleSalaryAverages = async (query: CountryQuery) => {
  const { country } = query;

  const groups = await employeeModel
    .where((employee) => employee.country.eq(country))
    .where((employee) => employee.deletedAt.isNull())
    .groupBy("jobTitle")
    .orderBy((group) => group.jobTitle.asc())
    .aggregate((aggregate) => ({
      employeeCount: aggregate.count(),
      averageSalary: aggregate.avgDecimal("salary"),
    }));

  return {
    country,
    currency: COUNTRY_CURRENCY_MAP[country],
    data: groups.map((group) => ({
      jobTitle: group.jobTitle,
      employeeCount: group.employeeCount,
      averageSalary: group.averageSalary,
    })),
  };
};
