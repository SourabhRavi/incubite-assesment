import {
  check,
  defineContract,
  enumType,
  member,
} from "@prisma/orm-postgres/contract-builder";

const Country = enumType(
  "Country",
  { codecId: "pg/text@1", nativeType: "text" } as const,
  member("India", "India"),
  member("United States", "United States"),
  member("United Kingdom", "United Kingdom"),
  member("Germany", "Germany"),
  member("Canada", "Canada"),
);

const Currency = enumType(
  "Currency",
  { codecId: "pg/text@1", nativeType: "text" } as const,
  member("INR", "INR"),
  member("USD", "USD"),
  member("GBP", "GBP"),
  member("EUR", "EUR"),
  member("CAD", "CAD"),
);

export const contract = defineContract({}, ({ field, model, rel }) => {
  const Employee = model("Employee", {
    fields: {
      id: field.id.uuidv7Native(),
      fullName: field.text(),
      email: field.text().unique(),
      jobTitle: field.text(),
      country: field.namedType(Country).default(Country.members.India),
      salary: field.decimal(),
      currency: field.namedType(Currency).default(Currency.members.INR),
      createdAt: field.temporal.createdAtJsDate(),
      updatedAt: field.temporal.updatedAtJsDate(),
    },
  });

  return {
    enums: {
      Country,
      Currency,
    },
    models: {
      Employee: Employee.sql(({ cols, constraints }) => ({
        table: "employees",
        indexes: [
          constraints.index([cols.country], {
            name: "employees_country_idx",
          }),
          constraints.index([cols.country, cols.jobTitle], {
            name: "employees_country_job_title_idx",
          }),
        ],
        checks: [
          check({
            expression: "salary >= 0",
            name: "employees_salary_nonnegative",
          }),
          check({
            expression: `(
              ("country" = 'India' AND "currency" = 'INR')
              OR ("country" = 'United States' AND "currency" = 'USD')
              OR ("country" = 'United Kingdom' AND "currency" = 'GBP')
              OR ("country" = 'Germany' AND "currency" = 'EUR')
              OR ("country" = 'Canada' AND "currency" = 'CAD')
            )`,
            name: "employees_country_currency_match",
          }),
        ],
      })),
    },
  };
});
