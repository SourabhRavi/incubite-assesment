import { check, defineContract } from "@prisma/orm-postgres/contract-builder";

export const contract = defineContract({}, ({ field, model, rel }) => {
  const Employee = model("Employee", {
    fields: {
      id: field.id.uuidv7Native(),
      fullName: field.text(),
      email: field.text().unique(),
      jobTitle: field.text(),
      country: field.text(),
      salary: field.decimal(),
      createdAt: field.temporal.createdAtJsDate(),
      updatedAt: field.temporal.updatedAtJsDate(),
    },
  });

  return {
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
        ],
      })),
    },
  };
});
