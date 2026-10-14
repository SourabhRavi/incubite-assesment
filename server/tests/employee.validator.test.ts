import { expect, test } from "@jest/globals";

import { COUNTRY_CURRENCY_MAP, COUNTRIES } from "../src/constants/constants.js";

import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesQuerySchema,
} from "../src/modules/employees/employee.validator.js";

import { countryQuerySchema } from "../src/modules/analytics/analytics.validator.js";

const validEmployee = {
  fullName: "Ada Lovelace",
  email: "Ada@Example.com",
  jobTitle: "Software Engineer",
  country: "India",
  salary: 1_000_000,
};

test("accepts valid employee data and normalizes input", () => {
  const result = createEmployeeSchema.parse({
    ...validEmployee,
    fullName: "  Ada Lovelace  ",
    email: " Ada@Example.com ",
  });

  expect(result.fullName).toBe("Ada Lovelace");
  expect(result.email).toBe("ada@example.com");
});

test("rejects invalid email addresses", () => {
  expect(
    createEmployeeSchema.safeParse({
      ...validEmployee,
      email: "not-an-email",
    }).success,
  ).toBe(false);
});

test("rejects negative salaries", () => {
  expect(
    createEmployeeSchema.safeParse({
      ...validEmployee,
      salary: -100,
    }).success,
  ).toBe(false);
});

test("rejects unsupported countries", () => {
  expect(
    createEmployeeSchema.safeParse({
      ...validEmployee,
      country: "Atlantis",
    }).success,
  ).toBe(false);
});

test("rejects unsupported job titles", () => {
  expect(
    createEmployeeSchema.safeParse({
      ...validEmployee,
      jobTitle: "Wizard",
    }).success,
  ).toBe(false);
});

test("accepts partial employee updates", () => {
  expect(updateEmployeeSchema.parse({ salary: 1_200_000 })).toEqual({
    salary: 1_200_000,
  });
});

test("rejects empty employee updates", () => {
  expect(updateEmployeeSchema.safeParse({}).success).toBe(false);
});

test("applies default pagination values", () => {
  const result = listEmployeesQuerySchema.parse({});

  expect(result.page).toBe(1);
  expect(result.limit).toBe(20);
});

test("accepts valid pagination and filters", () => {
  const result = listEmployeesQuerySchema.parse({
    page: "2",
    limit: "50",
    country: "India",
    jobTitle: "Frontend Developer",
  });

  expect(result).toMatchObject({
    page: 2,
    limit: 50,
    country: "India",
    jobTitle: "Frontend Developer",
  });
});

test("rejects invalid pagination", () => {
  expect(listEmployeesQuerySchema.safeParse({ page: "0" }).success).toBe(false);

  expect(listEmployeesQuerySchema.safeParse({ limit: "101" }).success).toBe(
    false,
  );
});

test("validates analytics country queries", () => {
  expect(countryQuerySchema.safeParse({ country: "India" }).success).toBe(true);

  expect(countryQuerySchema.safeParse({ country: "Atlantis" }).success).toBe(
    false,
  );
});

test("maps supported countries to their correct currencies", () => {
  expect(COUNTRY_CURRENCY_MAP).toEqual({
    India: "INR",
    "United States": "USD",
    "United Kingdom": "GBP",
    Germany: "EUR",
    Canada: "CAD",
  });

  expect(Object.keys(COUNTRY_CURRENCY_MAP)).toHaveLength(COUNTRIES.length);
});
