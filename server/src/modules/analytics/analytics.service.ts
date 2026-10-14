import { db } from "../../prisma/db.js";
import type { CountryQuery } from "./analytics.validator.js";

const employeeModel = db.orm.public.Employee;

export const getCountrySalarySummary = async (query: CountryQuery) => {
  const { country } = query;

  const summary = await employeeModel
    .where({ country })
    .aggregate((aggregate) => ({
      employeeCount: aggregate.count(),
      minSalary: aggregate.min("salary"),
      maxSalary: aggregate.max("salary"),
      averageSalary: aggregate.avgDecimal("salary"),
    }));

  return {
    country,
    employeeCount: summary.employeeCount,
    minSalary: summary.minSalary,
    maxSalary: summary.maxSalary,
    averageSalary: summary.averageSalary,
    currency: getCurrencyForCountry(country),
  };
};

export const getJobTitleSalaryAverages = async (query: CountryQuery) => {
  const { country } = query;

  const groups = await employeeModel
    .where({ country })
    .groupBy("jobTitle")
    .orderBy((group) => group.jobTitle.asc())
    .aggregate((aggregate) => ({
      employeeCount: aggregate.count(),
      averageSalary: aggregate.avgDecimal("salary"),
    }));

  return {
    country,
    currency: getCurrencyForCountry(country),
    data: groups.map((group) => ({
      jobTitle: group.jobTitle,
      employeeCount: group.employeeCount,
      averageSalary: group.averageSalary,
    })),
  };
};

const getCurrencyForCountry = (country: CountryQuery["country"]) => {
  const currencyMap = {
    India: "INR",
    "United States": "USD",
    "United Kingdom": "GBP",
    Germany: "EUR",
    Canada: "CAD",
  } as const;

  return currencyMap[country];
};
